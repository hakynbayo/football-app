import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MatchResult, TeamStats, Team } from "@/types/team";

const MATCHES_QUERY_KEY = ["matches"];
const STATS_QUERY_KEY = ["stats"];

export const useMatchResults = (teams: Team[] = []) => {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const isInitialLoad = useRef(true);
    const previousTeamsRef = useRef<Team[]>([]);

    // Fetch matches using React Query
    const {
        data: matches = [],
        isLoading: matchesLoading,
        refetch: refetchMatches
    } = useQuery({
        queryKey: MATCHES_QUERY_KEY,
        queryFn: async (): Promise<MatchResult[]> => {
            const response = await fetch("/api/data/matches");
            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized");
                throw new Error(`Failed to fetch matches: ${response.status}`);
            }
            const data = await response.json();
            return data.matches || [];
        },
        enabled: status === "authenticated" && !!session?.user,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });

    // Fetch stats using React Query
    const {
        data: stats = [],
        isLoading: statsLoading,
        refetch: refetchStats
    } = useQuery({
        queryKey: STATS_QUERY_KEY,
        queryFn: async (): Promise<TeamStats[]> => {
            const response = await fetch("/api/data/stats");
            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized");
                throw new Error(`Failed to fetch stats: ${response.status}`);
            }
            const data = await response.json();
            return data.stats || [];
        },
        enabled: status === "authenticated" && !!session?.user,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });

    const loading = matchesLoading || statsLoading;

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
                const freshStats: TeamStats[] = teams.map(team => ({
                    name: team.name,
                    played: 0,
                    wins: 0,
                    draws: 0,
                    losses: 0,
                    goals: 0,
                    points: 0
                }));

                // Optimistically update both matches and stats
                queryClient.setQueryData(MATCHES_QUERY_KEY, []);
                queryClient.setQueryData(STATS_QUERY_KEY, freshStats);

                // Save fresh data to database
                if (status === "authenticated" && session?.user) {
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
                    ]).then(() => {
                        // Invalidate queries to ensure consistency
                        queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
                        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
                    }).catch(error => {
                        console.error("Error resetting matches/stats:", error);
                    });
                }

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
                if (stats.length === 0) {
                    queryClient.setQueryData(STATS_QUERY_KEY, initialStats);
                }
            }
        }
        
        // Update the previous teams reference
        previousTeamsRef.current = teams;
        isInitialLoad.current = false;
    }, [teams, stats.length, queryClient, session, status]);

    const updateStatsFromMatches = (matchList: MatchResult[]) => {
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

        return newStats;
    };

    // Add match mutation with optimistic updates
    const addMatchMutation = useMutation({
        mutationFn: async ({ teamA, teamB, scoreA, scoreB }: { teamA: string, teamB: string, scoreA: number, scoreB: number }) => {
            const newMatch: MatchResult = { teamA, teamB, scoreA, scoreB };
            const updatedMatches = [...matches, newMatch];
            
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matches: updatedMatches }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to save match: ${response.status}`);
            }
            
            return { newMatch, updatedMatches };
        },
        onMutate: async ({ teamA, teamB, scoreA, scoreB }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
            await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY });
            
            // Snapshot previous values
            const previousMatches = queryClient.getQueryData<MatchResult[]>(MATCHES_QUERY_KEY) || [];
            const previousStats = queryClient.getQueryData<TeamStats[]>(STATS_QUERY_KEY) || [];
            
            // Create new match and updated matches
            const newMatch: MatchResult = { teamA, teamB, scoreA, scoreB };
            const updatedMatches = [...previousMatches, newMatch];
            
            // Calculate new stats
            const newStats = updateStatsFromMatches(updatedMatches);
            
            // Optimistically update
            queryClient.setQueryData(MATCHES_QUERY_KEY, updatedMatches);
            queryClient.setQueryData(STATS_QUERY_KEY, newStats);
            
            console.log("🚀 Optimistic update: Match added immediately");
            return { previousMatches, previousStats };
        },
        onError: (error, variables, context) => {
            // Rollback on error
            if (context?.previousMatches) {
                queryClient.setQueryData(MATCHES_QUERY_KEY, context.previousMatches);
            }
            if (context?.previousStats) {
                queryClient.setQueryData(STATS_QUERY_KEY, context.previousStats);
            }
            console.error("❌ Rollback: Match add failed, reverted changes");
        },
        onSuccess: async ({ updatedMatches }) => {
            console.log("✅ Match saved successfully");
            
            // Update stats in database
            const newStats = updateStatsFromMatches(updatedMatches);
            try {
                await fetch("/api/data/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stats: newStats }),
                });
                console.log("✅ Stats updated successfully");
            } catch (error) {
                console.error("❌ Error updating stats:", error);
            }
        },
        onSettled: () => {
            // Always refetch to ensure consistency
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        },
    });

    // Remove match mutation
    const removeMatchMutation = useMutation({
        mutationFn: async (index: number) => {
            const updatedMatches = matches.filter((_, i) => i !== index);
            
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matches: updatedMatches }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to remove match: ${response.status}`);
            }
            
            return { updatedMatches, removedIndex: index };
        },
        onMutate: async (index: number) => {
            await queryClient.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
            await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY });
            
            const previousMatches = queryClient.getQueryData<MatchResult[]>(MATCHES_QUERY_KEY) || [];
            const previousStats = queryClient.getQueryData<TeamStats[]>(STATS_QUERY_KEY) || [];
            
            const updatedMatches = previousMatches.filter((_, i) => i !== index);
            const newStats = updateStatsFromMatches(updatedMatches);
            
            queryClient.setQueryData(MATCHES_QUERY_KEY, updatedMatches);
            queryClient.setQueryData(STATS_QUERY_KEY, newStats);
            
            console.log("🚀 Optimistic update: Match removed immediately");
            return { previousMatches, previousStats };
        },
        onError: (error, variables, context) => {
            if (context?.previousMatches) {
                queryClient.setQueryData(MATCHES_QUERY_KEY, context.previousMatches);
            }
            if (context?.previousStats) {
                queryClient.setQueryData(STATS_QUERY_KEY, context.previousStats);
            }
            console.error("❌ Rollback: Match remove failed, reverted changes");
        },
        onSuccess: async ({ updatedMatches }) => {
            console.log("✅ Match removed successfully");
            
            const newStats = updateStatsFromMatches(updatedMatches);
            try {
                await fetch("/api/data/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stats: newStats }),
                });
            } catch (error) {
                console.error("❌ Error updating stats:", error);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        },
    });

    // Clear matches mutation
    const clearMatchesMutation = useMutation({
        mutationFn: async () => {
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
            return { matches: [], stats: [] };
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
            await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY });
            
            const previousMatches = queryClient.getQueryData<MatchResult[]>(MATCHES_QUERY_KEY);
            const previousStats = queryClient.getQueryData<TeamStats[]>(STATS_QUERY_KEY);
            
            queryClient.setQueryData(MATCHES_QUERY_KEY, []);
            queryClient.setQueryData(STATS_QUERY_KEY, []);
            
            console.log("🚀 Optimistic update: Matches cleared immediately");
            return { previousMatches, previousStats };
        },
        onError: (error, variables, context) => {
            if (context?.previousMatches) {
                queryClient.setQueryData(MATCHES_QUERY_KEY, context.previousMatches);
            }
            if (context?.previousStats) {
                queryClient.setQueryData(STATS_QUERY_KEY, context.previousStats);
            }
            console.error("❌ Rollback: Clear matches failed, reverted changes");
        },
        onSuccess: () => {
            console.log("✅ Matches and stats cleared successfully");
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        },
    });

    const addMatchResult = (teamA: string, teamB: string, scoreA: number, scoreB: number) => {
        if (status !== "authenticated" || !session?.user) {
            console.error("❌ Not authenticated - cannot save match");
            return;
        }
        addMatchMutation.mutate({ teamA, teamB, scoreA, scoreB });
    };

    const removeMatch = (index: number) => {
        if (status !== "authenticated" || !session?.user) {
            console.error("❌ Not authenticated - cannot remove match");
            return;
        }
        removeMatchMutation.mutate(index);
    };

    const clearMatchResults = () => {
        if (status !== "authenticated" || !session?.user) {
            console.error("❌ Not authenticated - cannot clear matches");
            return;
        }
        clearMatchesMutation.mutate();
    };

    // Force refresh function
    const refreshData = () => {
        queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
        queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
        refetchMatches();
        refetchStats();
    };

    return {
        matches,
        stats,
        addMatchResult,
        removeMatch,
        clearMatchResults,
        loading: loading || addMatchMutation.isPending || removeMatchMutation.isPending || clearMatchesMutation.isPending,
        refreshData,
        isAddingMatch: addMatchMutation.isPending,
        isRemovingMatch: removeMatchMutation.isPending,
        isClearingMatches: clearMatchesMutation.isPending,
    };
};
