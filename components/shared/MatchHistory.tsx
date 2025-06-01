"use client";

import { useMatchResults } from "@/hooks/useMatchResult";

export default function MatchHistory() {
    const { matches } = useMatchResults();

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
            <ul className="space-y-3 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                {matches.map((match, index) => (
                    <li
                        key={index}
                        className="bg-muted py-3 rounded-lg shadow-sm border text-sm sm:text-base"
                    >
                        <div className="flex items-center justify-center sm:justify-between gap-3 whitespace-nowrap overflow-x-auto text-center">
                            <strong className="min-w-[60px]">{match.teamA}</strong>
                            <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                {match.scoreA}
                            </span>
                            <span className="text-gray-500 text-xs sm:text-sm">VS</span>
                            <span className="text-red-500 border border-gray-300 rounded px-3 py-1 text-xs sm:text-sm">
                                {match.scoreB}
                            </span>
                            <strong className="min-w-[60px]">{match.teamB}</strong>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
