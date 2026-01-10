"use client";

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
import { MatchResult } from "@/types/team";

interface MatchHistoryProps {
    matches: MatchResult[];
    removeMatch: (index: number) => void;
}

export default function MatchHistory({ matches, removeMatch }: MatchHistoryProps) {
    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    if (matches.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                    <History className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                    No match history available yet.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    <Trophy className="w-4 h-4 text-black dark:text-white" />
                </div>
                <h2 className="text-lg font-bold text-black dark:text-white">
                    Match History ({matches.length})
                </h2>
            </div>

            <ul className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hide pr-1">
                {matches.map((match, index) => {
                    const isDraw = match.scoreA === match.scoreB;
                    const teamAWins = match.scoreA > match.scoreB;
                    const scoreAClass = isDraw
                        ? "bg-gray-500"
                        : teamAWins
                            ? "bg-black dark:bg-white"
                            : "bg-gray-600";
                    const scoreBClass = isDraw
                        ? "bg-gray-500"
                        : !teamAWins
                            ? "bg-black dark:bg-white"
                            : "bg-gray-600";
                    const scoreATextClass = isDraw
                        ? "text-white"
                        : teamAWins
                            ? "text-white dark:text-black"
                            : "text-white";
                    const scoreBTextClass = isDraw
                        ? "text-white"
                        : !teamAWins
                            ? "text-white dark:text-black"
                            : "text-white";

                    return (
                        <li
                            key={index}
                            className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 p-3"
                        >
                            <div className="flex items-center gap-2">
                                {/* Team A */}
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-muted-foreground mb-0.5">Team A</div>
                                    <div className="font-semibold text-sm text-black dark:text-white truncate">
                                        {match.teamA}
                                    </div>
                                </div>

                                {/* Score */}
                                <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                                    <div className="flex items-center gap-1.5">
                                        <div className={`${scoreAClass} ${scoreATextClass} px-2 py-1 rounded-md font-bold text-sm shadow-sm`}>
                                            {match.scoreA}
                                        </div>
                                        <span className="text-gray-400 text-xs font-medium">-</span>
                                        <div className={`${scoreBClass} ${scoreBTextClass} px-2 py-1 rounded-md font-bold text-sm shadow-sm`}>
                                            {match.scoreB}
                                        </div>
                                    </div>
                                </div>

                                {/* Team B */}
                                <div className="flex-1 min-w-0 text-right">
                                    <div className="text-xs text-muted-foreground mb-0.5">Team B</div>
                                    <div className="font-semibold text-sm text-black dark:text-white truncate">
                                        {match.teamB}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-gray-600 hover:text-black hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 flex-shrink-0 h-7 w-7"
                                            onClick={() => setDeleteIndex(index)}
                                        >
                                            <X className="w-3 h-3" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Delete Match Result?
                                            </AlertDialogTitle>
                                            <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                                <div className="flex items-center justify-center gap-3 text-base font-semibold">
                                                    <div className="text-center">
                                                        <div className="text-black dark:text-white text-xs">{match.teamA}</div>
                                                        <div className="text-xl text-black dark:text-white mt-0.5">{match.scoreA}</div>
                                                    </div>
                                                    <div className="text-gray-400">-</div>
                                                    <div className="text-center">
                                                        <div className="text-black dark:text-white text-xs">{match.teamB}</div>
                                                        <div className="text-xl text-black dark:text-white mt-0.5">{match.scoreB}</div>
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-2">
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
                                                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
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
