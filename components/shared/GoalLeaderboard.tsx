"use client";

import { FC } from "react";
import { PlayerLeaderboard } from "@/types/team";
import { Trophy, Target, Handshake } from "lucide-react";

interface GoalLeaderboardProps {
    leaderboard: PlayerLeaderboard[];
}

const GoalLeaderboard: FC<GoalLeaderboardProps> = ({ leaderboard }) => {
    if (leaderboard.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <Target className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                    No goals recorded yet. Submit match results with goalscorer details.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Player
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1">
                                            <Target className="w-3.5 h-3.5" />
                                            Goals
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        <div className="flex items-center justify-center gap-1">
                                            <Handshake className="w-3.5 h-3.5" />
                                            Assists
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        G+A
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {leaderboard.map((entry, index) => (
                                    <tr
                                        key={entry.player}
                                        className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-l-4 ${index === 0
                                                ? "border-yellow-500"
                                                : index === 1
                                                    ? "border-slate-400"
                                                    : index === 2
                                                        ? "border-amber-600"
                                                        : "border-transparent"
                                            }`}
                                    >
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {index + 1}
                                                </span>
                                                {index === 0 && (
                                                    <Trophy className="w-4 h-4 text-yellow-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap">
                                            <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                {entry.player}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm bg-green-500 text-white shadow-sm min-w-[2rem]">
                                                {entry.goals}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg font-bold text-sm bg-blue-500 text-white shadow-sm min-w-[2rem]">
                                                {entry.assists}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 whitespace-nowrap text-center">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                {entry.goals + entry.assists}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GoalLeaderboard;
