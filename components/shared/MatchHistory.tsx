"use client";

import { useMatchResults } from "@/hooks/useMatchResult";
import { X } from "lucide-react";
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
            <p className="text-sm text-gray-500 text-center mt-4">
                No match history available yet.
            </p>
        );
    }

    return (
        <div className="mt-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center sm:text-left">
                Match History
            </h2>

            <ul className="space-y-3 max-h-[400px] overflow-y-auto scrollbar-hide">
                {matches.map((match, index) => (
                    <li
                        key={index}
                        className="bg-muted py-3 rounded-lg shadow-sm border text-sm sm:text-base relative"
                    >
                        <div className="flex items-center justify-center gap-3 whitespace-nowrap overflow-x-auto text-center">
                            <strong className="min-w-[60px]">{match.teamA}</strong>
                            <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                {match.scoreA}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm">VS</span>
                            <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                {match.scoreB}
                            </span>
                            <strong className="min-w-[60px]">{match.teamB}</strong>

                            {/* Trash Icon with Dialog Trigger */}
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-red-500 hover:text-red-600"
                                        onClick={() => setDeleteIndex(index)}
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Are you sure you want to delete {match.teamA} <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                                {match.scoreA}
                                            </span> VS {match.teamB} <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                                {match.scoreB}
                                            </span>?
                                        </AlertDialogTitle>
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
                                                    }, 100); // 100ms delay
                                                }
                                            }}
                                        >
                                            Delete
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
