import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const checks: {
    status: string;
    timestamp: string;
    environment: string;
    database: string;
    databaseType: string;
    auth: string;
  } = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "unknown",
    database: "unknown",
    databaseType: "unknown",
    auth: "unknown",
  };

  // Check database
  try {
    if (!db) {
      checks.database = "not_initialized";
      checks.databaseType = "none";
    } else {
      checks.database = "connected";
      // Determine which database is being used
      if (process.env.TURSO_DATABASE_URL && process.env.NODE_ENV === "production") {
        checks.databaseType = "turso";
      } else {
        checks.databaseType = "sqlite";
      }
    }
  } catch (error) {
    checks.database = `error: ${
      error instanceof Error ? error.message : "unknown"
    }`;
  }

  // Check auth secrets
  if (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET) {
    checks.auth = "configured";
  } else {
    checks.auth = "missing_secret";
    checks.status = "warning";
  }

  // Check Turso config
  const tursoConfigured = !!(
    process.env.TURSO_DATABASE_URL && process.env.TURSO_AUTH_TOKEN
  );

  return NextResponse.json({
    ...checks,
    turso: tursoConfigured ? "configured" : "not_configured",
    message: checks.databaseType === "turso" 
      ? "🚀 Connected to Turso cloud database" 
      : checks.databaseType === "sqlite"
      ? "💾 Connected to local SQLite database"
      : "⚠️ No database connection",
  });
}
