import { useEffect, useState } from "react";
import { TeamOfTheWeek, Team, TeamStats } from "@/types/team";

export const useTeamOfTheWeek = () => {
  const [teamOfWeek, setTeamOfWeek] = useState<TeamOfTheWeek | null>(null);
  const [teamOfWeekHistory, setTeamOfWeekHistory] = useState<TeamOfTheWeek[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamOfTheWeek = async () => {
      try {
        const response = await fetch("/api/data/team-of-the-week?month=all");
        if (response.ok) {
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
          
          setTeamOfWeekHistory(history);
          
          // Set the most recent as current
          if (history.length > 0) {
            setTeamOfWeek(history[0]);
          } else {
            setTeamOfWeek(null);
          }
        }
      } catch (error) {
        console.error("Error fetching team of the week:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamOfTheWeek();
  }, []);

  const saveTeamOfTheWeek = async (team: Team, stats: TeamStats[]) => {
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

    // Update local state immediately
    setTeamOfWeek(newTeamOfWeek);
    const updatedHistory = [newTeamOfWeek, ...teamOfWeekHistory.filter(tw => tw.month !== monthStr)];
    setTeamOfWeekHistory(updatedHistory);

    // Save to API
    try {
      const response = await fetch("/api/data/team-of-the-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: monthStr, data: newTeamOfWeek }),
      });
      if (!response.ok) {
        console.error("Error saving team of the week:", await response.text());
      }
    } catch (error) {
      console.error("Error saving team of the week:", error);
    }
  };

  const getTeamOfWeekByMonth = (month: string): TeamOfTheWeek[] => {
    return teamOfWeekHistory.filter((tw) => tw.month === month);
  };

  const clearTeamOfTheWeek = async () => {
    setTeamOfWeek(null);
    setTeamOfWeekHistory([]);
    
    // Clear all months from API
    try {
      await fetch("/api/data/team-of-the-week", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ month: "all", data: {} }),
      });
    } catch (error) {
      console.error("Error clearing team of the week:", error);
    }
  };

  return {
    teamOfWeek,
    teamOfWeekHistory,
    saveTeamOfTheWeek,
    getTeamOfWeekByMonth,
    clearTeamOfTheWeek,
    loading,
  };
};

