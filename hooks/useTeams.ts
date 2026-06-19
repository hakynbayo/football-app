import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Team } from "@/types/team";

const TEAMS_QUERY_KEY = ["teams"] as const;

async function fetchTeams(): Promise<Team[]> {
  const response = await fetch("/api/data/teams");
  if (response.status === 401) return [];
  if (!response.ok) throw new Error("Failed to fetch teams");
  const data = await response.json();
  return (data.teams || []).map((team: Team) => ({
    ...team,
    players: Array.isArray(team.players) ? team.players : [],
  }));
}

export const useTeams = () => {
  const queryClient = useQueryClient();

  const { data: teams = [], isLoading: loading } = useQuery({
    queryKey: TEAMS_QUERY_KEY,
    queryFn: fetchTeams,
  });

  const setTeamsMutation = useMutation({
    mutationFn: async (newTeams: Team[]) => {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: newTeams }),
      });
      if (!response.ok) throw new Error("Failed to save teams");
    },
    onMutate: async (newTeams) => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      const previous = queryClient.getQueryData<Team[]>(TEAMS_QUERY_KEY);
      queryClient.setQueryData(TEAMS_QUERY_KEY, newTeams);
      return { previous };
    },
    onError: (_err, _newTeams, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TEAMS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (team: Team) => {
      const response = await fetch("/api/data/teams", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(team),
      });
      if (!response.ok) throw new Error("Failed to update team");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch("/api/data/teams", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error("Failed to delete team");
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      const previous = queryClient.getQueryData<Team[]>(TEAMS_QUERY_KEY);
      queryClient.setQueryData(
        TEAMS_QUERY_KEY,
        (old: Team[] | undefined) => old?.filter((t) => t.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(TEAMS_QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });

  const clearTeamsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: [] }),
      });
      if (!response.ok) throw new Error("Failed to clear teams");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: TEAMS_QUERY_KEY });
      queryClient.setQueryData(TEAMS_QUERY_KEY, []);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TEAMS_QUERY_KEY });
    },
  });

  return {
    teams,
    setTeams: (newTeams: Team[]) => setTeamsMutation.mutate(newTeams),
    updateTeam: (team: Team) => updateTeamMutation.mutate(team),
    deleteTeam: (id: string) => deleteTeamMutation.mutate(id),
    clearTeams: () => clearTeamsMutation.mutate(),
    loading,
  };
};
