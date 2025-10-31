import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const sqlite = new Database("data.sqlite");
export const db = drizzle(sqlite, { schema });

// Run migrations only once
try {
  migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Database migrations completed");
} catch (error) {
  // Migrations might have already run
  if (error instanceof Error && !error.message.includes("already exists")) {
    console.error("Migration error:", error);
  }
}
