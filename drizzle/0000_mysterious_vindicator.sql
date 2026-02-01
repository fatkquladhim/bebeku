CREATE TABLE `barns` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text NOT NULL,
	`capacity` integer NOT NULL,
	`location` text,
	`description` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `barns_code_unique` ON `barns` (`code`);--> statement-breakpoint
CREATE TABLE `batches` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text,
	`start_date` integer NOT NULL,
	`initial_population` integer NOT NULL,
	`current_population` integer NOT NULL,
	`target_harvest_age` integer DEFAULT 45 NOT NULL,
	`barn_id` text,
	`status` text DEFAULT 'active' NOT NULL,
	`harvest_date` integer,
	`harvest_weight_total` real,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`barn_id`) REFERENCES `barns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `batches_code_unique` ON `batches` (`code`);--> statement-breakpoint
CREATE TABLE `daily_records` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`record_date` integer NOT NULL,
	`mortality_count` integer DEFAULT 0 NOT NULL,
	`mortality_cause` text,
	`feed_morning_kg` real DEFAULT 0 NOT NULL,
	`feed_evening_kg` real DEFAULT 0 NOT NULL,
	`feed_type` text DEFAULT 'Starter 21%',
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `egg_records` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`record_date` integer NOT NULL,
	`total_eggs` integer DEFAULT 0 NOT NULL,
	`good_eggs` integer DEFAULT 0 NOT NULL,
	`damaged_eggs` integer DEFAULT 0 NOT NULL,
	`small_eggs` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `feed_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`protein_content` text,
	`current_stock_kg` real DEFAULT 0 NOT NULL,
	`min_stock_alert` real DEFAULT 100 NOT NULL,
	`unit_price` real,
	`supplier` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `feed_stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`feed_id` text NOT NULL,
	`type` text NOT NULL,
	`quantity_kg` real NOT NULL,
	`date` integer NOT NULL,
	`batch_id` text,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feed_inventory`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `finance_records` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text,
	`transaction_date` integer NOT NULL,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`amount` real NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `weight_records` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`record_date` integer NOT NULL,
	`average_weight_gr` real NOT NULL,
	`sample_size` integer DEFAULT 10 NOT NULL,
	`bird_age_days` integer NOT NULL,
	`notes` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
