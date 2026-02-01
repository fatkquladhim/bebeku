"use server";

import { db } from "@/lib/db";
import {
  weightRecords,
  type NewWeightRecord,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get weight records by batch
export async function getWeightRecordsByBatch(batchId: string) {
  return await db.query.weightRecords.findMany({
    where: eq(weightRecords.batchId, batchId),
    orderBy: desc(weightRecords.recordDate),
  });
}

// Get weight record by ID
export async function getWeightRecordById(id: string) {
  return await db.query.weightRecords.findFirst({
    where: eq(weightRecords.id, id),
  });
}

// Create weight record
export async function createWeightRecord(
  data: Omit<NewWeightRecord, "id">
) {
  const id = uuidv4();

  await db.insert(weightRecords).values({
    ...data,
    id,
  });

  return { id };
}

// Update weight record
export async function updateWeightRecord(
  id: string,
  data: Partial<NewWeightRecord>
) {
  await db
    .update(weightRecords)
    .set(data)
    .where(eq(weightRecords.id, id));

  return { id };
}

// Delete weight record
export async function deleteWeightRecord(id: string) {
  await db.delete(weightRecords).where(eq(weightRecords.id, id));
  return { id };
}

// Get weight data for chart
export async function getWeightChartData(batchId: string) {
  const records = await db.query.weightRecords.findMany({
    where: eq(weightRecords.batchId, batchId),
    orderBy: weightRecords.birdAgeDays,
  });

  return records.map((record) => ({
    age: record.birdAgeDays,
    weight: record.averageWeightGr,
    date: record.recordDate.toISOString().split("T")[0],
  }));
}

// Get latest weight record for batch
export async function getLatestWeightRecord(batchId: string) {
  const records = await db.query.weightRecords.findMany({
    where: eq(weightRecords.batchId, batchId),
    orderBy: desc(weightRecords.recordDate),
    limit: 1,
  });

  return records[0] || null;
}

// Calculate average daily gain (ADG)
export async function calculateADG(batchId: string) {
  const records = await db.query.weightRecords.findMany({
    where: eq(weightRecords.batchId, batchId),
    orderBy: weightRecords.birdAgeDays,
  });

  if (records.length < 2) return 0;

  const firstRecord = records[0];
  const lastRecord = records[records.length - 1];

  const weightGain = lastRecord.averageWeightGr - firstRecord.averageWeightGr;
  const days = lastRecord.birdAgeDays - firstRecord.birdAgeDays;

  if (days <= 0) return 0;

  return Number((weightGain / days).toFixed(2));
}
