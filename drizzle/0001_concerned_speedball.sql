CREATE TABLE `analytics_events` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_key` text NOT NULL,
	`user_id` text,
	`kind` text NOT NULL,
	`path` text NOT NULL,
	`paper_id` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `analytics_created` ON `analytics_events` (`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_path` ON `analytics_events` (`path`,`created_at`);--> statement-breakpoint
CREATE INDEX `analytics_actor` ON `analytics_events` (`actor_key`,`kind`,`created_at`);--> statement-breakpoint
CREATE TABLE `premium_interest` (
	`user_id` text PRIMARY KEY NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` ADD `premium_until` text;
--> statement-breakpoint
UPDATE users SET premium_until=strftime('%Y-%m-%dT%H:%M:%fZ','now','+30 days') WHERE plan='premium' AND premium_until IS NULL;
