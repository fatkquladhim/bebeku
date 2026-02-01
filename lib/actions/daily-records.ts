"use server";

import { db } from "@/lib/db";
import {
  dailyRecords,
  batches,
  type NewDailyRecord,
} from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get daily records for a batch
export async function getDailyRecords(batchId: string) {
  return await db.query.dailyRecords.findMany({
    where: eq(dailyRecords.batchId, batchId),
    orderBy: desc(dailyRecords.recordDate),
  });
}

// Get daily record by ID
export async function getDailyRecordById(id: string) {
  return await db.query.dailyRecords.findFirst({
    where: eq(dailyRecords.id, id),
  });
}

// Get daily record for a specific date
export async function getDailyRecordByDate(batchId: string, date: Date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await db.query.dailyRecords.findFirst({
    where: and(
      eq(dailyRecords.batchId, batchId),
      and(
        gte(dailyRecords.recordDate, startOfDay),
        lte(dailyRecords.recordDate, endOfDay)
      )
    ),
  });
}

import { gte, lte } from "drizzle-orm";

// Create daily record
export async function createDailyRecord(
  data: Omit<NewDailyRecord, "id">
) {
  const id = uuidv4();

  await db.insert(dailyRecords).values({
    ...data,
    id,
  });

  // Update batch current population
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, data.batchId),
  });

  if (batch) {
    const newPopulation = Math.max(
      0,
      batch.currentPopulation - (data.mortalityCount || 0)
    );
    await db
      .update(batches)
      .set({
        currentPopulation: newPopulation,
        updatedAt: new Date(),
      })
      .where(eq(batches.id, data.batchId));
  }

  return { id };
}

// Update daily record
export async function updateDailyRecord(
  id: string,
  data: Partial<NewDailyRecord>
) {
  const existingRecord = await getDailyRecordById(id);
  if (!existingRecord) throw new Error("Record not found");

  await db
    .update(dailyRecords)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(dailyRecords.id, id));

  // Recalculate batch population if mortality changed
  if (data.mortalityCount !== undefined) {
    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, existingRecord.batchId),
    });

    if (batch) {
      // Get all daily records to calculate total deaths
      const allRecords = await getDailyRecords(existingRecord.batchId);
      const totalDeaths = allRecords.reduce(
        (sum, record) => sum + record.mortalityCount,
        0
      );
      const newPopulation = Math.max(0, batch.initialPopulation - totalDeaths);

      await db
        .update(batches)
        .set({
          currentPopulation: newPopulation,
          updatedAt: new Date(),
        })
        .where(eq(batches.id, existingRecord.batchId));
    }
  }

  return { id };
}

// Delete daily record
export async function deleteDailyRecord(id: string) {
  const record = await getDailyRecordById(id);
  if (!record) throw new Error("Record not found");

  await db.delete(dailyRecords).where(eq(dailyRecords.id, id));

  // Recalculate batch population
  const batch = await db.query.batches.findFirst({
    where: eq(batches.id, record.batchId),
  });

  if (batch) {
    const allRecords = await getDailyRecords(record.batchId);
    const totalDeaths = allRecords.reduce(
      (sum, r) => sum + r.mortalityCount,
      0
    );
    const newPopulation = Math.max(0, batch.initialPopulation - totalDeaths);

    await db
      .update(batches)
      .set({
        currentPopulation: newPopulation,
        updatedAt: new Date(),
      })
      .where(eq(batches.id, record.batchId));
  }

  return { id };
}

// Get today's mortality for all batches
export async function getTodayMortality() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const records = await db.query.dailyRecords.findMany({
    where: and(
      gte(dailyRecords.recordDate, today),
      lte(dailyRecords.recordDate, tomorrow)
    ),
    with: {
      batch: true,
    },
  });

  const totalMortality = records.reduce(
    (sum, record) => sum + record.mortalityCount,
    0
  );

  return {
    totalMortality,
    records,
  };
}

// Get feed consumption for a date range
export async function getFeedConsumption(
  batchId: string,
  startDate: Date,
  endDate: Date
) {
  const records = await db.query.dailyRecords.findMany({
    where: and(
      eq(dailyRecords.batchId, batchId),
      and(
        gte(dailyRecords.recordDate, startDate),
        lte(dailyRecords.recordDate, endDate)
      )
    ),
  });

  const totalMorningFeed = records.reduce(
    (sum, record) => sum + record.feedMorningKg,
    0
  );
  const totalEveningFeed = records.reduce(
    (sum, record) => sum + record.feedEveningKg,
    0
  );
  const totalFeed = totalMorningFeed + totalEveningFeed;

  return {
    totalMorningFeed: Number(totalMorningFeed.toFixed(2)),
    totalEveningFeed: Number(totalEveningFeed.toFixed(2)),
    totalFeed: Number(totalFeed.toFixed(2)),
    records,
  };
}
