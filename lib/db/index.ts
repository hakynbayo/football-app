import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

// Handle database initialization with error handling for serverless environments
let sqlite: Database.Database | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

try {
  // Try to use a writable location, fallback to /tmp in serverless
  const dbPath =
    process.env.DATABASE_PATH ||
    (process.env.VERCEL || process.env.NETLIFY
      ? "/tmp/data.sqlite"
      : "data.sqlite");

  sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema });

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
} catch (error) {
  console.error("Database initialization error:", error);
  // In serverless environments, SQLite may not work
  // The app will need to handle this gracefully
}

export { db };
