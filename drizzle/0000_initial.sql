-- Initial migration for PostgreSQL/Neon

CREATE TABLE IF NOT EXISTS "barns" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	"capacity" integer NOT NULL,
	"location" text,
	"description" text,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "barns_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "batches" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text,
	"start_date" timestamp with time zone NOT NULL,
	"initial_population" integer NOT NULL,
	"current_population" integer NOT NULL,
	"target_harvest_age" integer DEFAULT 45 NOT NULL,
	"barn_id" text,
	"status" text DEFAULT 'active' NOT NULL,
	"harvest_date" timestamp with time zone,
	"harvest_weight_total" real,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batches_code_unique" UNIQUE("code")
);

CREATE TABLE IF NOT EXISTS "daily_records" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"record_date" timestamp with time zone NOT NULL,
	"mortality_count" integer DEFAULT 0 NOT NULL,
	"mortality_cause" text,
	"feed_morning_kg" real DEFAULT 0 NOT NULL,
	"feed_evening_kg" real DEFAULT 0 NOT NULL,
	"feed_type" text DEFAULT 'Starter 21%',
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "weight_records" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"record_date" timestamp with time zone NOT NULL,
	"average_weight_gr" real NOT NULL,
	"sample_size" integer DEFAULT 10 NOT NULL,
	"bird_age_days" integer NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "egg_records" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text NOT NULL,
	"record_date" timestamp with time zone NOT NULL,
	"total_eggs" integer DEFAULT 0 NOT NULL,
	"good_eggs" integer DEFAULT 0 NOT NULL,
	"damaged_eggs" integer DEFAULT 0 NOT NULL,
	"small_eggs" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "finance_records" (
	"id" text PRIMARY KEY NOT NULL,
	"batch_id" text,
	"transaction_date" timestamp with time zone NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"amount" real NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "feed_inventory" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"protein_content" text,
	"current_stock_kg" real DEFAULT 0 NOT NULL,
	"min_stock_alert" real DEFAULT 100 NOT NULL,
	"unit_price" real,
	"supplier" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "feed_stock_movements" (
	"id" text PRIMARY KEY NOT NULL,
	"feed_id" text NOT NULL,
	"type" text NOT NULL,
	"quantity_kg" real NOT NULL,
	"date" timestamp with time zone NOT NULL,
	"batch_id" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Foreign Keys
ALTER TABLE "batches" ADD CONSTRAINT "batches_barn_id_barns_id_fk" 
	FOREIGN KEY ("barn_id") REFERENCES "barns"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "daily_records" ADD CONSTRAINT "daily_records_batch_id_batches_id_fk" 
	FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_batch_id_batches_id_fk" 
	FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "egg_records" ADD CONSTRAINT "egg_records_batch_id_batches_id_fk" 
	FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "finance_records" ADD CONSTRAINT "finance_records_batch_id_batches_id_fk" 
	FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE set null ON UPDATE no action;

ALTER TABLE "feed_stock_movements" ADD CONSTRAINT "feed_stock_movements_feed_id_feed_inventory_id_fk" 
	FOREIGN KEY ("feed_id") REFERENCES "feed_inventory"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "feed_stock_movements" ADD CONSTRAINT "feed_stock_movements_batch_id_batches_id_fk" 
	FOREIGN KEY ("batch_id") REFERENCES "batches"("id") ON DELETE set null ON UPDATE no action;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "idx_batches_status" ON "batches"("status");
CREATE INDEX IF NOT EXISTS "idx_batches_barn_id" ON "batches"("barn_id");
CREATE INDEX IF NOT EXISTS "idx_daily_records_batch_id" ON "daily_records"("batch_id");
CREATE INDEX IF NOT EXISTS "idx_daily_records_date" ON "daily_records"("record_date");
CREATE INDEX IF NOT EXISTS "idx_weight_records_batch_id" ON "weight_records"("batch_id");
CREATE INDEX IF NOT EXISTS "idx_egg_records_batch_id" ON "egg_records"("batch_id");
CREATE INDEX IF NOT EXISTS "idx_finance_records_date" ON "finance_records"("transaction_date");
CREATE INDEX IF NOT EXISTS "idx_feed_stock_movements_feed_id" ON "feed_stock_movements"("feed_id");