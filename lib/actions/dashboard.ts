"use server";

import { db } from "@/lib/db";
import { batches, dailyRecords, eggRecords, financeRecords, feedInventory } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { calculateMortalityRate } from "@/lib/utils/calculations";

// Get dashboard statistics
export async function getDashboardStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Active batches
  const activeBatches = await db.query.batches.findMany({
    where: eq(batches.status, "active"),
  });

  const totalActivePopulation = activeBatches.reduce(
    (sum, b) => sum + b.currentPopulation,
    0
  );

  const totalInitialPopulation = activeBatches.reduce(
    (sum, b) => sum + b.initialPopulation,
    0
  );

  // Today's mortality
  const todayRecords = await db.query.dailyRecords.findMany({
    where: and(
      gte(dailyRecords.recordDate, today),
      lte(dailyRecords.recordDate, tomorrow)
    ),
  });

  const todayMortality = todayRecords.reduce(
    (sum, r) => sum + r.mortalityCount,
    0
  );

  const mortalityRate = calculateMortalityRate(
    totalInitialPopulation - totalActivePopulation,
    totalInitialPopulation
  );

  // Today's egg production
  const todayEggRecords = await db.query.eggRecords.findMany({
    where: and(
      gte(eggRecords.recordDate, today),
      lte(eggRecords.recordDate, tomorrow)
    ),
  });

  const todayEggs = todayEggRecords.reduce((sum, r) => sum + r.totalEggs, 0);

  // Low feed stock
  const feedStock = await db.query.feedInventory.findMany();
  const lowStockAlerts = feedStock.filter(
    (f) => f.currentStockKg <= f.minStockAlert
  );

  // Financial summary (this month)
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthRecords = await db.query.financeRecords.findMany({
    where: and(
      gte(financeRecords.transactionDate, startOfMonth),
      lte(financeRecords.transactionDate, now)
    ),
  });

  const monthIncome = monthRecords
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const monthExpense = monthRecords
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    activeBatches: activeBatches.length,
    totalActivePopulation,
    todayMortality,
    mortalityRate,
    todayEggs,
    lowStockCount: lowStockAlerts.length,
    monthIncome,
    monthExpense,
    monthProfit: monthIncome - monthExpense,
  };
}

// Get recent activities
export async function getRecentActivities(limit: number = 10) {
  const dailyRecs = await db.query.dailyRecords.findMany({
    orderBy: (dailyRecords, { desc }) => [desc(dailyRecords.createdAt)],
    limit,
  });

  const weightRecs = await db.query.weightRecords.findMany({
    orderBy: (weightRecords, { desc }) => [desc(weightRecords.createdAt)],
    limit,
  });

  const financeRecs = await db.query.financeRecords.findMany({
    orderBy: (financeRecords, { desc }) => [desc(financeRecords.createdAt)],
    limit,
  });

  // Fetch batch info for all records
    const batchIds = [
    ...new Set([
      ...dailyRecs.map(r => r.batchId),
      ...weightRecs.map(r => r.batchId),
      ...financeRecs.map(r => r.batchId),
    ])
  ].filter((id): id is string => id !== null);

  
  const batchMap = new Map();
  for (const batchId of batchIds) {
    const batch = await db.query.batches.findFirst({
      where: eq(batches.id, batchId),
    });
    if (batch) {
      batchMap.set(batchId, batch);
    }
  }

  // Combine and sort
  const activities = [
    ...dailyRecs.map((r) => {
      const batch = batchMap.get(r.batchId);
      return {
        id: r.id,
        type: "daily_record" as const,
        description: `Pencatatan harian: ${r.mortalityCount} mortalitas, ${r.feedMorningKg + r.feedEveningKg}kg pakan`,
        batchName: batch?.name || batch?.code || "Unknown",
        date: r.createdAt,
      };
    }),
    ...weightRecs.map((r) => {
      const batch = batchMap.get(r.batchId);
      return {
        id: r.id,
        type: "weight_record" as const,
        description: `Timbang: ${r.averageWeightGr}g (${r.sampleSize} ekor)`,
        batchName: batch?.name || batch?.code || "Unknown",
        date: r.createdAt,
      };
    }),
    ...financeRecs.map((r) => {
      const batch = r.batchId ? batchMap.get(r.batchId) : null;
      return {
        id: r.id,
        type: "finance" as const,
        description: `${r.type === "income" ? "Pemasukan" : "Pengeluaran"}: ${r.category} - Rp ${r.amount.toLocaleString()}`,
        batchName: batch?.name || batch?.code || "Umum",
        date: r.createdAt,
      };
    }),
  ];

  return activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// Get alerts
export async function getAlerts(): Promise<
  Array<{
    type: string;
    severity: "high" | "medium" | "low";
    message: string;
    batchId?: string;
    feedId?: string;
  }>
> {
  const alerts: Array<{
    type: string;
    severity: "high" | "medium" | "low";
    message: string;
    batchId?: string;
    feedId?: string;
  }> = [];

  // High mortality alerts
  const activeBatches = await db.query.batches.findMany({
    where: eq(batches.status, "active"),
  });

  for (const batch of activeBatches) {
    const dailyRecs = await db.query.dailyRecords.findMany({
      where: eq(dailyRecords.batchId, batch.id),
    });

    const totalDeaths = dailyRecs.reduce(
      (sum, r) => sum + r.mortalityCount,
      0
    );
    const mortalityRate = (totalDeaths / batch.initialPopulation) * 100;

    if (mortalityRate > 5) {
      alerts.push({
        type: "mortality",
        severity: mortalityRate > 10 ? "high" : "medium",
        message: `Mortalitas tinggi pada ${batch.code}: ${mortalityRate.toFixed(1)}%`,
        batchId: batch.id,
      });
    }
  }

  // Low feed stock alerts
  const feedStock = await db.query.feedInventory.findMany();
  for (const feed of feedStock) {
    if (feed.currentStockKg <= feed.minStockAlert) {
      alerts.push({
        type: "feed_stock",
        severity: feed.currentStockKg === 0 ? "high" : "medium",
        message: `Stok pakan ${feed.name} rendah: ${feed.currentStockKg}kg`,
        feedId: feed.id,
      });
    }
  }

  // Harvest ready alerts
  const now = new Date();
  for (const batch of activeBatches) {
    const age = Math.floor(
      (now.getTime() - new Date(batch.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (age >= batch.targetHarvestAge - 3) {
      alerts.push({
        type: "harvest",
        severity: age >= batch.targetHarvestAge ? "high" : "low",
        message: `${batch.code} siap panen (umur ${age} hari)`,
        batchId: batch.id,
      });
    }
  }

  return alerts;
}
