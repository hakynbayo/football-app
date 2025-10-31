// lib/localStorageUtils.ts

export const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const getFromStorage = <T>(key: string, fallback: T): T => {
  if (typeof window === "undefined") return fallback;
  const stored = localStorage.getItem(key);
  return stored ? (JSON.parse(stored) as T) : fallback;
};

export const STORAGE_KEYS = {
  TEAMS: "teams",
  STATS: "teamStats",
  MATCHES: "matches",
  TEAM_OF_THE_WEEK: "teamOfTheWeek",
  TEAM_OF_THE_WEEK_HISTORY: "teamOfTheWeekHistory",
} as const;
