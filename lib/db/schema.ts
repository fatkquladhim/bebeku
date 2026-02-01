import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { sql, relations } from "drizzle-orm";

// Barns/Kandang table
export const barns = sqliteTable("barns", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  capacity: integer("capacity").notNull(),
  location: text("location"),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, inactive, maintenance
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Batches table
export const batches = sqliteTable("batches", {
  id: text("id").primaryKey(),
  code: text("code").notNull().unique(), // B-YYYY-NNN format
  name: text("name"),
  startDate: integer("start_date", { mode: "timestamp" }).notNull(),
  initialPopulation: integer("initial_population").notNull(),
  currentPopulation: integer("current_population").notNull(),
  targetHarvestAge: integer("target_harvest_age").notNull().default(45),
  barnId: text("barn_id"),
  status: text("status").notNull().default("active"), // active, completed, cancelled
  harvestDate: integer("harvest_date", { mode: "timestamp" }),
  harvestWeightTotal: real("harvest_weight_total"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Daily records (mortalitas, pakan)
export const dailyRecords = sqliteTable("daily_records", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  recordDate: integer("record_date", { mode: "timestamp" }).notNull(),
  mortalityCount: integer("mortality_count").notNull().default(0),
  mortalityCause: text("mortality_cause"),
  feedMorningKg: real("feed_morning_kg").notNull().default(0),
  feedEveningKg: real("feed_evening_kg").notNull().default(0),
  feedType: text("feed_type").default("Starter 21%"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Weight records (sampling berat badan)
export const weightRecords = sqliteTable("weight_records", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  recordDate: integer("record_date", { mode: "timestamp" }).notNull(),
  averageWeightGr: real("average_weight_gr").notNull(), // in grams
  sampleSize: integer("sample_size").notNull().default(10),
  birdAgeDays: integer("bird_age_days").notNull(),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Egg production records
export const eggRecords = sqliteTable("egg_records", {
  id: text("id").primaryKey(),
  batchId: text("batch_id").notNull(),
  recordDate: integer("record_date", { mode: "timestamp" }).notNull(),
  totalEggs: integer("total_eggs").notNull().default(0),
  goodEggs: integer("good_eggs").notNull().default(0),
  damagedEggs: integer("damaged_eggs").notNull().default(0),
  smallEggs: integer("small_eggs").notNull().default(0),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Finance records
export const financeRecords = sqliteTable("finance_records", {
  id: text("id").primaryKey(),
  batchId: text("batch_id"),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(),
  type: text("type").notNull(), // income, expense
  category: text("category").notNull(), // pakan, obat, doc, tenaga_kerja, penjualan_bebek, etc
  amount: real("amount").notNull(),
  description: text("description"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Feed inventory
export const feedInventory = sqliteTable("feed_inventory", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // starter, grower, finisher
  proteinContent: text("protein_content"), // e.g., "21%"
  currentStockKg: real("current_stock_kg").notNull().default(0),
  minStockAlert: real("min_stock_alert").notNull().default(100),
  unitPrice: real("unit_price"), // per kg
  supplier: text("supplier"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// Feed stock movements
export const feedStockMovements = sqliteTable("feed_stock_movements", {
  id: text("id").primaryKey(),
  feedId: text("feed_id").notNull(),
  type: text("type").notNull(), // in (purchase), out (consumption)
  quantityKg: real("quantity_kg").notNull(),
  date: integer("date", { mode: "timestamp" }).notNull(),
  batchId: text("batch_id"),
  notes: text("notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

// ============================================
// RELATIONS - Define table relationships here
// ============================================

export const barnsRelations = relations(barns, ({ many }) => ({
  batches: many(batches),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  barn: one(barns, {
    fields: [batches.barnId],
    references: [barns.id],
  }),
  dailyRecords: many(dailyRecords),
  weightRecords: many(weightRecords),
  eggRecords: many(eggRecords),
  financeRecords: many(financeRecords),
  feedStockMovements: many(feedStockMovements),
}));

export const dailyRecordsRelations = relations(dailyRecords, ({ one }) => ({
  batch: one(batches, {
    fields: [dailyRecords.batchId],
    references: [batches.id],
  }),
}));

export const weightRecordsRelations = relations(weightRecords, ({ one }) => ({
  batch: one(batches, {
    fields: [weightRecords.batchId],
    references: [batches.id],
  }),
}));

export const eggRecordsRelations = relations(eggRecords, ({ one }) => ({
  batch: one(batches, {
    fields: [eggRecords.batchId],
    references: [batches.id],
  }),
}));

export const financeRecordsRelations = relations(financeRecords, ({ one }) => ({
  batch: one(batches, {
    fields: [financeRecords.batchId],
    references: [batches.id],
  }),
}));

export const feedInventoryRelations = relations(feedInventory, ({ many }) => ({
  movements: many(feedStockMovements),
}));

export const feedStockMovementsRelations = relations(feedStockMovements, ({ one }) => ({
  feed: one(feedInventory, {
    fields: [feedStockMovements.feedId],
    references: [feedInventory.id],
  }),
  batch: one(batches, {
    fields: [feedStockMovements.batchId],
    references: [batches.id],
  }),
}));

// ============================================
// TYPES - TypeScript type definitions
// ============================================

export type Barn = typeof barns.$inferSelect;
export type NewBarn = typeof barns.$inferInsert;

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;

export type DailyRecord = typeof dailyRecords.$inferSelect;
export type NewDailyRecord = typeof dailyRecords.$inferInsert;

export type WeightRecord = typeof weightRecords.$inferSelect;
export type NewWeightRecord = typeof weightRecords.$inferInsert;

export type EggRecord = typeof eggRecords.$inferSelect;
export type NewEggRecord = typeof eggRecords.$inferInsert;

export type FinanceRecord = typeof financeRecords.$inferSelect;
export type NewFinanceRecord = typeof financeRecords.$inferInsert;

export type FeedInventory = typeof feedInventory.$inferSelect;
export type NewFeedInventory = typeof feedInventory.$inferInsert;

export type FeedStockMovement = typeof feedStockMovements.$inferSelect;
export type NewFeedStockMovement = typeof feedStockMovements.$inferInsert;
