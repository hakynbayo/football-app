<<<<<<< HEAD
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
=======
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
import { TeamOfTheWeek, Team, TeamStats } from "@/types/team";
import { autoSync, QUERY_KEYS } from "@/lib/dataSync";

const TEAM_OF_WEEK_QUERY_KEY = QUERY_KEYS.TEAM_OF_WEEK;

const TOTW_QUERY_KEY = ["team-of-the-week"] as const;

async function fetchTeamOfTheWeek(): Promise<TeamOfTheWeek[]> {
  const response = await fetch("/api/data/team-of-the-week?month=all");
  if (response.status === 401) return [];
  if (!response.ok) throw new Error("Failed to fetch team of the week");
  const result = await response.json();
  return result.entries || [];
}

export const useTeamOfTheWeek = () => {
<<<<<<< HEAD
  const queryClient = useQueryClient();

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: TOTW_QUERY_KEY,
    queryFn: fetchTeamOfTheWeek,
  });

  // Most recent entry
  const teamOfWeek = history.length > 0 ? history[0] : null;

  const saveMutation = useMutation({
    mutationFn: async ({
      month,
      teamName,
      players,
      date,
    }: {
      month: string;
      teamName: string;
      players: string[];
      date: string;
    }) => {
      const response = await fetch("/api/data/team-of-the-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month, teamName, players, date }),
      });
      if (!response.ok) throw new Error("Failed to save team of the week");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TOTW_QUERY_KEY });
    },
  });

  const clearMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/data/team-of-the-week", {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to clear team of the week");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TOTW_QUERY_KEY });
      queryClient.setQueryData(TOTW_QUERY_KEY, []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TOTW_QUERY_KEY });
    },
  });

  const saveTeamOfTheWeek = (team: Team, _stats: TeamStats[]) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    saveMutation.mutate({
      month: monthStr,
      teamName: team.name,
      players: team.players,
      date: dateStr,
    });
=======
  const [teamOfWeek, setTeamOfWeek] = useState<TeamOfTheWeek | null>(null);
  const [teamOfWeekHistory, setTeamOfWeekHistory] = useState<TeamOfTheWeek[]>([]);
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // Fetch team of the week using React Query
  const {
    data: teamOfWeekData,
    isLoading: loading,
    refetch
  } = useQuery({
    queryKey: TEAM_OF_WEEK_QUERY_KEY,
    queryFn: async () => {
      const response = await fetch("/api/data/team-of-the-week?month=all");
      if (!response.ok) {
        if (response.status === 401) throw new Error("Unauthorized");
        throw new Error(`Failed to fetch team of the week: ${response.status}`);
      }
      const result = await response.json();
      const allData = result.data || {};
      
      // Convert month-keyed object to array
      const history: TeamOfTheWeek[] = Object.values(allData) as TeamOfTheWeek[];
      
      // Sort by month (most recent first)
      history.sort((a, b) => {
        if (a.month > b.month) return -1;
        if (a.month < b.month) return 1;
        return 0;
      });
      
      return {
        history,
        current: history.length > 0 ? history[0] : null
      };
    },
    enabled: status === "authenticated" && !!session?.user,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  // Update local state when query data changes
  useEffect(() => {
    if (teamOfWeekData) {
      setTeamOfWeekHistory(teamOfWeekData.history);
      setTeamOfWeek(teamOfWeekData.current);
    }
  }, [teamOfWeekData]);

  // Save team of the week mutation
  const saveTeamOfWeekMutation = useMutation({
    mutationFn: async ({ team, stats }: { team: Team, stats: TeamStats[] }) => {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const monthStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      const newTeamOfWeek: TeamOfTheWeek = {
        team,
        date: dateStr,
        month: monthStr,
      };

      const response = await fetch("/api/data/team-of-the-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: monthStr, data: newTeamOfWeek }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save team of the week: ${response.status}`);
      }
      
      return newTeamOfWeek;
    },
    onMutate: async ({ team }) => {
      await queryClient.cancelQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
      
      const previousData = queryClient.getQueryData(TEAM_OF_WEEK_QUERY_KEY);
      
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const monthStr = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, "0")}`;

      const newTeamOfWeek: TeamOfTheWeek = {
        team,
        date: dateStr,
        month: monthStr,
      };

      // Optimistically update
      const updatedHistory = [newTeamOfWeek, ...teamOfWeekHistory.filter(tw => tw.month !== monthStr)];
      
      queryClient.setQueryData(TEAM_OF_WEEK_QUERY_KEY, {
        history: updatedHistory,
        current: newTeamOfWeek
      });
      
      setTeamOfWeek(newTeamOfWeek);
      setTeamOfWeekHistory(updatedHistory);
      
      console.log("🚀 Optimistic update: Team of the week updated immediately");
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(TEAM_OF_WEEK_QUERY_KEY, context.previousData);
      }
      console.error("❌ Rollback: Team of the week save failed, reverted changes");
    },
    onSuccess: () => {
      console.log("✅ Team of the week saved successfully");
      
      // Trigger automatic sync to update all devices
      console.log("🔄 Auto-syncing data after team of the week update...");
      autoSync(queryClient);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
    },
  });

  // Clear team of the week mutation
  const clearTeamOfWeekMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/data/team-of-the-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: "all", data: {} }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to clear team of the week: ${response.status}`);
      }
      
      return { history: [], current: null };
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
      
      const previousData = queryClient.getQueryData(TEAM_OF_WEEK_QUERY_KEY);
      
      queryClient.setQueryData(TEAM_OF_WEEK_QUERY_KEY, {
        history: [],
        current: null
      });
      
      setTeamOfWeek(null);
      setTeamOfWeekHistory([]);
      
      console.log("🚀 Optimistic update: Team of the week cleared immediately");
      return { previousData };
    },
    onError: (error, variables, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(TEAM_OF_WEEK_QUERY_KEY, context.previousData);
      }
      console.error("❌ Rollback: Team of the week clear failed, reverted changes");
    },
    onSuccess: () => {
      console.log("✅ Team of the week cleared successfully");
      
      // Trigger automatic sync to update all devices
      console.log("🔄 Auto-syncing data after team of the week cleared...");
      autoSync(queryClient);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
    },
  });

  const saveTeamOfTheWeek = (team: Team, stats: TeamStats[]) => {
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot save team of the week");
      return;
    }
    saveTeamOfWeekMutation.mutate({ team, stats });
  };

  const clearTeamOfTheWeek = () => {
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot clear team of the week");
      return;
    }
    clearTeamOfWeekMutation.mutate();
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
  };

  const getTeamOfWeekByMonth = (month: string): TeamOfTheWeek[] => {
    return history.filter((tw) => tw.month === month);
  };

<<<<<<< HEAD
  const clearTeamOfTheWeek = () => {
    clearMutation.mutate();
=======
  // Force refresh function
  const refreshTeamOfWeek = () => {
    queryClient.invalidateQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
    refetch();
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
  };

  return {
    teamOfWeek,
    teamOfWeekHistory: history,
    saveTeamOfTheWeek,
    getTeamOfWeekByMonth,
    clearTeamOfTheWeek,
    loading: loading || saveTeamOfWeekMutation.isPending || clearTeamOfWeekMutation.isPending,
    refreshTeamOfWeek,
    isSaving: saveTeamOfWeekMutation.isPending,
    isClearing: clearTeamOfWeekMutation.isPending,
  };
};
