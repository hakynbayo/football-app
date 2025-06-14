import { useEffect, useState } from "react";
import { MatchResult, TeamStats } from "@/types/team";
import { getFromStorage, STORAGE_KEYS, saveToStorage } from "@/lib/storage";

export const useMatchResults = () => {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [stats, setStats] = useState<TeamStats[]>([]);

    useEffect(() => {
        const savedMatches = getFromStorage<MatchResult[]>(STORAGE_KEYS.MATCHES, []);
        const savedStats = getFromStorage<TeamStats[]>(STORAGE_KEYS.STATS, []);
        setMatches(savedMatches);
        setStats(savedStats);
    }, []);

    const addMatchResult = (teamA: string, teamB: string, scoreA: number, scoreB: number) => {
        const newMatch: MatchResult = { teamA, teamB, scoreA, scoreB };
        const updatedMatches = [...matches, newMatch];
        setMatches(updatedMatches);
        saveToStorage(STORAGE_KEYS.MATCHES, updatedMatches);
        updateStatsFromMatches(updatedMatches);
    };

    const updateStatsFromMatches = (matchList: MatchResult[]) => {
        const newStats: TeamStats[] = [];

        const updateTeam = (teamName: string, update: Partial<TeamStats>) => {
            let team = newStats.find((t) => t.name === teamName);
            if (!team) {
                team = { name: teamName, played: 0, wins: 0, draws: 0, losses: 0, goals: 0, points: 0 };
                newStats.push(team);
            }
            Object.assign(team, {
                played: team.played + 1,
                goals: team.goals + (update.goals || 0),
                wins: team.wins + (update.wins || 0),
                draws: team.draws + (update.draws || 0),
                losses: team.losses + (update.losses || 0),
                points: team.points + (update.points || 0),
            });
        };

        for (const match of matchList) {
            const { teamA, teamB, scoreA, scoreB } = match;

            if (scoreA > scoreB) {
                // Team A wins: gains its own goals, Team B loses: subtracts opponent's goals
                updateTeam(teamA, { wins: 1, points: 3, goals: scoreA });
                updateTeam(teamB, { losses: 1, goals: -scoreA });
            } else if (scoreB > scoreA) {
                // Team B wins: gains its own goals, Team A loses: subtracts opponent's goals
                updateTeam(teamB, { wins: 1, points: 3, goals: scoreB });
                updateTeam(teamA, { losses: 1, goals: -scoreB });
            } else {
                // Draw: no goal change
                updateTeam(teamA, { draws: 1, points: 1 });
                updateTeam(teamB, { draws: 1, points: 1 });
            }
        }

        setStats(newStats);
        saveToStorage(STORAGE_KEYS.STATS, newStats);
    };


    const removeMatch = (index: number) => {
        const updatedMatches = matches.filter((_, i) => i !== index);
        setMatches(updatedMatches);
        saveToStorage(STORAGE_KEYS.MATCHES, updatedMatches);
        updateStatsFromMatches(updatedMatches); // recalculate stats
    };

    const clearMatchResults = () => {
        setMatches([]);
        saveToStorage(STORAGE_KEYS.MATCHES, []);
        setStats([]);
        saveToStorage(STORAGE_KEYS.STATS, []);
    };

    return {
        matches,
        stats,
        addMatchResult,
        removeMatch,
        clearMatchResults,
    };
};
