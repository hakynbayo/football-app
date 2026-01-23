import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TeamOfTheWeek, Team, TeamStats } from "@/types/team";

const TEAM_OF_WEEK_QUERY_KEY = ["teamOfWeek"];

export const useTeamOfTheWeek = () => {
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
  };

  const getTeamOfWeekByMonth = (month: string): TeamOfTheWeek[] => {
    return teamOfWeekHistory.filter((tw) => tw.month === month);
  };

  // Force refresh function
  const refreshTeamOfWeek = () => {
    queryClient.invalidateQueries({ queryKey: TEAM_OF_WEEK_QUERY_KEY });
    refetch();
  };

  return {
    teamOfWeek,
    teamOfWeekHistory,
    saveTeamOfTheWeek,
    getTeamOfWeekByMonth,
    clearTeamOfTheWeek,
    loading: loading || saveTeamOfWeekMutation.isPending || clearTeamOfWeekMutation.isPending,
    refreshTeamOfWeek,
    isSaving: saveTeamOfWeekMutation.isPending,
    isClearing: clearTeamOfWeekMutation.isPending,
  };
};

