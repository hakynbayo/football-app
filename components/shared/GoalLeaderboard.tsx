"use client";

import { FC, useMemo, useEffect, useState } from "react";
import { PlayerLeaderboard, Team } from "@/types/team";
import { Trophy, Plus, Minus } from "lucide-react";

interface GoalLeaderboardProps {
    leaderboard: PlayerLeaderboard[];
    teams: Team[];
    updatePlayerStat: (player: string, goals: number, assists: number) => void;
}

const GoalLeaderboard: FC<GoalLeaderboardProps> = ({ leaderboard, teams, updatePlayerStat }) => {
    // Build the full list: merge leaderboard data with all players from teams
    const fullList = useMemo(() => {
        const allPlayers = new Set<string>();
        for (const team of teams) {
            for (const player of team.players) {
                allPlayers.add(player);
            }
        }

        const leaderboardMap = new Map<string, PlayerLeaderboard>();
        for (const entry of leaderboard) {
            leaderboardMap.set(entry.player, entry);
        }

        for (const player of allPlayers) {
            if (!leaderboardMap.has(player)) {
                leaderboardMap.set(player, { player, goals: 0, assists: 0 });
            }
        }

        return Array.from(leaderboardMap.values()).sort((a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.player.localeCompare(b.player);
        });
    }, [leaderboard, teams]);

    const [stats, setStats] = useState<PlayerLeaderboard[]>(fullList);

    useEffect(() => {
        setStats(fullList);
    }, [fullList]);

    const updateStat = (player: string, field: "goals" | "assists", delta: number) => {
        setStats((current) => {
            const next = current.map((entry) => {
                if (entry.player !== player) return entry;
                const value = Math.max(0, entry[field] + delta);
                return { ...entry, [field]: value };
            });
            const updated = next.find((entry) => entry.player === player);
            if (updated) {
                updatePlayerStat(updated.player, updated.goals, updated.assists);
            }
            return next;
        });
    };

    const sortedStats = useMemo(() => {
        return [...stats].sort((a, b) => {
            if (b.goals !== a.goals) return b.goals - a.goals;
            if (b.assists !== a.assists) return b.assists - a.assists;
            return a.player.localeCompare(b.player);
        });
    }, [stats]);

    if (sortedStats.length === 0) {
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
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-24">Goals</th>
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-24">Assists</th>
                        <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-9">G+A</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {sortedStats.map((entry, index) => (
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
                            <td className="py-1.5 px-1">
                                <div className="inline-flex items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => updateStat(entry.player, "goals", -1)}
                                        disabled={entry.goals <= 0}
                                        className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label={`Decrease goals for ${entry.player}`}
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                                        {entry.goals}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateStat(entry.player, "goals", 1)}
                                        className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200"
                                        aria-label={`Increase goals for ${entry.player}`}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </td>
                            <td className="py-1.5 px-1">
                                <div className="inline-flex items-center justify-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => updateStat(entry.player, "assists", -1)}
                                        disabled={entry.assists <= 0}
                                        className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed"
                                        aria-label={`Decrease assists for ${entry.player}`}
                                    >
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 font-semibold text-slate-700 dark:text-slate-200">
                                        {entry.assists}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => updateStat(entry.player, "assists", 1)}
                                        className="w-7 h-7 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-200"
                                        aria-label={`Increase assists for ${entry.player}`}
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
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
