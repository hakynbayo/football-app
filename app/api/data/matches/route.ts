import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

// GET - Fetch all matches
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

    const rows = await db.select().from(matches);

    const result = rows.map((row) => ({
      id: row.id,
      teamA: row.teamA,
      teamB: row.teamB,
      scoreA: row.scoreA,
      scoreB: row.scoreB,
    }));

    return NextResponse.json({ matches: result });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 },
    );
  }
}

// POST - Add a single match
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

    const { teamA, teamB, scoreA, scoreB } = await request.json();

    if (!teamA || !teamB || scoreA == null || scoreB == null) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (scoreA < 0 || scoreB < 0) {
      return NextResponse.json(
        { error: "Scores cannot be negative" },
        { status: 400 },
      );
    }

    const id = nanoid();
    const now = new Date();

    await db.insert(matches).values({
      id,
      teamA,
      teamB,
      scoreA: Number(scoreA),
      scoreB: Number(scoreB),
      createdAt: now,
      createdBy: session.user.id,
    });

    return NextResponse.json({
      success: true,
      match: {
        id,
        teamA,
        teamB,
        scoreA: Number(scoreA),
        scoreB: Number(scoreB),
      },
    });
  } catch (error) {
    console.error("Error saving match:", error);
    return NextResponse.json(
      { error: "Failed to save match" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a single match or all matches
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

    const { id } = await request.json();

    if (id === "all") {
      await db.delete(matches);
    } else if (id) {
      await db.delete(matches).where(eq(matches.id, id));
    } else {
      return NextResponse.json(
        { error: "Match ID is required" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting match:", error);
    return NextResponse.json(
      { error: "Failed to delete match" },
      { status: 500 },
    );
  }
}
