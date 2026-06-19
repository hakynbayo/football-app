import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teamOfTheWeek } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

// GET - Fetch team of the week entries
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month");

    let rows;
    if (month && month !== "all") {
      rows = await db
        .select()
        .from(teamOfTheWeek)
        .where(eq(teamOfTheWeek.month, month));
    } else {
      rows = await db.select().from(teamOfTheWeek);
    }

    const entries = rows.map((row) => ({
      team: {
        name: row.teamName,
        players: JSON.parse(row.players) as string[],
      },
      date: row.date,
      month: row.month,
    }));

    // Sort by month descending
    entries.sort((a, b) =>
      a.month > b.month ? -1 : a.month < b.month ? 1 : 0,
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Error fetching team of the week:", error);
    return NextResponse.json(
      { error: "Failed to fetch team of the week" },
      { status: 500 },
    );
  }
}

// POST - Save team of the week for a month (upsert)
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

    const { month, teamName, players, date } = await request.json();

    if (!month || !teamName || !players || !date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const now = new Date();

    // Check if entry exists for this month
    const existing = await db
      .select()
      .from(teamOfTheWeek)
      .where(eq(teamOfTheWeek.month, month));

    if (existing.length > 0) {
      await db
        .update(teamOfTheWeek)
        .set({
          teamName,
          players: JSON.stringify(players),
          date,
          createdBy: session.user.id,
        })
        .where(eq(teamOfTheWeek.month, month));
    } else {
      await db.insert(teamOfTheWeek).values({
        id: nanoid(),
        month,
        teamName,
        players: JSON.stringify(players),
        date,
        createdAt: now,
        createdBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving team of the week:", error);
    return NextResponse.json(
      { error: "Failed to save team of the week" },
      { status: 500 },
    );
  }
}

// DELETE - Clear team of the week entries
export async function DELETE() {
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

    await db.delete(teamOfTheWeek);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing team of the week:", error);
    return NextResponse.json(
      { error: "Failed to clear team of the week" },
      { status: 500 },
    );
  }
}
