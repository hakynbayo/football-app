import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

type Database = BetterSQLite3Database<typeof schema> | LibSQLDatabase<typeof schema> | null;

// Determine which database to use based on environment
const useTurso = process.env.TURSO_DATABASE_URL && process.env.NODE_ENV === "production";

let db: Database = null;

try {
  if (useTurso) {
    // Production: Use Turso (serverless-compatible)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createClient } = require("@libsql/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/libsql");

    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

    if (!tursoUrl) {
      console.warn("TURSO_DATABASE_URL not found. Database will not be available.");
    } else {
      const client = createClient({
        url: tursoUrl,
        authToken: tursoAuthToken,
      });

      db = drizzle(client, { schema });
      console.log("✅ Turso database connected (production mode)");
    }
  } else {
    // Development: Use local SQLite
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require("better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/better-sqlite3");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { migrate } = require("drizzle-orm/better-sqlite3/migrator");

    const sqlite = new Database("data.sqlite");
    db = drizzle(sqlite, { schema });

    // Run migrations for local database
    try {
      migrate(db, { migrationsFolder: "./drizzle" });
      console.log("✅ Local SQLite database connected (development mode)");
    } catch (error) {
      if (error instanceof Error && !error.message.includes("already exists")) {
        console.error("Migration error:", error);
      }
    }
  }
} catch (error) {
  console.error("Database initialization error:", error);
  // The app will handle this gracefully by checking if db is null
}

export { db };
