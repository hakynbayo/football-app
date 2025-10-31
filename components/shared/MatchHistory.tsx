"use client";

import { useMatchResults } from "@/hooks/useMatchResult";
import { X, Trophy, History } from "lucide-react";
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogFooter,
    AlertDialogTitle,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function MatchHistory() {
    const { matches, removeMatch } = useMatchResults();
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    if (matches.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <History className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                    No match history available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Match History ({matches.length})
                </h2>
            </div>

            <ul className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-hide pr-2">
                {matches.map((match, index) => {
                    const isDraw = match.scoreA === match.scoreB;
                    const teamAWins = match.scoreA > match.scoreB;
                    const scoreAClass = isDraw
                        ? "bg-gradient-to-r from-slate-500 to-slate-600"
                        : teamAWins
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-red-500 to-red-600";
                    const scoreBClass = isDraw
                        ? "bg-gradient-to-r from-slate-500 to-slate-600"
                        : !teamAWins
                            ? "bg-gradient-to-r from-green-500 to-green-600"
                            : "bg-gradient-to-r from-red-500 to-red-600";

                    return (
                        <li
                            key={index}
                            className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200 p-4"
                        >
                            <div className="flex items-center gap-3">
                                {/* Team A */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-muted-foreground mb-1">Team A</div>
                                    <div className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                                        {match.teamA}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <div className="flex items-center gap-2">
                                        <div className={`${scoreAClass} text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-sm`}>
                                            {match.scoreA}
                                        </div>
                                        <span className="text-slate-400 text-sm font-medium">-</span>
                                        <div className={`${scoreBClass} text-white px-3 py-1.5 rounded-lg font-bold text-lg shadow-sm`}>
                                            {match.scoreB}
                                        </div>
                                    </div>
                                </div>

                                {/* Team B */}
                                <div className="flex-1 min-w-0 text-right">
                                    <div className="text-xs text-muted-foreground mb-1">Team B</div>
                                    <div className="font-semibold text-base text-slate-900 dark:text-slate-100 truncate">
                                        {match.teamB}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 flex-shrink-0"
                                            onClick={() => setDeleteIndex(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete Match Result?
                                            </AlertDialogTitle>
                                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                                                    <div className="text-center">
                                                        <div className="text-blue-600 dark:text-blue-400 text-sm">{match.teamA}</div>
                                                        <div className="text-2xl text-blue-700 dark:text-blue-300 mt-1">{match.scoreA}</div>
                                                    </div>
                                                    <div className="text-slate-400">-</div>
                                                    <div className="text-center">
                                                        <div className="text-purple-600 dark:text-purple-400 text-sm">{match.teamB}</div>
                                                        <div className="text-2xl text-purple-700 dark:text-purple-300 mt-1">{match.scoreB}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                This action cannot be undone. This will permanently delete this match result and recalculate statistics.
                                            </p>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => {
                                                    if (deleteIndex !== null) {
                                                        removeMatch(deleteIndex);
                                                        setDeleteIndex(null);
                                                        setTimeout(() => {
                                                            window.location.reload();
                                                        }, 100);
                                                    }
                                                }}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
