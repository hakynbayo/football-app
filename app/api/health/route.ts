import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  let userCount = 0;
  let queryError = "";
  let databaseType = "unknown";
  let databaseStatus = "unknown";
  const tablesStatus: Record<string, boolean> = {};

  // Check database with actual query
  try {
    if (!db) {
      databaseStatus = "not_initialized";
      databaseType = "none";
    } else {
      // Determine which database is being used
      if (
        process.env.TURSO_DATABASE_URL &&
        process.env.NODE_ENV === "production"
      ) {
        databaseType = "turso";
      } else {
        databaseType = "sqlite";
      }

      // Try to actually query the database
      try {
        const { users, appTeams, appMatches, appStats, appTeamOfTheWeek } =
          await import("@/lib/db/schema");
        const userResults = await db.select().from(users);
        databaseStatus = "connected";
        userCount = userResults.length;

        // Check if app data tables exist
        try {
          await db.select().from(appTeams).limit(1);
          tablesStatus.appTeams = true;
        } catch {
          tablesStatus.appTeams = false;
        }

        try {
          await db.select().from(appMatches).limit(1);
          tablesStatus.appMatches = true;
        } catch {
          tablesStatus.appMatches = false;
        }

        try {
          await db.select().from(appStats).limit(1);
          tablesStatus.appStats = true;
        } catch {
          tablesStatus.appStats = false;
        }

        try {
          await db.select().from(appTeamOfTheWeek).limit(1);
          tablesStatus.appTeamOfTheWeek = true;
        } catch {
          tablesStatus.appTeamOfTheWeek = false;
        }
      } catch (error) {
        databaseStatus = "connected_but_query_failed";
        queryError = error instanceof Error ? error.message : "unknown";
      }
    }
  } catch (error) {
    databaseStatus = `error: ${
      error instanceof Error ? error.message : "unknown"
    }`;
  }

  // Check auth secrets
  const authStatus =
    process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
      ? "configured"
      : "missing_secret";

  // Check Turso config
  const tursoConfigured = !!(
    process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
  );

  const message =
    databaseType === "turso"
      ? "🚀 Connected to Turso cloud database"
      : databaseType === "sqlite"
      ? "💾 Connected to local SQLite database"
      : "⚠️ No database connection";

  const allTablesExist = Object.values(tablesStatus).every((exists) => exists);
  const tablesMessage = allTablesExist
    ? "✅ All app data tables exist"
    : "⚠️ Some tables missing - run migration: yarn db:migrate";

  return NextResponse.json({
    status: authStatus === "missing_secret" ? "warning" : "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    database: databaseStatus,
    databaseType,
    auth: authStatus,
    turso: tursoConfigured ? "configured" : "not_configured",
    userCount,
    tables: tablesStatus,
    tablesMessage,
    queryError: queryError || undefined,
    message,
  });
}
