import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  let userCount = 0;
  let queryError = "";
  let databaseType = "unknown";
  let databaseStatus = "unknown";

  // Check database with actual query
  try {
    if (!db) {
      databaseStatus = "not_initialized";
      databaseType = "none";
    } else {
      // Determine which database is being used
      if (process.env.TURSO_DATABASE_URL && process.env.NODE_ENV === "production") {
        databaseType = "turso";
      } else {
        databaseType = "sqlite";
      }
      
      // Try to actually query the database
      try {
        const { users } = await import("@/lib/db/schema");
        const userResults = await db.select().from(users);
        databaseStatus = "connected";
        userCount = userResults.length;
      } catch (error) {
        databaseStatus = "connected_but_query_failed";
        queryError = error instanceof Error ? error.message : "unknown";
      }
    }
  } catch (error) {
    databaseStatus = `error: ${error instanceof Error ? error.message : "unknown"}`;
  }

  // Check auth secrets
  const authStatus = (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET)
    ? "configured"
    : "missing_secret";

  // Check Turso config
  const tursoConfigured = !!(
    process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
  );

  const message = databaseType === "turso" 
    ? "🚀 Connected to Turso cloud database" 
    : databaseType === "sqlite"
    ? "💾 Connected to local SQLite database"
    : "⚠️ No database connection";

  return NextResponse.json({
    status: authStatus === "missing_secret" ? "warning" : "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    database: databaseStatus,
    databaseType,
    auth: authStatus,
    turso: tursoConfigured ? "configured" : "not_configured",
    userCount,
    queryError: queryError || undefined,
    message,
  });
}
