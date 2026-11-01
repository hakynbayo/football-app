import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "./schema";

const fs = require("node:fs");
const path = require("node:path");

type Database =
  | BetterSQLite3Database<typeof schema>
  | LibSQLDatabase<typeof schema>
  | null;

function runLocalSqliteMigrations(sqlite: any) {
  const migrationsDir = path.join(process.cwd(), "drizzle");

  if (!fs.existsSync(migrationsDir)) {
    return;
  }

  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((file: string) => file.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf8");
    const statements = sql
      .split("--> statement-breakpoint")
      .map((statement: string) => statement.trim())
      .filter(Boolean)
      .join(";");

    if (!statements) continue;

    try {
      sqlite.exec(statements);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const isAlreadyApplied = [
        "already exists",
        "duplicate column",
        "duplicate index",
        "duplicate table",
      ].some((fragment) => message.toLowerCase().includes(fragment));

      if (!isAlreadyApplied) {
        throw error;
      }
    }
  }
}

// Determine which database to use based on environment
// Use Turso if URL is provided, otherwise use local SQLite
const useTurso = !!process.env.TURSO_DATABASE_URL;

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
      console.warn(
        "TURSO_DATABASE_URL not found. Database will not be available.",
      );
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

    const sqlite = new Database("data.sqlite");
    db = drizzle(sqlite, { schema });

    // Run migrations for local database using sqlite.exec so multi-statement SQL files work correctly.
    try {
      runLocalSqliteMigrations(sqlite);
      console.log("✅ Local SQLite database connected (development mode)");
    } catch (error) {
      console.error("Migration error:", error);
    }
  }
} catch (error) {
  console.error("Database initialization error:", error);
  // The app will handle this gracefully by checking if db is null
}

export { db };
