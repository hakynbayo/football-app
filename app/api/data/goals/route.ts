import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { goalEvents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";
import { PlayerLeaderboard } from "@/types/team";
import { computeLeaderboardFromGoalRows } from "@/lib/leaderboard";

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
    const leaderboard: PlayerLeaderboard[] = computeLeaderboardFromGoalRows(rows);

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
        (goal: { team: string; scorer?: string; assist?: string | null }) => {
          const scorer = goal.scorer?.trim() || "none";
          const assist = goal.assist?.trim() || null;

          return {
            id: nanoid(),
            matchId,
            team: goal.team,
            scorer,
            assist,
            createdAt: now,
          };
        },
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
