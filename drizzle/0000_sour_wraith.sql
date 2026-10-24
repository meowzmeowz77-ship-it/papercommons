CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`paper_id` text,
	`kind` text NOT NULL,
	`query` text DEFAULT '',
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `activity_user` ON `activity` (`user_id`,`kind`,`created_at`);--> statement-breakpoint
CREATE TABLE `collection_papers` (
	`collection_id` text NOT NULL,
	`paper_id` text NOT NULL,
	PRIMARY KEY(`collection_id`, `paper_id`),
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comment_likes` (
	`user_id` text NOT NULL,
	`comment_id` text NOT NULL,
	PRIMARY KEY(`user_id`, `comment_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `comments` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`user_id` text NOT NULL,
	`parent_id` text,
	`body` text NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `comments_paper` ON `comments` (`paper_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`user_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`difficulty` text,
	`useful` integer,
	`accurate` integer,
	PRIMARY KEY(`user_id`, `paper_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `files` (
	`id` text PRIMARY KEY NOT NULL,
	`paper_id` text NOT NULL,
	`key` text NOT NULL,
	`mime` text NOT NULL,
	`size` integer NOT NULL,
	`hash` text NOT NULL,
	`position` integer NOT NULL,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `files_paper` ON `files` (`paper_id`);--> statement-breakpoint
CREATE INDEX `files_hash` ON `files` (`hash`);--> statement-breakpoint
CREATE TABLE `follows` (
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	PRIMARY KEY(`follower_id`, `following_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`following_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `moderation` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_id` text NOT NULL,
	`target_id` text NOT NULL,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`message` text NOT NULL,
	`href` text DEFAULT '/profile',
	`read` integer DEFAULT 0,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `notifications_user` ON `notifications` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `papers` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '',
	`uploader_id` text NOT NULL,
	`board` text NOT NULL,
	`grade` text NOT NULL,
	`subject` text NOT NULL,
	`exam` text NOT NULL,
	`school` text DEFAULT '',
	`year` integer NOT NULL,
	`marks` integer DEFAULT 80,
	`duration` integer DEFAULT 180,
	`difficulty` text DEFAULT 'Medium',
	`chapters` text DEFAULT '',
	`answer_key` integer DEFAULT 0,
	`status` text DEFAULT 'pending' NOT NULL,
	`featured` integer DEFAULT 0,
	`sample` integer DEFAULT 0,
	`views` integer DEFAULT 0,
	`downloads` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`uploader_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `papers_slug` ON `papers` (`slug`);--> statement-breakpoint
CREATE INDEX `papers_filter` ON `papers` (`status`,`board`,`grade`,`subject`);--> statement-breakpoint
CREATE INDEX `papers_uploader` ON `papers` (`uploader_id`);--> statement-breakpoint
CREATE INDEX `papers_newest` ON `papers` (`created_at`);--> statement-breakpoint
CREATE TABLE `points` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`event` text NOT NULL,
	`value` integer NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `points_event` ON `points` (`event`);--> statement-breakpoint
CREATE TABLE `ratings` (
	`user_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`score` integer NOT NULL,
	PRIMARY KEY(`user_id`, `paper_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `ratings_paper` ON `ratings` (`paper_id`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`paper_id` text,
	`comment_id` text,
	`reason` text NOT NULL,
	`details` text DEFAULT '',
	`status` text DEFAULT 'open',
	`created_at` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`comment_id`) REFERENCES `comments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `saves` (
	`user_id` text NOT NULL,
	`paper_id` text NOT NULL,
	`created_at` text NOT NULL,
	PRIMARY KEY(`user_id`, `paper_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`paper_id`) REFERENCES `papers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `taxonomy` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`name` text NOT NULL,
	`position` integer DEFAULT 0,
	`enabled` integer DEFAULT 1
);
--> statement-breakpoint
CREATE UNIQUE INDEX `taxonomy_kind_name` ON `taxonomy` (`kind`,`name`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`display_name` text NOT NULL,
	`avatar` text DEFAULT '',
	`board` text DEFAULT 'CBSE',
	`grade` text DEFAULT '10',
	`school` text DEFAULT '',
	`city` text DEFAULT '',
	`role` text DEFAULT 'student' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`plan` text DEFAULT 'free',
	`notify` integer DEFAULT 1,
	`onboarded` integer DEFAULT 0,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username` ON `users` (`username`);