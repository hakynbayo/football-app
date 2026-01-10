import { useEffect, useState, useRef } from "react";
import { MatchResult, TeamStats, Team } from "@/types/team";

export const useMatchResults = (teams: Team[] = []) => {
    const [matches, setMatches] = useState<MatchResult[]>([]);
    const [stats, setStats] = useState<TeamStats[]>([]);
    const [loading, setLoading] = useState(true);
    const isInitialLoad = useRef(true);
    const previousTeamsRef = useRef<Team[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [matchesRes, statsRes] = await Promise.all([
                    fetch("/api/data/matches"),
                    fetch("/api/data/stats"),
                ]);

                if (matchesRes.ok) {
                    const matchesData = await matchesRes.json();
                    const matches = matchesData.matches || [];
                    setMatches(matches);
                    console.log("✅ Matches loaded from database:", matches.length);
                } else if (matchesRes.status === 401) {
                    console.warn("⚠️ Not authenticated - cannot fetch matches");
                } else {
                    console.error("❌ Error fetching matches:", matchesRes.status);
                }

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    const stats = statsData.stats || [];
                    setStats(stats);
                    console.log("✅ Stats loaded from database:", stats.length);
                } else if (statsRes.status === 401) {
                    console.warn("⚠️ Not authenticated - cannot fetch stats");
                } else {
                    console.error("❌ Error fetching stats:", statsRes.status);
                }
            } catch (error) {
                console.error("❌ Error fetching matches/stats:", error);
            } finally {
                setLoading(false);
                isInitialLoad.current = false;
            }
        };

        fetchData();
    }, []);

    // Initialize stats for all teams when teams change and reset matches/stats
    useEffect(() => {
        if (teams.length > 0 && !isInitialLoad.current) {
            // Check if teams have actually changed (not just reloaded)
            const previousTeams = previousTeamsRef.current;
            const teamsChanged = teams.length !== previousTeams.length || 
                teams.some((team, index) => 
                    !previousTeams[index] || 
                    team.name !== previousTeams[index].name ||
                    JSON.stringify(team.players) !== JSON.stringify(previousTeams[index].players)
                );

            if (teamsChanged) {
                // Reset matches and stats when new teams are generated
                setMatches([]);
                
                // Create fresh stats for all teams with 0 values
                const freshStats: TeamStats[] = teams.map(team => ({
                    name: team.name,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals: 0,
                    points: 0
                }));

                setStats(freshStats);
                
                // Save fresh data to database
                Promise.all([
                    fetch("/api/data/matches", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ matches: [] }),
                    }),
                    fetch("/api/data/stats", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ stats: freshStats }),
                    })
                ]).catch(error => {
                    console.error("Error resetting matches/stats:", error);
                });

                console.log("🔄 Table reset with new teams:", teams.length);
            } else if (stats.length === 0) {
                // If teams haven't changed but we don't have stats, initialize them
                const initialStats: TeamStats[] = teams.map(team => ({
                    name: team.name,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals: 0,
                    points: 0
                }));

                // Only set stats if they're empty, don't overwrite existing ones
                setStats(prevStats => prevStats.length === 0 ? initialStats : prevStats);
            }
        }
        
        // Update the previous teams reference
        previousTeamsRef.current = teams;
    }, [teams, stats.length]);

    const updateStatsFromMatches = async (matchList: MatchResult[]) => {
        // Start with initialized stats for all teams
        const initialStats: TeamStats[] = teams.map(team => ({
            name: team.name,
            played: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            goals: 0,
            points: 0
        }));

        const newStats: TeamStats[] = [...initialStats];

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
                // Team A wins
                updateTeam(teamA, { wins: 1, points: 3, goals: scoreA - scoreB });
                updateTeam(teamB, { losses: 1, goals: scoreB - scoreA });
            } else if (scoreB > scoreA) {
                // Team B wins
                updateTeam(teamB, { wins: 1, points: 3, goals: scoreB - scoreA });
                updateTeam(teamA, { losses: 1, goals: scoreA - scoreB });
            } else {
                // Draw
                updateTeam(teamA, { draws: 1, points: 1, goals: scoreA - scoreB });
                updateTeam(teamB, { draws: 1, points: 1, goals: scoreB - scoreA });
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
                console.log("✅ Match saved to database");
                await updateStatsFromMatches(updatedMatches);
            } else if (response.status === 401) {
                console.error("❌ Not authenticated - cannot save match");
            } else {
                console.error("❌ Error saving match:", response.status);
            }
        } catch (error) {
            console.error("❌ Error saving match:", error);
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
