"use server";

import { db } from "@/lib/db";
import {
  feedInventory,
  feedStockMovements,
  type NewFeedInventory,
  type NewFeedStockMovement,
} from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get all feed inventory
export async function getFeedInventory() {
  return await db.query.feedInventory.findMany({
    orderBy: desc(feedInventory.createdAt),
  });
}

// Get feed by ID
export async function getFeedById(id: string) {
  const feed = await db.query.feedInventory.findFirst({
    where: eq(feedInventory.id, id),
  });

  if (!feed) return null;

  // Get stock movements
  const movements = await db.query.feedStockMovements.findMany({
    where: eq(feedStockMovements.feedId, id),
    orderBy: desc(feedStockMovements.date),
    with: {
      batch: true,
    },
  });

  return {
    ...feed,
    movements,
  };
}

// Create feed inventory
export async function createFeedInventory(
  data: Omit<NewFeedInventory, "id">
) {
  const id = uuidv4();

  await db.insert(feedInventory).values({
    ...data,
    id,
  });

  return { id };
}

// Update feed inventory
export async function updateFeedInventory(
  id: string,
  data: Partial<NewFeedInventory>
) {
  await db
    .update(feedInventory)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(feedInventory.id, id));

  return { id };
}

// Delete feed inventory
export async function deleteFeedInventory(id: string) {
  await db.delete(feedInventory).where(eq(feedInventory.id, id));
  return { id };
}

// Add stock movement
export async function addStockMovement(
  data: Omit<NewFeedStockMovement, "id">
) {
  const id = uuidv4();

  await db.insert(feedStockMovements).values({
    ...data,
    id,
  });

  // Update feed inventory stock
  const feed = await getFeedById(data.feedId);
  if (feed) {
    const newStock =
      data.type === "in"
        ? feed.currentStockKg + data.quantityKg
        : feed.currentStockKg - data.quantityKg;

    await db
      .update(feedInventory)
      .set({
        currentStockKg: Math.max(0, newStock),
        updatedAt: new Date(),
      })
      .where(eq(feedInventory.id, data.feedId));
  }

  return { id };
}

// Get low stock alerts
export async function getLowStockAlerts() {
  const feeds = await getFeedInventory();

  return feeds.filter((feed) => feed.currentStockKg <= feed.minStockAlert);
}

// Get feed consumption summary
export async function getFeedConsumptionSummary() {
  const feeds = await getFeedInventory();
  const movements = await db.query.feedStockMovements.findMany({
    where: eq(feedStockMovements.type, "out"),
    with: {
      feed: true,
    },
  });

  const totalConsumption = movements.reduce(
    (sum, m) => sum + m.quantityKg,
    0
  );

  const byFeedType = movements.reduce((acc, movement) => {
    const feedName = movement.feed?.name || "Unknown";
    if (!acc[feedName]) {
      acc[feedName] = 0;
    }
    acc[feedName] += movement.quantityKg;
    return acc;
  }, {} as Record<string, number>);

  return {
    totalConsumption: Number(totalConsumption.toFixed(2)),
    byFeedType,
    lowStock: feeds.filter((f) => f.currentStockKg <= f.minStockAlert),
  };
}
