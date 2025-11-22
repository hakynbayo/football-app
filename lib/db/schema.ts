import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"), // 'admin' or 'user'
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// Shared app data tables (all users see the same data)
export const appTeams = sqliteTable("app_teams", {
  id: text("id").primaryKey(),
  data: text("data").notNull(), // JSON string of Team[]
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"), // User ID who last updated
});

export const appMatches = sqliteTable("app_matches", {
  id: text("id").primaryKey(),
  data: text("data").notNull(), // JSON string of MatchResult[]
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"), // User ID who last updated
});

export const appStats = sqliteTable("app_stats", {
  id: text("id").primaryKey(),
  data: text("data").notNull(), // JSON string of TeamStats[]
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"), // User ID who last updated
});

export const appTeamOfTheWeek = sqliteTable("app_team_of_week", {
  id: text("id").primaryKey(),
  data: text("data"), // JSON string of TeamOfTheWeek | null
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"), // User ID who last updated
});

export const appTeamOfTheWeekHistory = sqliteTable("app_team_of_week_history", {
  id: text("id").primaryKey(),
  data: text("data").notNull(), // JSON string of TeamOfTheWeek[]
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  updatedBy: text("updated_by"), // User ID who last updated
});
