CREATE TABLE IF NOT EXISTS `goal_events` (
	`id` text PRIMARY KEY NOT NULL,
	`match_id` text NOT NULL,
	`team` text NOT NULL,
	`scorer` text NOT NULL,
	`assist` text,
	`created_at` integer NOT NULL
);
