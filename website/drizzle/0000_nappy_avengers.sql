CREATE TABLE `demo_usage` (
	`request_id` text PRIMARY KEY NOT NULL,
	`user_key` text NOT NULL,
	`day` text NOT NULL,
	`created_at` integer NOT NULL,
	`busy_until` integer NOT NULL,
	`input_tokens` integer,
	`output_tokens` integer,
	`total_tokens` integer
);
--> statement-breakpoint
CREATE INDEX `demo_usage_day_user_idx` ON `demo_usage` (`day`,`user_key`);--> statement-breakpoint
CREATE INDEX `demo_usage_user_busy_idx` ON `demo_usage` (`user_key`,`busy_until`);