"use client";

import { FC, useMemo } from "react";
import { PlayerLeaderboard, Team } from "@/types/team";
import { Trophy } from "lucide-react";

interface GoalLeaderboardProps {
    leaderboard: PlayerLeaderboard[];
    teams: Team[];
}

const GoalLeaderboard: FC<GoalLeaderboardProps> = ({ leaderboard, teams }) => {
    // Build the full list: merge leaderboard data with all players from teams
    const fullList = useMemo(() => {
        // Get all unique player names from teams
        const allPlayers = new Set<string>();
        for (const team of teams) {
            for (const player of team.players) {
                allPlayers.add(player);
            }
        }

        // Build a map from existing leaderboard
        const leaderboardMap = new Map<string, PlayerLeaderboard>();
        for (const entry of leaderboard) {
            leaderboardMap.set(entry.player, entry);
        }

        // Add any players not already in the leaderboard with 0/0
        for (const player of allPlayers) {
            if (!leaderboardMap.has(player)) {
                leaderboardMap.set(player, { player, goals: 0, assists: 0 });
            }
        }

        // Sort: by goals desc, then assists desc, then alphabetically
        return Array.from(leaderboardMap.values()).sort((a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.player.localeCompare(b.player);
        });
    }, [leaderboard, teams]);

    if (fullList.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-xs text-muted-foreground">
                    No players available. Generate teams first.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full overflow-x-auto -mx-2 px-2">
            <table className="w-full text-xs">
                <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="py-2 px-1 text-left font-semibold text-slate-500 dark:text-slate-400 w-7">#</th>
                        <th className="py-2 px-1 text-left font-semibold text-slate-500 dark:text-slate-400">Player</th>
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-8">⚽</th>
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-8">🅰️</th>
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-9">G+A</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {fullList.map((entry, index) => (
                        <tr
                            key={entry.player}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <td className="py-1.5 px-1">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">
                                        {index + 1}
                                    </span>
                                    {index === 0 && (entry.goals > 0 || entry.assists > 0) && (
                                        <Trophy className="w-3 h-3 text-yellow-500" />
                                    )}
                                </div>
                            </td>
                            <td className="py-1.5 px-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100 truncate block max-w-[120px]">
                                    {entry.player}
                                </span>
                            </td>
                            <td className="py-1.5 px-1 text-center">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-[10px] ${entry.goals > 0 ? "bg-green-500 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                                    }`}>
                                    {entry.goals}
                                </span>
                            </td>
                            <td className="py-1.5 px-1 text-center">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded font-bold text-[10px] ${entry.assists > 0 ? "bg-blue-500 text-white" : "bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-400"
                                    }`}>
                                    {entry.assists}
                                </span>
                            </td>
                            <td className="py-1.5 px-1 text-center font-bold text-slate-700 dark:text-slate-300">
                                {entry.goals + entry.assists}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default GoalLeaderboard;
