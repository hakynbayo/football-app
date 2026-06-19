"use client";

import { FC } from "react";
import { PlayerLeaderboard } from "@/types/team";
import { Trophy, Target } from "lucide-react";

interface GoalLeaderboardProps {
    leaderboard: PlayerLeaderboard[];
}

const GoalLeaderboard: FC<GoalLeaderboardProps> = ({ leaderboard }) => {
    if (leaderboard.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
                    <Target className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                    No goals recorded yet. Submit match results with goalscorer details.
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
                    {leaderboard.map((entry, index) => (
                        <tr
                            key={entry.player}
                            className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                            <td className="py-1.5 px-1">
                                <div className="flex items-center gap-1">
                                    <span className="font-bold text-slate-600 dark:text-slate-300">
                                        {index + 1}
                                    </span>
                                    {index === 0 && <Trophy className="w-3 h-3 text-yellow-500" />}
                                </div>
                            </td>
                            <td className="py-1.5 px-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100 truncate block max-w-[120px]">
                                    {entry.player}
                                </span>
                            </td>
                            <td className="py-1.5 px-1 text-center">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-500 text-white font-bold text-[10px]">
                                    {entry.goals}
                                </span>
                            </td>
                            <td className="py-1.5 px-1 text-center">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-500 text-white font-bold text-[10px]">
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
