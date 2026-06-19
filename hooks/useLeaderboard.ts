import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { PlayerLeaderboard, GoalEvent } from "@/types/team";

const LEADERBOARD_QUERY_KEY = ["leaderboard"] as const;

async function fetchLeaderboard(): Promise<PlayerLeaderboard[]> {
  const response = await fetch("/api/data/goals");
  if (response.status === 401) return [];
  if (!response.ok) throw new Error("Failed to fetch leaderboard");
  const data = await response.json();
  return data.leaderboard || [];
}

export const useLeaderboard = () => {
  const queryClient = useQueryClient();

  const { data: leaderboard = [], isLoading: loading } = useQuery({
    queryKey: LEADERBOARD_QUERY_KEY,
    queryFn: fetchLeaderboard,
  });

  const saveGoalsMutation = useMutation({
    mutationFn: async ({
      matchId,
      goals,
    }: {
      matchId: string;
      goals: GoalEvent[];
    }) => {
      const response = await fetch("/api/data/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, goals }),
      });
      if (!response.ok) throw new Error("Failed to save goal events");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    },
  });

  const deleteGoalsForMatchMutation = useMutation({
    mutationFn: async (matchId: string) => {
      const response = await fetch("/api/data/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId }),
      });
      if (!response.ok) throw new Error("Failed to delete goal events");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    },
  });

  const clearAllGoalsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/data/goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId: "all" }),
      });
      if (!response.ok) throw new Error("Failed to clear goal events");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: LEADERBOARD_QUERY_KEY });
      queryClient.setQueryData(LEADERBOARD_QUERY_KEY, []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: LEADERBOARD_QUERY_KEY });
    },
  });

  return {
    leaderboard,
    loading,
    saveGoals: (matchId: string, goals: GoalEvent[]) =>
      saveGoalsMutation.mutate({ matchId, goals }),
    deleteGoalsForMatch: (matchId: string) =>
      deleteGoalsForMatchMutation.mutate(matchId),
    clearAllGoals: () => clearAllGoalsMutation.mutate(),
  };
};
