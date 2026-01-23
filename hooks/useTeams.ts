import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Team } from "@/types/team";

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchTeams = async () => {
      // Don't fetch if session is still loading
      if (status === "loading") {
        return;
      }

      // Don't fetch if not authenticated
      if (status === "unauthenticated" || !session?.user) {
        console.warn("⚠️ Not authenticated - cannot fetch teams");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/data/teams");
        if (response.ok) {
          const data = await response.json();
          const valid = (data.teams || []).map((team: Team) => ({
            ...team,
            players: Array.isArray(team.players) ? team.players : [],
          }));
          setTeams(valid);
          console.log("✅ Teams loaded from database:", valid.length);
        } else if (response.status === 401) {
          console.warn("⚠️ Not authenticated - cannot fetch teams");
        } else {
          const errorText = await response.text();
          console.error("❌ Error fetching teams:", response.status, errorText);
        }
      } catch (error) {
        console.error("❌ Error fetching teams:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [session, status]); // Add session and status as dependencies

  const setAndSaveTeams = async (newTeams: Team[]) => {
    // Don't save if not authenticated
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot save teams");
      return;
    }

    setTeams(newTeams);
    try {
      const response = await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: newTeams }),
      });
      if (response.ok) {
        console.log("✅ Teams saved to database:", newTeams.length);
      } else if (response.status === 401) {
        console.error("❌ Not authenticated - cannot save teams");
      } else {
        const errorText = await response.text();
        console.error("❌ Error saving teams:", response.status, errorText);
      }
    } catch (error) {
      console.error("❌ Error saving teams:", error);
    }
  };

  const clearTeams = async () => {
    // Don't clear if not authenticated
    if (status !== "authenticated" || !session?.user) {
      console.error("❌ Not authenticated - cannot clear teams");
      return;
    }

    setTeams([]);
    try {
      await fetch("/api/data/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teams: [] }),
      });
      console.log("✅ Teams cleared from database");
    } catch (error) {
      console.error("❌ Error clearing teams:", error);
    }
  };

  return { teams, setTeams: setAndSaveTeams, clearTeams, loading };
};
