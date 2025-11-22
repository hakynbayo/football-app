import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appTeams } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const TEAMS_KEY = "main";

// GET - Fetch teams
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const result = await db
      .select()
      .from(appTeams)
      .where(eq(appTeams.id, TEAMS_KEY));

    if (result.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    const teams = JSON.parse(result[0].data);
    return NextResponse.json({ teams });
  } catch (error) {
    console.error("Error fetching teams:", error);
    return NextResponse.json(
      { error: "Failed to fetch teams" },
      { status: 500 }
    );
  }
}

// POST - Save teams
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { teams } = await request.json();

    const data = JSON.stringify(teams);
    const now = new Date();

    // Try to update first
    const existing = await db
      .select()
      .from(appTeams)
      .where(eq(appTeams.id, TEAMS_KEY));

    if (existing.length > 0) {
      await db
        .update(appTeams)
        .set({
          data,
          updatedAt: now,
          updatedBy: session.user.id,
        })
        .where(eq(appTeams.id, TEAMS_KEY));
    } else {
      await db.insert(appTeams).values({
        id: TEAMS_KEY,
        data,
        updatedAt: now,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving teams:", error);
    return NextResponse.json(
      { error: "Failed to save teams" },
      { status: 500 }
    );
  }
}

