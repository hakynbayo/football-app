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
            const response = await fetch("/api/data/matches", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teamA, teamB, scoreA, scoreB }),
            });
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
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ matchId: id }),
            });
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
    };

    return {
        matches,
        stats,
        addMatchResult,
        removeMatch,
        clearMatchResults,
        loading: matchesLoading || statsLoading,
    };
};
