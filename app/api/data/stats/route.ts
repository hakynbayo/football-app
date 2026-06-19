import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { matches } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { TeamStats } from "@/types/team";

export const runtime = "nodejs";

// GET - Compute stats from matches (derived data, no separate table needed)
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

    const allMatches = await db.select().from(matches);

    const statsMap = new Map<string, TeamStats>();

    const getOrCreate = (name: string): TeamStats => {
      let team = statsMap.get(name);
      if (!team) {
        team = {
          name,
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          goals: 0,
          points: 0,
        };
        statsMap.set(name, team);
      }
      return team;
    };

    for (const match of allMatches) {
      const teamA = getOrCreate(match.teamA);
      const teamB = getOrCreate(match.teamB);

      const gdA = match.scoreA - match.scoreB;
      const gdB = match.scoreB - match.scoreA;

      teamA.played += 1;
      teamA.goals += gdA;
      teamB.played += 1;
      teamB.goals += gdB;

      if (match.scoreA > match.scoreB) {
        teamA.wins += 1;
        teamA.points += 3;
        teamB.losses += 1;
      } else if (match.scoreB > match.scoreA) {
        teamB.wins += 1;
        teamB.points += 3;
        teamA.losses += 1;
      } else {
        teamA.draws += 1;
        teamA.points += 1;
        teamB.draws += 1;
        teamB.points += 1;
      }
    }

    const stats = Array.from(statsMap.values()).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return b.goals - a.goals;
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error computing stats:", error);
    return NextResponse.json(
      { error: "Failed to compute stats" },
      { status: 500 },
    );
  }
}
