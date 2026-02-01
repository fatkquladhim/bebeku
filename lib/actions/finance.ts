"use server";

import { db } from "@/lib/db";
import {
  financeRecords,
  type NewFinanceRecord,
} from "@/lib/db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Get all finance records
export async function getFinanceRecords() {
  return await db.query.financeRecords.findMany({
    orderBy: desc(financeRecords.transactionDate),
    with: {
      batch: true,
    },
  });
}

// Get finance records by batch
export async function getFinanceRecordsByBatch(batchId: string) {
  return await db.query.financeRecords.findMany({
    where: eq(financeRecords.batchId, batchId),
    orderBy: desc(financeRecords.transactionDate),
  });
}

// Get finance record by ID
export async function getFinanceRecordById(id: string) {
  return await db.query.financeRecords.findFirst({
    where: eq(financeRecords.id, id),
    with: {
      batch: true,
    },
  });
}

// Create finance record
export async function createFinanceRecord(
  data: Omit<NewFinanceRecord, "id">
) {
  const id = uuidv4();

  await db.insert(financeRecords).values({
    ...data,
    id,
  });

  return { id };
}

// Update finance record
export async function updateFinanceRecord(
  id: string,
  data: Partial<NewFinanceRecord>
) {
  await db
    .update(financeRecords)
    .set(data)
    .where(eq(financeRecords.id, id));

  return { id };
}

// Delete finance record
export async function deleteFinanceRecord(id: string) {
  await db.delete(financeRecords).where(eq(financeRecords.id, id));
  return { id };
}

// Get finance summary
export async function getFinanceSummary(
  startDate?: Date,
  endDate?: Date,
  batchId?: string
) {
  let records = await db.query.financeRecords.findMany({
    with: {
      batch: true,
    },
  });

  // Filter by date range if provided
  if (startDate && endDate) {
    records = records.filter(
      (r) =>
        r.transactionDate >= startDate && r.transactionDate <= endDate
    );
  }

  // Filter by batch if provided
  if (batchId) {
    records = records.filter((r) => r.batchId === batchId);
  }

  const income = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const expense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  const balance = income - expense;

  // Group by category
  const byCategory = records.reduce((acc, record) => {
    const key = `${record.type}-${record.category}`;
    if (!acc[key]) {
      acc[key] = {
        type: record.type,
        category: record.category,
        amount: 0,
      };
    }
    acc[key].amount += record.amount;
    return acc;
  }, {} as Record<string, { type: string; category: string; amount: number }>);

  return {
    income,
    expense,
    balance,
    byCategory: Object.values(byCategory),
    records,
  };
}

// Get batch financial summary
export async function getBatchFinancialSummary(batchId: string) {
  const records = await getFinanceRecordsByBatch(batchId);

  const docCost = records
    .filter((r) => r.category === "doc")
    .reduce((sum, r) => sum + r.amount, 0);

  const feedCost = records
    .filter((r) => r.category === "pakan")
    .reduce((sum, r) => sum + r.amount, 0);

  const medicineCost = records
    .filter((r) => r.category === "obat")
    .reduce((sum, r) => sum + r.amount, 0);

  const laborCost = records
    .filter((r) => r.category === "tenaga_kerja")
    .reduce((sum, r) => sum + r.amount, 0);

  const otherCosts = records
    .filter(
      (r) =>
        r.type === "expense" &&
        !["doc", "pakan", "obat", "tenaga_kerja"].includes(r.category)
    )
    .reduce((sum, r) => sum + r.amount, 0);

  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter((r) => r.type === "expense")
    .reduce((sum, r) => sum + r.amount, 0);

  return {
    docCost,
    feedCost,
    medicineCost,
    laborCost,
    otherCosts,
    totalExpense,
    totalIncome,
    profit: totalIncome - totalExpense,
  };
}
