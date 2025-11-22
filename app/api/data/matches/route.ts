import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appMatches } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MATCHES_KEY = "main";

// GET - Fetch matches
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
      .from(appMatches)
      .where(eq(appMatches.id, MATCHES_KEY));

    if (result.length === 0) {
      return NextResponse.json({ matches: [] });
    }

    const matches = JSON.parse(result[0].data);
    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Error fetching matches:", error);
    return NextResponse.json(
      { error: "Failed to fetch matches" },
      { status: 500 }
    );
  }
}

// POST - Save matches
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { matches } = await request.json();

    const data = JSON.stringify(matches);
    const now = new Date();

    const existing = await db
      .select()
      .from(appMatches)
      .where(eq(appMatches.id, MATCHES_KEY));

    if (existing.length > 0) {
      await db
        .update(appMatches)
        .set({
          data,
          updatedAt: now,
          updatedBy: session.user.id,
        })
        .where(eq(appMatches.id, MATCHES_KEY));
    } else {
      await db.insert(appMatches).values({
        id: MATCHES_KEY,
        data,
        updatedAt: now,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving matches:", error);
    return NextResponse.json(
      { error: "Failed to save matches" },
      { status: 500 }
    );
  }
}

