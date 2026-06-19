CREATE TABLE IF NOT EXISTS `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`players` text NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text
);

CREATE TABLE IF NOT EXISTS `matches` (
	`id` text PRIMARY KEY NOT NULL,
	`team_a` text NOT NULL,
	`team_b` text NOT NULL,
	`score_a` integer NOT NULL,
	`score_b` integer NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text
);

CREATE TABLE IF NOT EXISTS `team_of_the_week` (
	`id` text PRIMARY KEY NOT NULL,
	`month` text NOT NULL,
	`team_name` text NOT NULL,
	`players` text NOT NULL,
	`date` text NOT NULL,
	`created_at` integer NOT NULL,
	`created_by` text
);

CREATE UNIQUE INDEX IF NOT EXISTS `team_of_the_week_month_unique` ON `team_of_the_week` (`month`);
