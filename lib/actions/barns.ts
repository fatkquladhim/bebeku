"use server";

import { db } from "@/lib/db";
import { barns, batches, type NewBarn } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get all barns
export async function getBarns() {
  return await db.query.barns.findMany({
    orderBy: desc(barns.createdAt),
  });
}

// Get active barns
export async function getActiveBarns() {
  return await db.query.barns.findMany({
    where: eq(barns.status, "active"),
    orderBy: desc(barns.createdAt),
  });
}

// Get barn by ID
export async function getBarnById(id: string) {
  const barn = await db.query.barns.findFirst({
    where: eq(barns.id, id),
  });

  if (!barn) return null;

  // Get batches in this barn
  const barnBatches = await db.query.batches.findMany({
    where: eq(batches.barnId, id),
    orderBy: desc(batches.startDate),
  });

  // Calculate statistics
  const activeBatches = barnBatches.filter((b) => b.status === "active");
  const totalPopulation = activeBatches.reduce(
    (sum, b) => sum + b.currentPopulation,
    0
  );
  const capacityUsed = barn.capacity > 0 ? (totalPopulation / barn.capacity) * 100 : 0;

  return {
    ...barn,
    batches: barnBatches,
    stats: {
      totalBatches: barnBatches.length,
      activeBatches: activeBatches.length,
      totalPopulation,
      capacityUsed: Number(capacityUsed.toFixed(1)),
    },
  };
}

// Create barn
export async function createBarn(data: Omit<NewBarn, "id" | "code">) {
  const id = uuidv4();

  // Generate barn code
  const existingBarns = await getBarns();
  const sequence = existingBarns.length + 1;
  const code = `K-${sequence.toString().padStart(3, "0")}`;

  await db.insert(barns).values({
    ...data,
    id,
    code,
  });

  return { id, code };
}

// Update barn
export async function updateBarn(id: string, data: Partial<NewBarn>) {
  await db
    .update(barns)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(barns.id, id));

  return { id };
}

// Delete barn
export async function deleteBarn(id: string) {
  // Check if barn has active batches
  const activeBatches = await db.query.batches.findMany({
    where: eq(batches.barnId, id),
  });

  if (activeBatches.some((b) => b.status === "active")) {
    throw new Error("Cannot delete barn with active batches");
  }

  await db.delete(barns).where(eq(barns.id, id));
  return { id };
}

// Get barn performance metrics
export async function getBarnPerformance(barnId: string) {
  const barnBatches = await db.query.batches.findMany({
    where: eq(batches.barnId, barnId),
  });

  const completedBatches = barnBatches.filter((b) => b.status === "completed");

  if (completedBatches.length === 0) {
    return {
      avgMortalityRate: 0,
      avgFCR: 0,
      totalBatches: barnBatches.length,
      completedBatches: 0,
    };
  }

  // Calculate average metrics from completed batches
  const avgMortalityRate =
    completedBatches.reduce((sum, b) => {
      const mortalityRate =
        ((b.initialPopulation - (b.currentPopulation || 0)) /
          b.initialPopulation) *
        100;
      return sum + mortalityRate;
    }, 0) / completedBatches.length;

  return {
    avgMortalityRate: Number(avgMortalityRate.toFixed(2)),
    avgFCR: 0, // Would need daily records calculation
    totalBatches: barnBatches.length,
    completedBatches: completedBatches.length,
  };
}
