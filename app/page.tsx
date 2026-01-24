"use client"
import { ResetTeamsButton } from "@/components/ResetModal";
import MatchHistory from "@/components/shared/MatchHistory";
import MatchInput from "@/components/shared/MatchInput";
import PlayerInputForm from "@/components/shared/PlayerInputForm";
import StatsTable from "@/components/shared/StatsTable";
import TeamCard from "@/components/shared/TeamCard";
import TeamOfTheWeekComponent from "@/components/shared/TeamOfTheWeek";
import { useMatchResults } from "@/hooks/useMatchResult";
import { useTeams } from "@/hooks/useTeams";
import { useTeamOfTheWeek } from "@/hooks/useTeamOfTheWeek";
import { manualSync, setGlobalSyncCallback } from "@/lib/dataSync";
import { Team } from "@/types/team";
import {
  Users,
  Trophy,
  History,
  PlusCircle,
  Plus,
  LogIn,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useState, useEffect } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type TabType = "teams" | "matches" | "history" | "standings";

export default function HomePage() {
  const { teams, setTeams, refreshTeams } = useTeams();
  const [playerText, setPlayerText] = useState("");
  const queryClient = useQueryClient();
  const [isAutoSyncing, setIsAutoSyncing] = useState(false);

  // Custom sync function with visual feedback
  const handleManualSync = () => {
    setIsAutoSyncing(true);
    manualSync(queryClient);
    // Reset the syncing state after a short delay
    setTimeout(() => setIsAutoSyncing(false), 2000);
  };

  // Set up global sync callback for auto-sync visual feedback
  useEffect(() => {
    const triggerAutoSyncFeedback = () => {
      setIsAutoSyncing(true);
      setTimeout(() => setIsAutoSyncing(false), 1500);
    };
    
    setGlobalSyncCallback(triggerAutoSyncFeedback);
    
    // Cleanup
    return () => setGlobalSyncCallback(() => {});
  }, []);
  const { stats, matches, addMatchResult, removeMatch, clearMatchResults } = useMatchResults(teams);
  const { teamOfWeek, saveTeamOfTheWeek, getTeamOfWeekByMonth } = useTeamOfTheWeek();
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const { data: session, status } = useSession();
  const router = useRouter();

  // Check database connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        
        if (data.turso === "configured" && data.database === "connected") {
          console.log("✅ TURSO DATABASE CONNECTED");
          console.log("📊 Database Status:", data);
        } else if (data.database === "connected") {
          console.log("✅ LOCAL SQLITE CONNECTED");
          console.log("📊 Database Status:", data);
        } else {
          console.warn("⚠️ DATABASE NOT CONNECTED");
          console.log("📊 Database Status:", data);
        }
      } catch (error) {
        console.error("❌ Failed to check database connection:", error);
      }
    };

    checkConnection();
  }, []);

  // Check if user is admin
  const isAdmin = session?.user?.role === "admin";

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      const result = await signOut({
        redirect: false,
        callbackUrl: "/login"
      });
      // Force redirect after sign out
      if (result) {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Force redirect on error
      router.push("/login");
    }
  };

  const handleGenerateTeams = (teams: Team[]) => {
    setTeams(teams);
  };

  const handleAddTeam = () => {
    if (teams.length === 0) {
      alert("Please generate teams first!");
      return;
    }

    // Get the number of players from the first existing team
    const playersPerTeam = teams[0].players.length;

    const newTeam: Team = {
      name: "Team New Player",
      players: Array.from({ length: playersPerTeam }, (_, i) => `New Player ${i + 1}`),
    };

    setTeams([...teams, newTeam]);
  };

  const handleUpdateTeam = (index: number, updatedTeam: Team) => {
    const updatedTeams = [...teams];
    updatedTeams[index] = updatedTeam;
    setTeams(updatedTeams);
  };

  const handleDeleteTeam = (index: number) => {
    const updatedTeams = teams.filter((_, i) => i !== index);
    setTeams(updatedTeams);
  };

  const handleFinish = (winningTeam: Team) => {
    saveTeamOfTheWeek(winningTeam, stats);
    clearMatchResults();
  };

  const tabs = [
    { id: "teams" as TabType, label: "Teams", icon: Users },
    { id: "matches" as TabType, label: "Matches", icon: PlusCircle },
    { id: "history" as TabType, label: "History", icon: History },
    { id: "standings" as TabType, label: "Table", icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pb-20">
      {/* Header - Fixed at top */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 z-50">
              <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white dark:text-black" />
              </div>
              <div>
                <h1 className="text-sm md:text-lg font-bold text-black dark:text-white">
                  Football League
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Match Tracker
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Sync Button */}
              {session && (
                <button
                  onClick={handleManualSync}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isAutoSyncing 
                      ? "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 animate-pulse" 
                      : "bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-600 dark:text-blue-400"
                  }`}
                  title={isAutoSyncing ? "Syncing data..." : "Sync data across devices"}
                  disabled={isAutoSyncing}
                >
                  <RefreshCw className={`w-4 h-4 ${isAutoSyncing ? "animate-spin" : ""}`} />
                </button>
              )}
              
              {status === "loading" ? (
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800 animate-pulse" />
              ) : session ? (
                <>
                  <div className="flex items-center gap-2">
                    
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.user?.role === "admin"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
                      {session.user?.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-3 py-2 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-lg transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </button>
              )}
              <ResetTeamsButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-md mx-auto px-4 py-4">
          {/* Teams Tab */}
          {activeTab === "teams" && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              {isAdmin && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <Users className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black dark:text-white">
                        Generate Teams
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Create balanced teams
                      </p>
                    </div>
                  </div>
                  <PlayerInputForm
                    playerText={playerText}
                    setPlayerText={setPlayerText}
                    onGenerateTeams={handleGenerateTeams}
                  />
                </div>
              )}

              {!isAdmin && teams.length === 0 && (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">No teams available</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contact an admin to generate teams</p>
                </div>
              )}

              {teams.length > 0 && (
                <>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center">
                          <Trophy className="w-4 h-4 text-white dark:text-black" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-black dark:text-white">
                            Teams
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {teams.length} {teams.length === 1 ? "team" : "teams"} ready
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {teams.map((team, index) => (
                        <TeamCard
                          key={index}
                          team={team}
                          teamIndex={index}
                          onUpdateTeam={handleUpdateTeam}
                          onDeleteTeam={handleDeleteTeam}
                        />
                      ))}
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <button
                      onClick={handleAddTeam}
                      className="w-[60%] mx-auto flex items-center justify-center gap-2 p-3 bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 text-white dark:text-black rounded-xl transition-all duration-200 font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add New Team
                    </button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Matches Tab */}
          {activeTab === "matches" && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              {isAdmin ? (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                      <PlusCircle className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-black dark:text-white">
                        Match Result
                      </h2>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Enter game scores
                      </p>
                    </div>
                  </div>
                  <MatchInput
                    teams={teams.map((t) => t.name)}
                    onSubmit={(teamA, teamB, scoreA, scoreB) =>
                      addMatchResult(teamA, teamB, Number(scoreA), Number(scoreB))
                    }
                  />
                </div>
              ) : (
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlusCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">Admin Only</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Only admins can enter match results</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <MatchHistory matches={matches} removeMatch={removeMatch} />
              </div>
            </div>
          )}

          {/* Standings Tab */}
          {activeTab === "standings" && (
            <div className="space-y-4 animate-in slide-in-from-right duration-300">
              {/* League Standings */}
              <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-full flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-black dark:text-white">
                      League Table
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Current standings
                    </p>
                  </div>
                </div>
                <StatsTable
                  stats={stats}
                  teams={teams}
                  onFinish={handleFinish}
                />
              </div>

              {/* Team of the Week Section */}
              <TeamOfTheWeekComponent
                teamOfWeek={teamOfWeek}
                getTeamOfWeekByMonth={getTeamOfWeekByMonth}
              />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Navigation - Fixed at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-20">
        <div className="max-w-md mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 flex-1 relative ${isActive
                    ? "text-black dark:text-white"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded-xl" />
                  )}
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform duration-300`} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-black dark:bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
