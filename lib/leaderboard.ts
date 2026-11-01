export type GoalRowLike = {
  scorer?: string | null;
  assist?: string | null;
};

export function computeLeaderboardFromGoalRows(rows: GoalRowLike[]) {
  const playerMap = new Map<string, { goals: number; assists: number }>();

  for (const row of rows) {
    const scorer = row.scorer?.trim();
    if (scorer && scorer !== "none") {
      const scorerEntry = playerMap.get(scorer) || { goals: 0, assists: 0 };
      scorerEntry.goals += 1;
      playerMap.set(scorer, scorerEntry);
    }

    const assist = row.assist?.trim();
    if (assist && assist !== "none") {
      const assistEntry = playerMap.get(assist) || {
        goals: 0,
        assists: 0,
      };
      assistEntry.assists += 1;
      playerMap.set(assist, assistEntry);
    }
  }

  return Array.from(playerMap.entries())
    .map(([player, stats]) => ({
      player,
      goals: stats.goals,
      assists: stats.assists,
    }))
    .sort((a, b) => {
      if (b.goals !== a.goals) return b.goals - a.goals;
      return b.assists - a.assists;
    });
}
