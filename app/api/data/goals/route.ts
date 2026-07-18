import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goalEvents, playerStats } from "@/lib/db/schema";
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

    const goalRows = await db.select().from(goalEvents);
    const statsRows = await db.select().from(playerStats);

    const playerMap = new Map<string, { goals: number; assists: number }>();

    for (const row of goalRows) {
      const scorerEntry = playerMap.get(row.scorer) || { goals: 0, assists: 0 };
      scorerEntry.goals += 1;
      playerMap.set(row.scorer, scorerEntry);

      if (row.assist) {
        const assistEntry = playerMap.get(row.assist) || {
          goals: 0,
          assists: 0,
        };
        assistEntry.assists += 1;
        playerMap.set(row.assist, assistEntry);
      }
    }

    for (const stat of statsRows) {
      const existing = playerMap.get(stat.player) || { goals: 0, assists: 0 };
      existing.goals += stat.goals;
      existing.assists += stat.assists;
      playerMap.set(stat.player, existing);
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

// PATCH - Persist manual player stat changes
export async function PATCH(request: NextRequest) {
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

    const { player, goals, assists } = await request.json();

    if (!player || goals === undefined || assists === undefined) {
      return NextResponse.json(
        { error: "player, goals, and assists are required" },
        { status: 400 },
      );
    }

    const now = new Date();

    const existing = await db
      .select()
      .from(playerStats)
      .where(eq(playerStats.player, player))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(playerStats)
        .set({
          goals,
          assists,
          updatedAt: now,
        })
        .where(eq(playerStats.player, player));
    } else {
      await db.insert(playerStats).values({
        id: nanoid(),
        player,
        goals,
        assists,
        createdAt: now,
        updatedAt: now,
        createdBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating player stats:", error);
    return NextResponse.json(
      { error: "Failed to update player stats" },
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
