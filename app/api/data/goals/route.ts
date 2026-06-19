import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goalEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { PlayerLeaderboard } from "@/types/team";

export const runtime = "nodejs";

// GET - Fetch leaderboard (computed from all goal events)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 },
      );
    }

    const rows = await db.select().from(goalEvents);

    // Compute leaderboard
    const playerMap = new Map<string, { goals: number; assists: number }>();

    for (const row of rows) {
      // Count goal for scorer
      const scorerEntry = playerMap.get(row.scorer) || { goals: 0, assists: 0 };
      scorerEntry.goals += 1;
      playerMap.set(row.scorer, scorerEntry);

      // Count assist
      if (row.assist) {
        const assistEntry = playerMap.get(row.assist) || {
          goals: 0,
          assists: 0,
        };
        assistEntry.assists += 1;
        playerMap.set(row.assist, assistEntry);
      }
    }

    const leaderboard: PlayerLeaderboard[] = Array.from(playerMap.entries())
      .map(([player, stats]) => ({
        player,
        goals: stats.goals,
        assists: stats.assists,
      }))
      .sort((a, b) => {
        if (b.goals !== a.goals) return b.goals - a.goals;
        return b.assists - a.assists;
      });

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 },
    );
  }
}

// POST - Add goal events for a match
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 },
      );
    }

    const { matchId, goals } = await request.json();

    if (!matchId || !Array.isArray(goals)) {
      return NextResponse.json(
        { error: "matchId and goals array are required" },
        { status: 400 },
      );
    }

    const now = new Date();

    if (goals.length > 0) {
      const rows = goals.map(
        (goal: { team: string; scorer: string; assist?: string }) => ({
          id: nanoid(),
          matchId,
          team: goal.team,
          scorer: goal.scorer,
          assist: goal.assist || null,
          createdAt: now,
        }),
      );

      await db.insert(goalEvents).values(rows);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving goal events:", error);
    return NextResponse.json(
      { error: "Failed to save goal events" },
      { status: 500 },
    );
  }
}

// DELETE - Delete goal events for a match
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 },
      );
    }

    const { matchId } = await request.json();

    if (matchId === "all") {
      await db.delete(goalEvents);
    } else if (matchId) {
      await db.delete(goalEvents).where(eq(goalEvents.matchId, matchId));
    } else {
      return NextResponse.json(
        { error: "matchId is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting goal events:", error);
    return NextResponse.json(
      { error: "Failed to delete goal events" },
      { status: 500 },
    );
  }
}
