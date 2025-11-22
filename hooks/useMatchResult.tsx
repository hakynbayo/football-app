import { useEffect, useState } from "react";
import { MatchResult, TeamStats } from "@/types/team";

export const useMatchResults = () => {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [stats, setStats] = useState<TeamStats[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, statsRes] = await Promise.all([
                    fetch("/api/data/matches"),
                    fetch("/api/data/stats"),
                ]);

                if (matchesRes.ok) {
                    const matchesData = await matchesRes.json();
                    setMatches(matchesData.matches || []);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData.stats || []);
                }
            } catch (error) {
                console.error("Error fetching matches/stats:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateStatsFromMatches = async (matchList: MatchResult[]) => {
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
        try {
            await fetch("/api/data/stats", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stats: newStats }),
            });
        } catch (error) {
            console.error("Error saving stats:", error);
        }
    };

    const addMatchResult = async (teamA: string, teamB: string, scoreA: number, scoreB: number) => {
        const newMatch: MatchResult = { teamA, teamB, scoreA, scoreB };
        const updatedMatches = [...matches, newMatch];
        setMatches(updatedMatches);
        
        try {
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matches: updatedMatches }),
            });
            if (response.ok) {
                await updateStatsFromMatches(updatedMatches);
            }
        } catch (error) {
            console.error("Error saving match:", error);
        }
    };

    const removeMatch = async (index: number) => {
        const updatedMatches = matches.filter((_, i) => i !== index);
        setMatches(updatedMatches);
        
        try {
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matches: updatedMatches }),
            });
            if (response.ok) {
                await updateStatsFromMatches(updatedMatches);
            }
        } catch (error) {
            console.error("Error removing match:", error);
        }
    };

    const clearMatchResults = async () => {
        setMatches([]);
        setStats([]);
        
        try {
            await Promise.all([
                fetch("/api/data/matches", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ matches: [] }),
                }),
                fetch("/api/data/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stats: [] }),
                }),
            ]);
        } catch (error) {
            console.error("Error clearing matches/stats:", error);
        }
    };

    return {
        matches,
        stats,
        addMatchResult,
        removeMatch,
        clearMatchResults,
        loading,
    };
};
