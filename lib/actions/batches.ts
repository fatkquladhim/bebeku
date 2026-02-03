"use server";

import { db } from "@/lib/db";
import {
  batches,
  barns,
  dailyRecords,
  weightRecords,
  financeRecords,
  eggRecords,
  type NewBatch,
  type Batch,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import {
  calculateBirdAge,
  calculateMortalityRate,
  calculateBatchFCR,
} from "@/lib/utils/calculations";

// Get all batches
export async function getBatches(): Promise<Batch[]> {
  return await db.query.batches.findMany({
    orderBy: desc(batches.createdAt),
  });
}

// Get active batches
export async function getActiveBatches(): Promise<Batch[]> {
  return await db.query.batches.findMany({
    where: eq(batches.status, "active"),
    orderBy: desc(batches.createdAt),
  });
}

// Get batch by ID with related data
export async function getBatchById(id: string) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, id),
  });

  if (!batch) return null;

  // Get barn separately
  const barn = batch.barnId
    ? await db.query.barns.findFirst({
        where: eq(barns.id, batch.barnId),
      })
    : null;

  // Get daily records
  const dailyRecs = await db.query.dailyRecords.findMany({
    where: eq(dailyRecords.batchId, id),
    orderBy: desc(dailyRecords.recordDate),
  });

  // Get weight records
  const weightRecs = await db.query.weightRecords.findMany({
    where: eq(weightRecords.batchId, id),
    orderBy: desc(weightRecords.recordDate),
  });

  // Get finance records
  const financeRecs = await db.query.financeRecords.findMany({
    where: eq(financeRecords.batchId, id),
    orderBy: desc(financeRecords.transactionDate),
  });

  // Get egg records
  const eggRecs = await db.query.eggRecords.findMany({
    where: eq(eggRecords.batchId, id),
    orderBy: desc(eggRecords.recordDate),
  });

  // Calculate statistics
  const totalDeaths = dailyRecs.reduce(
    (sum, record) => sum + record.mortalityCount,
    0
  );

  const mortalityRate = calculateMortalityRate(
    totalDeaths,
    batch.initialPopulation
  );

  const birdAge = calculateBirdAge(batch.startDate);

  // Calculate FCR if weight records exist
  let fcr = 0;
  let totalFeedKg = 0;
  if (weightRecs.length > 0) {
    const latestWeight = weightRecs[0];
    const fcrResult = calculateBatchFCR(
      dailyRecs,
      batch.initialPopulation,
      latestWeight.averageWeightGr
    );
    fcr = fcrResult.fcr;
    totalFeedKg = fcrResult.totalFeedKg;
  }

  return {
    ...batch,
    barn,
    dailyRecords: dailyRecs,
    weightRecords: weightRecs,
    financeRecords: financeRecs,
    eggRecords: eggRecs,
    stats: {
      totalDeaths,
      mortalityRate,
      birdAge,
      fcr,
      totalFeedKg,
    },
  };
}

// Create new batch
export async function createBatch(data: Omit<NewBatch, "id" | "code">) {
  const id = uuidv4();

  // Generate batch code based on year and sequence
  const year = new Date().getFullYear();
  const existingBatches = await db.query.batches.findMany({
    where: gte(batches.code, `B-${year}-`),
  });
  const sequence = existingBatches.length + 1;
  const code = `B-${year}-${sequence.toString().padStart(3, "0")}`;

  await db.insert(batches).values({
    ...data,
    id,
    code,
    currentPopulation: data.initialPopulation,
  });

  return { id, code };
}

// Update batch
export async function updateBatch(
  id: string,
  data: Partial<NewBatch>
) {
  await db
    .update(batches)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(batches.id, id));

  return { id };
}

// Close/Complete batch
export async function closeBatch(
  id: string,
  harvestData: {
    harvestDate: Date;
    harvestWeightTotal: number;
  }
) {
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, id),
  });

  if (!batch) throw new Error("Batch not found");

  await db
    .update(batches)
    .set({
      status: "completed",
      harvestDate: harvestData.harvestDate,
      harvestWeightTotal: harvestData.harvestWeightTotal,
      updatedAt: new Date(),
    })
    .where(eq(batches.id, id));

  return { id };
}

// Delete batch
export async function deleteBatch(id: string) {
  await db.delete(batches).where(eq(batches.id, id));
  return { id };
}

// Get batch statistics for dashboard
export async function getBatchStats() {
  const allBatches = await getBatches();
  const activeBatches = allBatches.filter((b) => b.status === "active");

  const totalActivePopulation = activeBatches.reduce(
    (sum, batch) => sum + batch.currentPopulation,
    0
  );

  const totalInitialPopulation = activeBatches.reduce(
    (sum, batch) => sum + batch.initialPopulation,
    0
  );

  const totalDeaths = totalInitialPopulation - totalActivePopulation;
  const mortalityRate =
    totalInitialPopulation > 0
      ? (totalDeaths / totalInitialPopulation) * 100
      : 0;

  return {
    totalBatches: allBatches.length,
    activeBatches: activeBatches.length,
    totalActivePopulation,
    totalDeaths,
    mortalityRate: Number(mortalityRate.toFixed(2)),
  };
}
