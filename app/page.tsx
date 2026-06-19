"use client";
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
<<<<<<< HEAD
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Team, GoalEvent } from "@/types/team";
import GoalLeaderboard from "@/components/shared/GoalLeaderboard";
=======
import { manualSync, setGlobalSyncCallback } from "@/lib/dataSync";
import { Team } from "@/types/team";
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
import {
  Users,
  Trophy,
  History,
  PlusCircle,
  Plus,
  LogIn,
  LogOut,
<<<<<<< HEAD
  User,
  Target,
=======
  RefreshCw,
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

type TabType = "teams" | "matches" | "history" | "standings" | "leaderboard";

export default function HomePage() {
<<<<<<< HEAD
  const { teams, setTeams, updateTeam, deleteTeam } = useTeams();
  const [playerText, setPlayerText] = useState("");
  const { stats, addMatchResult, clearMatchResults } = useMatchResults();
  const { teamOfWeek, saveTeamOfTheWeek, getTeamOfWeekByMonth } =
    useTeamOfTheWeek();
  const { leaderboard } = useLeaderboard();
=======
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const { data: session, status } = useSession();
  const router = useRouter();

  const isAdmin = session?.user?.role === "admin";

  const handleLogin = () => {
    router.push("/login");
  };

  const handleLogout = async () => {
    try {
      const result = await signOut({
        redirect: false,
        callbackUrl: "/login",
      });
      if (result) {
        window.location.href = "/login";
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  const handleGenerateTeams = (newTeams: Team[]) => {
    setTeams(newTeams);
  };

  const handleAddTeam = () => {
    if (teams.length === 0) {
      alert("Please generate teams first!");
      return;
    }

    const playersPerTeam = teams[0].players.length;

    const newTeam: Team = {
      name: "Team New Player",
      players: Array.from(
        { length: playersPerTeam },
        (_, i) => `New Player ${i + 1}`,
      ),
    };

    setTeams([...teams, newTeam]);
  };

  const handleUpdateTeam = (_index: number, updatedTeam: Team) => {
    if (updatedTeam.id) {
      updateTeam(updatedTeam);
    } else {
      // Fallback: replace all teams (for teams without IDs yet)
      const updatedTeams = teams.map((t, i) => (i === _index ? updatedTeam : t));
      setTeams(updatedTeams);
    }
  };

  const handleDeleteTeam = (index: number) => {
    const team = teams[index];
    if (team.id) {
      deleteTeam(team.id);
    } else {
      const updatedTeams = teams.filter((_, i) => i !== index);
      setTeams(updatedTeams);
    }
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
    { id: "leaderboard" as TabType, label: "Goals", icon: Target },
  ];

  return (
<<<<<<< HEAD
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col pb-20">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
=======
    <div className="min-h-screen bg-white dark:bg-black flex flex-col pb-20">
      {/* Header - Fixed at top */}
      <header className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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
<<<<<<< HEAD
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${session.user?.role === "admin"
                        ? "bg-blue-600 text-white"
                        : "bg-green-600 text-white"
                        }`}
                    >
=======
                  <div className="flex items-center gap-2">
                    
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.user?.role === "admin"
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                      }`}>
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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

      {/* Main Content */}
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
<<<<<<< HEAD
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">
                    No teams available. Please contact an admin to generate
                    teams.
                  </p>
=======
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">No teams available</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Contact an admin to generate teams</p>
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
                </div>
              )}

              {teams.length > 0 && (
                <>
<<<<<<< HEAD
                  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                        Generated Teams
                      </h2>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                          {teams.length}{" "}
                          {teams.length === 1 ? "team" : "teams"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {teams.map((team, index) => (
                        <TeamCard
                          key={team.id || index}
=======
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
                          team={team}
                          teamIndex={index}
                          onUpdateTeam={handleUpdateTeam}
                          onDeleteTeam={handleDeleteTeam}
                        />
                      ))}
                    </div>
                  </div>
<<<<<<< HEAD
=======
                  
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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
                    teams={teams}
                    onSubmit={(
                      teamA: string,
                      teamB: string,
                      scoreA: number,
                      scoreB: number,
                      goals: GoalEvent[],
                    ) => addMatchResult(teamA, teamB, scoreA, scoreB, goals)}
                  />
                </div>
              ) : (
<<<<<<< HEAD
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">
                    Only admins can enter match results.
                  </p>
=======
                <div className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-6 text-center border border-gray-200 dark:border-gray-800">
                  <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <PlusCircle className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                  </div>
                  <p className="text-gray-800 dark:text-gray-200 font-medium">Admin Only</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Only admins can enter match results</p>
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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
<<<<<<< HEAD
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
=======
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
                  </div>
                </div>
                <StatsTable
                  stats={stats}
                  teams={teams}
                  onFinish={handleFinish}
                />
              </div>

              <TeamOfTheWeekComponent
                teamOfWeek={teamOfWeek}
                getTeamOfWeekByMonth={getTeamOfWeekByMonth}
              />
            </div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Top Scorers & Assists
                  </h2>
                </div>
                <GoalLeaderboard leaderboard={leaderboard} />
              </div>
            </div>
          )}
        </div>
      </main>

<<<<<<< HEAD
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20">
        <div className="max-w-2xl mx-auto px-4 py-2">
=======
      {/* Bottom Navigation - Fixed at bottom */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-gray-200 dark:border-gray-800 z-20">
        <div className="max-w-md mx-auto px-4 py-2">
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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
<<<<<<< HEAD
                  <Icon
                    className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`}
                  />
                  <span className="text-xs font-medium">{tab.label}</span>
=======
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
                </button>
              );
            })}
          </div>
        </div>
      </nav>
    </div>
  );
}
