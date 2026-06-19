import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { teams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

// GET - Fetch all teams
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

    const rows = await db.select().from(teams);

    const result = rows.map((row) => ({
      id: row.id,
      name: row.name,
      players: JSON.parse(row.players) as string[],
    }));

    return NextResponse.json({ teams: result });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 },
    );
  }
}

// POST - Replace all teams (bulk operation for team generation)
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

    const { teams: newTeams } = await request.json();
    const now = new Date();

    // Delete all existing teams and insert new ones in a transaction-like manner
    await db.delete(teams);

    if (Array.isArray(newTeams) && newTeams.length > 0) {
      const rows = newTeams.map(
        (team: { name: string; players: string[] }) => ({
          id: nanoid(),
          name: team.name,
          players: JSON.stringify(team.players),
          createdAt: now,
          createdBy: session.user.id,
        }),
      );

      await db.insert(teams).values(rows);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving teams:", error);
    return NextResponse.json(
      { error: "Failed to save teams" },
      { status: 500 },
    );
  }
}

// PUT - Update a single team
export async function PUT(request: NextRequest) {
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

    const { id, name, players } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    await db
      .update(teams)
      .set({
        name,
        players: JSON.stringify(players),
      })
      .where(eq(teams.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json(
      { error: "Failed to update team" },
      { status: 500 },
    );
  }
}

// DELETE - Delete a single team
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

    if (!id) {
      return NextResponse.json(
        { error: "Team ID is required" },
        { status: 400 },
      );
    }

    await db.delete(teams).where(eq(teams.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json(
      { error: "Failed to delete team" },
      { status: 500 },
    );
  }
}
