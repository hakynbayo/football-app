import { FC, useState } from "react";
import { TeamStats, Team } from "@/types/team";
import { Trophy, Medal, CheckCircle } from "lucide-react";
import PasswordDialog from "./PasswordDialog";

interface StatsTableProps {
    stats: TeamStats[];
    teams: Team[];
    onFinish?: (winningTeam: Team) => void;
}

const StatsTable: FC<StatsTableProps> = ({ stats, teams, onFinish }) => {
    const [isFinishing, setIsFinishing] = useState(false);
    const [showPasswordDialog, setShowPasswordDialog] = useState(false);

    const sortedStats = [...stats].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goals - a.goals;
    });

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-5 h-5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-5 h-5 text-slate-400" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
        return null;
    };


    if (sortedStats.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 mb-4">
                    <Trophy className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-sm sm:text-base text-muted-foreground">
                    No standings available yet. Start entering match results!
                </p>
            </div>
        );
    }

    const handleFinish = () => {
        if (sortedStats.length > 0 && onFinish) {
            setShowPasswordDialog(true);
        }
    };

    const handlePasswordConfirm = (password: string) => {
        if (password === "256256") {
            setShowPasswordDialog(false);
            setIsFinishing(true);

            const winningTeamName = sortedStats[0].name;
            const winningTeam = teams.find(team => team.name === winningTeamName);
            if (winningTeam && onFinish) {
                onFinish(winningTeam);
                // Reset the finishing state after a brief delay
                setTimeout(() => {
                    setIsFinishing(false);
                }, 1000);
            }
        }
        // Password validation is handled by the PasswordDialog component
    };

    const handlePasswordDialogClose = () => {
        setShowPasswordDialog(false);
    };

    return (
        <div className="space-y-4">
            <div className="w-full overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                    <div className="overflow-hidden shadow-sm ring-1 ring-slate-200 dark:ring-slate-700 rounded-xl">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                <tr>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Rank
                                    </th>
                                    <th className="py-3 px-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Team
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Played
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        <div className="bg-blue-500 text-white rounded px-2 py-1 inline-block font-bold">
                                            Pts
                                        </div>
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Win
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Draw
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Loss
                                    </th>
                                    <th className="py-3 px-4 text-center text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                                        Goals
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {sortedStats.map((team, index) => (
                                    <tr key={team.name} className={`hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-l-4 ${index === 0 ? 'border-yellow-500' : index === 1 ? 'border-slate-400' : index === 2 ? 'border-amber-600' : 'border-transparent'}`}>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                    {index + 1}
                                                </span>
                                                {getRankIcon(index)}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap">
                                            <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                                                {team.name}
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400">
                                            {team.played}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center">
                                            <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg font-bold text-sm bg-blue-500 text-white shadow-sm">
                                                {team.points}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm text-green-600 dark:text-green-400 font-medium">
                                            {team.wins}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {team.draws}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm text-red-600 dark:text-red-400 font-medium">
                                            {team.losses}
                                        </td>
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm text-slate-600 dark:text-slate-400 font-medium">
                                            {team.goals}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Finish Button */}
            {sortedStats.length > 0 && onFinish && (
                <div className="flex justify-center">
                    <button
                        onClick={handleFinish}
                        disabled={isFinishing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold shadow-lg transition-all duration-200 transform ${isFinishing
                            ? "bg-gray-400 cursor-not-allowed scale-95"
                            : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:scale-105"
                            } text-white`}
                    >
                        <CheckCircle className="w-5 h-5" />
                        {isFinishing ? "Saving..." : "Finish & Save Team of the Week"}
                    </button>
                </div>
            )}

            {/* Password Dialog */}
            <PasswordDialog
                isOpen={showPasswordDialog}
                onClose={handlePasswordDialogClose}
                onConfirm={handlePasswordConfirm}
                title="Confirm Finish Action"
                message="Please enter the password to finish the league and save the team of the week:"
            />
        </div>
    );
};

export default StatsTable;
