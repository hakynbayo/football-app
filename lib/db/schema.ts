import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// Users table (unchanged)
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Teams: one row per team
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  players: text("players").notNull(), // JSON array of player names
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by"),
});

// Matches: one row per match
export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  teamA: text("team_a").notNull(),
  teamB: text("team_b").notNull(),
  scoreA: integer("score_a").notNull(),
  scoreB: integer("score_b").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by"),
});

// Goal events: one row per goal scored in a match
export const goalEvents = sqliteTable("goal_events", {
  id: text("id").primaryKey(),
  matchId: text("match_id").notNull(),
  team: text("team").notNull(),
  scorer: text("scorer").notNull(),
  assist: text("assist"), // nullable - not every goal has an assist
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Team of the week: one row per month entry
export const teamOfTheWeek = sqliteTable("team_of_the_week", {
  id: text("id").primaryKey(),
  month: text("month").notNull().unique(), // e.g. "2025-06"
  teamName: text("team_name").notNull(),
  players: text("players").notNull(), // JSON array of player names
  date: text("date").notNull(), // human-readable date string
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  createdBy: text("created_by"),
});

// Legacy tables kept for migration compatibility (will not be used)
export const appTeams = sqliteTable("app_teams", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"),
});

export const appMatches = sqliteTable("app_matches", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"),
});

export const appStats = sqliteTable("app_stats", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"),
});

export const appTeamOfTheWeek = sqliteTable("app_team_of_week", {
  id: text("id").primaryKey(),
  data: text("data"),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"),
});

export const appTeamOfTheWeekHistory = sqliteTable("app_team_of_week_history", {
  id: text("id").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"),
});
