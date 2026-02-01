"use server";

import { db } from "@/lib/db";
import {
  eggRecords,
  type NewEggRecord,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get all egg records
export async function getEggRecords() {
  return await db.query.eggRecords.findMany({
    orderBy: desc(eggRecords.recordDate),
    with: {
      batch: true,
    },
  });
}

// Get egg records by batch
export async function getEggRecordsByBatch(batchId: string) {
  return await db.query.eggRecords.findMany({
    where: eq(eggRecords.batchId, batchId),
    orderBy: desc(eggRecords.recordDate),
  });
}

// Get egg record by ID
export async function getEggRecordById(id: string) {
  return await db.query.eggRecords.findFirst({
    where: eq(eggRecords.id, id),
    with: {
      batch: true,
    },
  });
}

// Create egg record
export async function createEggRecord(
  data: Omit<NewEggRecord, "id">
) {
  const id = uuidv4();

  await db.insert(eggRecords).values({
    ...data,
    id,
  });

  return { id };
}

// Update egg record
export async function updateEggRecord(
  id: string,
  data: Partial<NewEggRecord>
) {
  await db
    .update(eggRecords)
    .set(data)
    .where(eq(eggRecords.id, id));

  return { id };
}

// Delete egg record
export async function deleteEggRecord(id: string) {
  await db.delete(eggRecords).where(eq(eggRecords.id, id));
  return { id };
}

// Get egg production summary
export async function getEggProductionSummary(
  batchId?: string,
  startDate?: Date,
  endDate?: Date
) {
  let records = await db.query.eggRecords.findMany({
    with: {
      batch: true,
    },
  });

  if (batchId) {
    records = records.filter((r) => r.batchId === batchId);
  }

  if (startDate && endDate) {
    records = records.filter(
      (r) => r.recordDate >= startDate && r.recordDate <= endDate
    );
  }

  const totalEggs = records.reduce((sum, r) => sum + r.totalEggs, 0);
  const goodEggs = records.reduce((sum, r) => sum + r.goodEggs, 0);
  const damagedEggs = records.reduce((sum, r) => sum + r.damagedEggs, 0);
  const smallEggs = records.reduce((sum, r) => sum + r.smallEggs, 0);

  const goodRate = totalEggs > 0 ? (goodEggs / totalEggs) * 100 : 0;
  const damagedRate = totalEggs > 0 ? (damagedEggs / totalEggs) * 100 : 0;

  // Group by date for chart
  const byDate = records.reduce((acc, record) => {
    const dateStr = record.recordDate.toISOString().split("T")[0];
    if (!acc[dateStr]) {
      acc[dateStr] = {
        date: dateStr,
        totalEggs: 0,
        goodEggs: 0,
        damagedEggs: 0,
        smallEggs: 0,
      };
    }
    acc[dateStr].totalEggs += record.totalEggs;
    acc[dateStr].goodEggs += record.goodEggs;
    acc[dateStr].damagedEggs += record.damagedEggs;
    acc[dateStr].smallEggs += record.smallEggs;
    return acc;
  }, {} as Record<string, { date: string; totalEggs: number; goodEggs: number; damagedEggs: number; smallEggs: number }>);

  return {
    totalEggs,
    goodEggs,
    damagedEggs,
    smallEggs,
    goodRate: Number(goodRate.toFixed(2)),
    damagedRate: Number(damagedRate.toFixed(2)),
    byDate: Object.values(byDate).sort((a, b) =>
      a.date.localeCompare(b.date)
    ),
  };
}

// Get today's egg production
export async function getTodayEggProduction() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await db.query.eggRecords.findMany({
    where: and(
      gte(eggRecords.recordDate, today),
      lte(eggRecords.recordDate, tomorrow)
    ),
    with: {
      batch: true,
    },
  });

  const totalEggs = records.reduce((sum, r) => sum + r.totalEggs, 0);

  return {
    totalEggs,
    records,
  };
}
