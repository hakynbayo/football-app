import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let userCount = 0;
  let databaseType = "unknown";
  let databaseStatus = "unknown";
  const tablesStatus: Record<string, boolean> = {};

  try {
    if (!db) {
      databaseStatus = "not_initialized";
      databaseType = "none";
    } else {
<<<<<<< HEAD
      if (
        process.env.TURSO_DATABASE_URL &&
        process.env.NODE_ENV === "production"
      ) {
=======
      // Determine which database is being used
      if (process.env.TURSO_DATABASE_URL) {
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
        databaseType = "turso";
      } else {
        databaseType = "sqlite";
      }

      try {
        const { users, teams, matches, teamOfTheWeek } =
          await import("@/lib/db/schema");
        const userResults = await db.select().from(users);
        databaseStatus = "connected";
        userCount = userResults.length;

        try {
          await db.select().from(teams).limit(1);
          tablesStatus.teams = true;
        } catch {
          tablesStatus.teams = false;
        }

        try {
          await db.select().from(matches).limit(1);
          tablesStatus.matches = true;
        } catch {
          tablesStatus.matches = false;
        }

        try {
          await db.select().from(teamOfTheWeek).limit(1);
          tablesStatus.teamOfTheWeek = true;
        } catch {
          tablesStatus.teamOfTheWeek = false;
        }
      } catch {
        databaseStatus = "query_failed";
      }
    }
  } catch (error) {
    databaseStatus = `error: ${
      error instanceof Error ? error.message : "unknown"
    }`;
  }

  const allTablesExist = Object.values(tablesStatus).every((exists) => exists);
  const tablesMessage = allTablesExist
    ? "All tables exist"
    : "Some tables missing - run migration";

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    database: databaseStatus,
    databaseType,
    userCount,
    tables: tablesStatus,
    tablesMessage,
  });
}
