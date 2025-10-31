import { useEffect, useState } from "react";
import { TeamOfTheWeek, Team, TeamStats } from "@/types/team";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

export const useTeamOfTheWeek = () => {
  const [teamOfWeek, setTeamOfWeek] = useState<TeamOfTheWeek | null>(null);
  const [teamOfWeekHistory, setTeamOfWeekHistory] = useState<TeamOfTheWeek[]>(
    []
  );

  useEffect(() => {
    const savedTeamOfWeek = getFromStorage<TeamOfTheWeek | null>(
      STORAGE_KEYS.TEAM_OF_THE_WEEK,
      null
    );
    const savedHistory = getFromStorage<TeamOfTheWeek[]>(
      STORAGE_KEYS.TEAM_OF_THE_WEEK_HISTORY,
      []
    );
    setTeamOfWeek(savedTeamOfWeek);
    setTeamOfWeekHistory(savedHistory);
  }, []);

  const saveTeamOfTheWeek = (team: Team, stats: TeamStats[]) => {
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

    setTeamOfWeek(newTeamOfWeek);
    saveToStorage(STORAGE_KEYS.TEAM_OF_THE_WEEK, newTeamOfWeek);

    // Add to history
    const updatedHistory = [newTeamOfWeek, ...teamOfWeekHistory];
    setTeamOfWeekHistory(updatedHistory);
    saveToStorage(STORAGE_KEYS.TEAM_OF_THE_WEEK_HISTORY, updatedHistory);
  };

  const getTeamOfWeekByMonth = (month: string): TeamOfTheWeek[] => {
    return teamOfWeekHistory.filter((tw) => tw.month === month);
  };

  const clearTeamOfTheWeek = () => {
    setTeamOfWeek(null);
    setTeamOfWeekHistory([]);
    localStorage.removeItem(STORAGE_KEYS.TEAM_OF_THE_WEEK);
    localStorage.removeItem(STORAGE_KEYS.TEAM_OF_THE_WEEK_HISTORY);
  };

  return {
    teamOfWeek,
    teamOfWeekHistory,
    saveTeamOfTheWeek,
    getTeamOfWeekByMonth,
    clearTeamOfTheWeek,
  };
};

