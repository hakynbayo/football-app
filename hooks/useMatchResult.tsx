<<<<<<< HEAD
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MatchResult, TeamStats, GoalEvent } from "@/types/team";

const MATCHES_QUERY_KEY = ["matches"] as const;
const STATS_QUERY_KEY = ["stats"] as const;
const LEADERBOARD_QUERY_KEY = ["leaderboard"] as const;

async function fetchMatches(): Promise<MatchResult[]> {
    const response = await fetch("/api/data/matches");
    if (response.status === 401) return [];
    if (!response.ok) throw new Error("Failed to fetch matches");
    const data = await response.json();
    return data.matches || [];
}

async function fetchStats(): Promise<TeamStats[]> {
    const response = await fetch("/api/data/stats");
    if (response.status === 401) return [];
    if (!response.ok) throw new Error("Failed to fetch stats");
    const data = await response.json();
    return data.stats || [];
}

export const useMatchResults = () => {
    const queryClient = useQueryClient();

    const { data: matches = [], isLoading: matchesLoading } = useQuery({
        queryKey: MATCHES_QUERY_KEY,
        queryFn: fetchMatches,
    });

    const { data: stats = [], isLoading: statsLoading } = useQuery({
        queryKey: STATS_QUERY_KEY,
        queryFn: fetchStats,
    });

    const addMatchMutation = useMutation({
        mutationFn: async ({
            teamA,
            teamB,
            scoreA,
            scoreB,
            goals,
        }: {
            teamA: string;
            teamB: string;
            scoreA: number;
            scoreB: number;
            goals?: GoalEvent[];
        }) => {
=======
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MatchResult, TeamStats, Team } from "@/types/team";
import { autoSync, QUERY_KEYS } from "@/lib/dataSync";

const MATCHES_QUERY_KEY = QUERY_KEYS.MATCHES;
const STATS_QUERY_KEY = QUERY_KEYS.STATS;

export const useMatchResults = (teams: Team[] = []) => {
    const { data: session, status } = useSession();
    const queryClient = useQueryClient();
    const isInitialLoad = useRef(true);
    const previousTeamsRef = useRef<Team[]>([]);

    // Fetch matches using React Query
    const {
        data: matches = [],
        isLoading: matchesLoading,
        refetch: refetchMatches,
        error: matchesError
    } = useQuery({
        queryKey: MATCHES_QUERY_KEY,
        queryFn: async (): Promise<MatchResult[]> => {
            console.log("🔍 Fetching matches from API...");
            const response = await fetch("/api/data/matches");
            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized");
                throw new Error(`Failed to fetch matches: ${response.status}`);
            }
            const data = await response.json();
            console.log("✅ Matches fetched:", data.matches?.length || 0);
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
        refetch: refetchStats,
        error: statsError
    } = useQuery({
        queryKey: STATS_QUERY_KEY,
        queryFn: async (): Promise<TeamStats[]> => {
            console.log("🔍 Fetching stats from API...");
            const response = await fetch("/api/data/stats");
            if (!response.ok) {
                if (response.status === 401) throw new Error("Unauthorized");
                throw new Error(`Failed to fetch stats: ${response.status}`);
            }
            const data = await response.json();
            console.log("✅ Stats fetched:", data.stats?.length || 0);
            return data.stats || [];
        },
        enabled: status === "authenticated" && !!session?.user,
        staleTime: 1000 * 30, // 30 seconds
        refetchInterval: 1000 * 60, // Refetch every minute
    });

    const loading = matchesLoading || statsLoading;

    // Initialize stats for all teams when teams change and reset matches/stats
    useEffect(() => {
        // Only run this effect after both teams and data have been loaded
        if (teams.length > 0 && !matchesLoading && !statsLoading) {
            // Check if teams have actually changed (not just reloaded)
            const previousTeams = previousTeamsRef.current;
            
            // More robust team comparison - only reset if teams are genuinely different
            const teamsChanged = previousTeams.length > 0 && (
                teams.length !== previousTeams.length || 
                teams.some((team, index) => 
                    !previousTeams[index] || 
                    team.name !== previousTeams[index].name ||
                    JSON.stringify(team.players.sort()) !== JSON.stringify(previousTeams[index].players.sort())
                )
            );

            // Only reset if teams have genuinely changed AND we have previous teams to compare against
            if (teamsChanged && !isInitialLoad.current) {
                console.log("🔄 Teams have changed, resetting matches and stats");
                
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
            } else if (stats.length === 0 && teams.length > 0 && !isInitialLoad.current) {
                // If teams haven't changed but we don't have stats, initialize them (but don't reset matches)
                console.log("🔧 Initializing stats for existing teams without resetting matches");
                
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
                queryClient.setQueryData(STATS_QUERY_KEY, initialStats);
            }
        }
        
        // Update the previous teams reference
        previousTeamsRef.current = teams;
        
        // Mark initial load as complete only after we have data
        if (teams.length > 0 && !matchesLoading && !statsLoading && isInitialLoad.current) {
            isInitialLoad.current = false;
            console.log("✅ Initial data load complete");
        }
    }, [teams, stats.length, matchesLoading, statsLoading, queryClient, session, status]);

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
            
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamA, teamB, scoreA, scoreB }),
            });
<<<<<<< HEAD
            if (!response.ok) throw new Error("Failed to save match");
            const data = await response.json();
            const matchId = data.match?.id;

            // Save goal events if provided
            if (matchId && goals && goals.length > 0) {
                const cleanGoals = goals.map((g) => ({
                    ...g,
                    assist: g.assist === "none" ? null : g.assist,
                }));
                await fetch("/api/data/goals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ matchId, goals: cleanGoals }),
                });
            }

            return data;
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
        },
    });

    const removeMatchMutation = useMutation({
        mutationFn: async (id: string) => {
            // Delete goal events for this match first
            await fetch("/api/data/goals", {
                method: "DELETE",
=======
            
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
        onSuccess: async ({ updatedMatches, newMatch }) => {
            console.log("✅ Match saved successfully to database:", newMatch);
            console.log("📊 Total matches now:", updatedMatches.length);
            
            // Update stats in database
            const newStats = updateStatsFromMatches(updatedMatches);
            try {
                const response = await fetch("/api/data/stats", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ stats: newStats }),
                });
                
                if (response.ok) {
                    console.log("✅ Stats updated successfully in database");
                } else {
                    console.error("❌ Failed to update stats:", response.status);
                }
                
                // Trigger automatic sync to update all devices
                console.log("🔄 Auto-syncing data after match result...");
                autoSync(queryClient);
                
            } catch (error) {
                console.error("❌ Error updating stats:", error);
            }
        },
        onSettled: () => {
            // Don't invalidate immediately after success to avoid refetch loops
            // The autoSync will handle invalidation appropriately
            console.log("🏁 Match mutation settled");
        },
    });

    // Remove match mutation
    const removeMatchMutation = useMutation({
        mutationFn: async (index: number) => {
            const updatedMatches = matches.filter((_, i) => i !== index);
            
            const response = await fetch("/api/data/matches", {
                method: "POST",
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId: id }),
            });
<<<<<<< HEAD
            const response = await fetch("/api/data/matches", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            if (!response.ok) throw new Error("Failed to delete match");
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
            const previous = queryClient.getQueryData<MatchResult[]>(MATCHES_QUERY_KEY);
            queryClient.setQueryData(
                MATCHES_QUERY_KEY,
                (old: MatchResult[] | undefined) => old?.filter((m) => m.id !== id) ?? [],
            );
            return { previous };
        },
        onError: (_err, _id, context) => {
            if (context?.previous) {
                queryClient.setQueryData(MATCHES_QUERY_KEY, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
        },
    });

    const clearMatchesMutation = useMutation({
        mutationFn: async () => {
            // Delete all goal events
            await fetch("/api/data/goals", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId: "all" }),
            });
            const response = await fetch("/api/data/matches", {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: "all" }),
            });
            if (!response.ok) throw new Error("Failed to clear matches");
        },
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: MATCHES_QUERY_KEY });
            await queryClient.cancelQueries({ queryKey: STATS_QUERY_KEY });
            queryClient.setQueryData(MATCHES_QUERY_KEY, []);
            queryClient.setQueryData(STATS_QUERY_KEY, []);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: MATCHES_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: STATS_QUERY_KEY });
            queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
        },
    });

    const addMatchResult = (
        teamA: string,
        teamB: string,
        scoreA: number,
        scoreB: number,
        goals?: GoalEvent[],
    ) => {
        addMatchMutation.mutate({ teamA, teamB, scoreA, scoreB, goals });
    };

    const removeMatch = (id: string) => {
        removeMatchMutation.mutate(id);
    };

    const clearMatchResults = () => {
        clearMatchesMutation.mutate();
=======
            
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
                console.log("✅ Stats updated after match removal");
                
                // Trigger automatic sync to update all devices
                console.log("🔄 Auto-syncing data after match removal...");
                autoSync(queryClient);
                
            } catch (error) {
                console.error("❌ Error updating stats:", error);
            }
        },
        onSettled: () => {
            // Don't invalidate immediately after success to avoid refetch loops
            console.log("🏁 Remove match mutation settled");
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
            
            // Trigger automatic sync to update all devices
            console.log("🔄 Auto-syncing data after clearing matches...");
            autoSync(queryClient);
        },
        onSettled: () => {
            // Don't invalidate immediately after success to avoid refetch loops
            console.log("🏁 Clear matches mutation settled");
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
    };

    return {
        matches,
        stats,
        addMatchResult,
        removeMatch,
        clearMatchResults,
<<<<<<< HEAD
        loading: matchesLoading || statsLoading,
=======
        loading: loading || addMatchMutation.isPending || removeMatchMutation.isPending || clearMatchesMutation.isPending,
        refreshData,
        isAddingMatch: addMatchMutation.isPending,
        isRemovingMatch: removeMatchMutation.isPending,
        isClearingMatches: clearMatchesMutation.isPending,
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
    };
};
