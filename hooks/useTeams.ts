import { useEffect, useState } from "react";
import { Team } from "@/types/team";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "@/lib/storage";

export const useTeams = () => {
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const saved = getFromStorage<Team[]>(STORAGE_KEYS.TEAMS, []);
    setTeams(saved);
  }, []);

  const setAndSaveTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
    saveToStorage(STORAGE_KEYS.TEAMS, newTeams);
  };

  const clearTeams = () => {
    setTeams([]);
    localStorage.removeItem(STORAGE_KEYS.TEAMS);
  };

  return { teams, setTeams: setAndSaveTeams, clearTeams };
};
