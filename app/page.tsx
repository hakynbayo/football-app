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
import { Team } from "@/types/team";
import {
  Users,
  Trophy,
  History,
  PlusCircle,
  Plus,
  LogIn,
  LogOut,
  User
} from "lucide-react";
import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

type TabType = "teams" | "matches" | "history" | "standings";

export default function HomePage() {
  const { teams, setTeams } = useTeams();
  const [playerText, setPlayerText] = useState("");
  const { stats, addMatchResult, clearMatchResults } = useMatchResults();
  const { teamOfWeek, saveTeamOfTheWeek, getTeamOfWeekByMonth } = useTeamOfTheWeek();
  const [activeTab, setActiveTab] = useState<TabType>("teams");
  const { data: session, status } = useSession();
  const router = useRouter();

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col pb-20">
      {/* Header - Fixed at top */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Football App
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Team manager & match tracker
              </p>
            </div>
            <div className="flex items-center gap-2">
              {status === "loading" ? (
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 animate-pulse" />
              ) : session ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                    <User className="w-4 h-4 text-slate-600 dark:text-slate-300" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {session.user?.name || session.user?.email}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${session.user?.role === "admin"
                      ? "bg-blue-600 text-white"
                      : "bg-green-600 text-white"
                      }`}>
                      {session.user?.role === "admin" ? "Admin" : "User"}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span className="hidden sm:inline">Login</span>
                </button>
              )}
              <ResetTeamsButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-6">
          {/* Teams Tab */}
          {activeTab === "teams" && (
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              {isAdmin && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Generate Teams
                    </h2>
                  </div>
                  <PlayerInputForm
                    playerText={playerText}
                    setPlayerText={setPlayerText}
                    onGenerateTeams={handleGenerateTeams}
                  />
                </div>
              )}

              {!isAdmin && teams.length === 0 && (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">No teams available. Please contact an admin to generate teams.</p>
                </div>
              )}

              {teams.length > 0 && (
                <><div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Generated Teams
                    </h2>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                        {teams.length} {teams.length === 1 ? "team" : "teams"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                      className="w-full flex items-center justify-center gap-2 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-base text-center font-medium"
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
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              {isAdmin ? (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <PlusCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      Enter Match Result
                    </h2>
                  </div>
                  <MatchInput
                    teams={teams.map((t) => t.name)}
                    onSubmit={(teamA, teamB, scoreA, scoreB) =>
                      addMatchResult(teamA, teamB, Number(scoreA), Number(scoreB))
                    }
                  />
                </div>
              ) : (
                <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-6 text-center">
                  <p className="text-muted-foreground">Only admins can enter match results.</p>
                </div>
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <MatchHistory />
              </div>
            </div>
          )}

          {/* Standings Tab */}
          {activeTab === "standings" && (
            <div className="space-y-6 animate-in slide-in-from-right duration-200">
              {/* League Standings */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                    <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    League Standings
                  </h2>
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
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-lg z-20">
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="flex items-center justify-around">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 flex-1 ${isActive
                    ? "bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "scale-110" : ""} transition-transform`} />
                  <span className="text-xs font-medium">{tab.label}</span>
                  {isActive && (
                    <div className="absolute -bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" />
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
