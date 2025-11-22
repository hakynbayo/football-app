import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appStats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const STATS_KEY = "main";

// GET - Fetch stats
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
      .from(appStats)
      .where(eq(appStats.id, STATS_KEY));

    if (result.length === 0) {
      return NextResponse.json({ stats: [] });
    }

    const stats = JSON.parse(result[0].data);
    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

// POST - Save stats
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json({ error: "Database unavailable" }, { status: 500 });
    }

    const { stats } = await request.json();

    const data = JSON.stringify(stats);
    const now = new Date();

    const existing = await db
      .select()
      .from(appStats)
      .where(eq(appStats.id, STATS_KEY));

    if (existing.length > 0) {
      await db
        .update(appStats)
        .set({
          data,
          updatedAt: now,
          updatedBy: session.user.id,
        })
        .where(eq(appStats.id, STATS_KEY));
    } else {
      await db.insert(appStats).values({
        id: STATS_KEY,
        data,
        updatedAt: now,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving stats:", error);
    return NextResponse.json(
      { error: "Failed to save stats" },
      { status: 500 }
    );
  }
}

