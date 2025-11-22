import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appTeamOfTheWeek } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { TeamOfTheWeek } from "@/types/team";

export const runtime = "nodejs";

const TEAM_OF_THE_WEEK_KEY = "main";

// GET - Fetch team of the week
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get("month") || "all";

    const result = await db
      .select()
      .from(appTeamOfTheWeek)
      .where(eq(appTeamOfTheWeek.id, TEAM_OF_THE_WEEK_KEY));

    if (result.length === 0 || !result[0].data) {
      return NextResponse.json({ data: {} });
    }

    const allData = JSON.parse(result[0].data || "{}");

    if (month === "all") {
      return NextResponse.json({ data: allData || {} });
    }

    return NextResponse.json({ data: allData[month] || {} });
  } catch (error) {
    console.error("Error fetching team of the week:", error);
    return NextResponse.json(
      { error: "Failed to fetch team of the week" },
      { status: 500 }
    );
  }
}

// POST - Save team of the week
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    const { month, data: monthData } = await request.json();

    if (!month) {
      return NextResponse.json({ error: "Month is required" }, { status: 400 });
    }

    const now = new Date();

    // Get existing data
    const existing = await db
      .select()
      .from(appTeamOfTheWeek)
      .where(eq(appTeamOfTheWeek.id, TEAM_OF_THE_WEEK_KEY));

    let allData: Record<string, TeamOfTheWeek> = {};
    if (existing.length > 0 && existing[0].data) {
      allData = JSON.parse(existing[0].data) as Record<string, TeamOfTheWeek>;
    }

    // Update the specific month
    allData[month] = monthData;

    const updatedData = JSON.stringify(allData);

    if (existing.length > 0) {
      await db
        .update(appTeamOfTheWeek)
        .set({
          data: updatedData,
          updatedAt: now,
          updatedBy: session.user.id,
        })
        .where(eq(appTeamOfTheWeek.id, TEAM_OF_THE_WEEK_KEY));
    } else {
      await db.insert(appTeamOfTheWeek).values({
        id: TEAM_OF_THE_WEEK_KEY,
        data: updatedData,
        updatedAt: now,
        updatedBy: session.user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving team of the week:", error);
    return NextResponse.json(
      { error: "Failed to save team of the week" },
      { status: 500 }
    );
  }
}
