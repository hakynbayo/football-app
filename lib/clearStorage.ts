// Utility to clear any localStorage data that might interfere with database operations
export const clearAllLocalStorage = () => {
  if (typeof window === "undefined") return;
  
  // Clear all localStorage
  localStorage.clear();
  
  // Also clear sessionStorage to be safe
  sessionStorage.clear();
  
  console.log("🧹 Cleared all local storage to ensure database-only operation");
};

// Clear specific keys that might have been used in previous versions
export const clearLegacyStorage = () => {
  if (typeof window === "undefined") return;
  
  const legacyKeys = [
    'teams',
    'matches', 
    'stats',
    'teamOfWeek',
    'teamOfWeekHistory',
    'players',
    'matchResults',
    'leagueData'
  ];
  
  legacyKeys.forEach(key => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
  
  console.log("🧹 Cleared legacy storage keys");
};

// Development warning to prevent localStorage usage
export const warnAgainstLocalStorage = () => {
  if (typeof window === "undefined" || process.env.NODE_ENV === "production") return;
  
  // Override localStorage methods to warn in development
  const originalSetItem = localStorage.setItem;
  const originalGetItem = localStorage.getItem;
  
  localStorage.setItem = function(key: string, value: string) {
    console.warn("⚠️ WARNING: localStorage.setItem() called! Use database instead.", { key, value });
    return originalSetItem.call(this, key, value);
  };
  
  localStorage.getItem = function(key: string) {
    console.warn("⚠️ WARNING: localStorage.getItem() called! Use database instead.", { key });
    return originalGetItem.call(this, key);
  };
};