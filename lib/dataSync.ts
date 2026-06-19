// Global data synchronization utilities
import { QueryClient } from "@tanstack/react-query";

export const QUERY_KEYS = {
  TEAMS: ["teams"],
  MATCHES: ["matches"],
  STATS: ["stats"],
  TEAM_OF_WEEK: ["teamOfWeek"],
} as const;

// Global sync state for visual feedback
let globalSyncCallback: (() => void) | null = null;

export const setGlobalSyncCallback = (callback: () => void) => {
  globalSyncCallback = callback;
};

// Invalidate all data queries to force refresh
export const invalidateAllData = (queryClient: QueryClient) => {
  console.log("🔄 Invalidating all data queries for fresh sync");
  
  Object.values(QUERY_KEYS).forEach(key => {
    queryClient.invalidateQueries({ queryKey: key });
  });
};

// Force refetch all data (more aggressive than invalidate)
export const refetchAllData = (queryClient: QueryClient) => {
  console.log("🔄 Force refetching all data");
  
  Object.values(QUERY_KEYS).forEach(key => {
    queryClient.refetchQueries({ queryKey: key });
  });
};

// Set up periodic data sync (call this in your main app)
export const setupPeriodicSync = (queryClient: QueryClient, intervalMs: number = 30000) => {
  const interval = setInterval(() => {
    console.log("⏰ Periodic data sync triggered");
    invalidateAllData(queryClient);
  }, intervalMs);

  return () => clearInterval(interval);
};

// Manual sync function for user-triggered refresh
export const manualSync = (queryClient: QueryClient) => {
  console.log("👤 Manual sync triggered");
  
  // Trigger visual feedback if callback is set
  if (globalSyncCallback) {
    globalSyncCallback();
  }
  
  refetchAllData(queryClient);
};

// Auto sync function called after data changes
export const autoSync = (queryClient: QueryClient) => {
  console.log("🤖 Auto sync triggered after data change");
  
  // Trigger visual feedback if callback is set
  if (globalSyncCallback) {
    globalSyncCallback();
  }
  
  // Use invalidate for auto-sync to be less aggressive
  invalidateAllData(queryClient);
};