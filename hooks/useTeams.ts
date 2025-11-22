import { useEffect, useState } from "react";
import { Team } from "@/types/team";

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch("/api/data/teams");
        if (response.ok) {
          const data = await response.json();
          const valid = (data.teams || []).map((team: Team) => ({
            ...team,
            players: Array.isArray(team.players) ? team.players : [],
          }));
          setTeams(valid);
        }
      } catch (error) {
        console.error("Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const setAndSaveTeams = async (newTeams: Team[]) => {
    setTeams(newTeams);
    try {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: newTeams }),
      });
      if (!response.ok) {
        console.error("Error saving teams:", await response.text());
      }
    } catch (error) {
      console.error("Error saving teams:", error);
    }
  };

  const clearTeams = async () => {
    setTeams([]);
    try {
      await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: [] }),
      });
    } catch (error) {
      console.error("Error clearing teams:", error);
    }
  };

  return { teams, setTeams: setAndSaveTeams, clearTeams, loading };
};
