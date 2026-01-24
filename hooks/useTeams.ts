import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Team } from "@/types/team";
import { autoSync } from "@/lib/dataSync";

const TEAMS_QUERY_KEY = ["teams"];

export const useTeams = () => {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();

  // Fetch teams using React Query
  const {
    data: teams = [],
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: async (): Promise<Team[]> => {
      const response = await fetch("/api/data/teams");
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized");
        }
        throw new Error(`Failed to fetch teams: ${response.status}`);
      }
      const data = await response.json();
      return (data.teams || []).map((team: Team) => ({
        ...team,
        players: Array.isArray(team.players) ? team.players : [],
      }));
    },
    enabled: status === "authenticated" && !!session?.user,
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 60, // Refetch every minute
  });

  // Save teams mutation with optimistic updates
  const saveTeamsMutation = useMutation({
    mutationFn: async (newTeams: Team[]) => {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: newTeams }),
      });
      if (!response.ok) {
        throw new Error(`Failed to save teams: ${response.status}`);
      }
      return newTeams;
    },
    onMutate: async (newTeams: Team[]) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      
      // Snapshot previous value
      const previousTeams = queryClient.getQueryData<Team[]>(TEAMS_QUERY_KEY);
      
      // Optimistically update
      queryClient.setQueryData(TEAMS_QUERY_KEY, newTeams);
      
      console.log("🚀 Optimistic update: Teams updated immediately");
      return { previousTeams };
    },
    onError: (error, newTeams, context) => {
      // Rollback on error
      if (context?.previousTeams) {
        queryClient.setQueryData(TEAMS_QUERY_KEY, context.previousTeams);
        console.error("❌ Rollback: Teams save failed, reverted changes");
      }
    },
    onSuccess: (data) => {
      console.log("✅ Teams saved successfully:", data.length);
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      
      // Trigger automatic sync to update all devices
      console.log("🔄 Auto-syncing data after teams update...");
      autoSync(queryClient);
    },
    onSettled: () => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });

  // Clear teams mutation
  const clearTeamsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: [] }),
      });
      if (!response.ok) {
        throw new Error(`Failed to clear teams: ${response.status}`);
      }
      return [];
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      const previousTeams = queryClient.getQueryData<Team[]>(TEAMS_QUERY_KEY);
      queryClient.setQueryData(TEAMS_QUERY_KEY, []);
      console.log("🚀 Optimistic update: Teams cleared immediately");
      return { previousTeams };
    },
    onError: (error, variables, context) => {
      if (context?.previousTeams) {
        queryClient.setQueryData(TEAMS_QUERY_KEY, context.previousTeams);
        console.error("❌ Rollback: Teams clear failed, reverted changes");
      }
    },
    onSuccess: () => {
      console.log("✅ Teams cleared successfully");
      // Invalidate all related data
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      queryClient.invalidateQueries({ queryKey: ["teamOfWeek"] });
      
      // Trigger automatic sync to update all devices
      console.log("🔄 Auto-syncing data after teams cleared...");
      autoSync(queryClient);
    },
  });

  const setAndSaveTeams = (newTeams: Team[]) => {
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot save teams");
      return;
    }
    saveTeamsMutation.mutate(newTeams);
  };

  const clearTeams = () => {
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot clear teams");
      return;
    }
    clearTeamsMutation.mutate();
  };

  // Force refresh function
  const refreshTeams = () => {
    queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    refetch();
  };

  return { 
    teams, 
    setTeams: setAndSaveTeams, 
    clearTeams, 
    loading: loading || saveTeamsMutation.isPending || clearTeamsMutation.isPending,
    error,
    refreshTeams,
    isSaving: saveTeamsMutation.isPending,
    isClearing: clearTeamsMutation.isPending,
  };
};
