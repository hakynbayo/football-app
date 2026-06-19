import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TeamOfTheWeek, Team, TeamStats } from "@/types/team";

const TOTW_QUERY_KEY = ["team-of-the-week"] as const;

async function fetchTeamOfTheWeek(): Promise<TeamOfTheWeek[]> {
  const response = await fetch("/api/data/team-of-the-week?month=all");
  if (response.status === 401) return [];
  if (!response.ok) throw new Error("Failed to fetch team of the week");
  const result = await response.json();
  return result.entries || [];
}

export const useTeamOfTheWeek = () => {
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  };

  const getTeamOfWeekByMonth = (month: string): TeamOfTheWeek[] => {
    return history.filter((tw) => tw.month === month);
  };

  const clearTeamOfTheWeek = () => {
    clearMutation.mutate();
  };

  return {
    teamOfWeek,
    teamOfWeekHistory: history,
    saveTeamOfTheWeek,
    getTeamOfWeekByMonth,
    clearTeamOfTheWeek,
    loading,
  };
};
