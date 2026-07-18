CREATE TABLE IF NOT EXISTS `player_stats` (
	`id` text PRIMARY KEY NOT NULL,
	`player` text NOT NULL UNIQUE,
	`goals` integer NOT NULL DEFAULT 0,
	`assists` integer NOT NULL DEFAULT 0,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`created_by` text
);
