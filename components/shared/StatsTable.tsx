import { FC, useState } from "react";
import { TeamStats, Team } from "@/types/team";
import { CheckCircle } from "lucide-react";
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


    if (sortedStats.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-3">
                    <div className="w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></div>
                </div>
                <p className="text-xs text-muted-foreground">
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
        <div className="space-y-3">
            {/* Table Format */}
            <div className="bg-white dark:bg-black rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                            <th className="text-left p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                #
                            </th>
                            <th className="text-left p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Team
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                P
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                W
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                D
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                L
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                G
                            </th>
                            <th className="text-center p-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Pts
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStats.map((team, index) => (
                            <tr
                                key={team.name}
                                className={`border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                                    index === 0 ? 'bg-gray-50 dark:bg-gray-900' : ''
                                }`}
                            >
                                {/* Rank */}
                                <td className="p-2">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs ${
                                        index === 0 ? 'bg-black text-white dark:bg-white dark:text-black' :
                                        'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                    }`}>
                                        {index + 1}
                                    </div>
                                </td>
                                
                                {/* Team */}
                                <td className="p-2">
                                    <div className="font-semibold text-xs text-black dark:text-white">
                                        {team.name}
                                    </div>
                                </td>
                                
                                {/* Played */}
                                <td className="p-2 text-center">
                                    <span className="text-xs font-medium text-black dark:text-white">
                                        {team.played}
                                    </span>
                                </td>
                                
                                {/* Wins */}
                                <td className="p-2 text-center">
                                    <span className="text-xs font-medium text-black dark:text-white">
                                        {team.wins}
                                    </span>
                                </td>
                                
                                {/* Draws */}
                                <td className="p-2 text-center">
                                    <span className="text-xs font-medium text-black dark:text-white">
                                        {team.draws}
                                    </span>
                                </td>
                                
                                {/* Losses */}
                                <td className="p-2 text-center">
                                    <span className="text-xs font-medium text-black dark:text-white">
                                        {team.losses}
                                    </span>
                                </td>
                                
                                {/* Goals */}
                                <td className="p-2 text-center">
                                    <span className="text-xs font-medium text-black dark:text-white">
                                        {team.goals}
                                    </span>
                                </td>
                                
                                {/* Points */}
                                <td className="p-2 text-center">
                                    <div className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded font-bold text-xs ${
                                        index === 0 ? 'bg-black text-white dark:bg-white dark:text-black' :
                                        'bg-gray-100 text-black dark:bg-gray-800 dark:text-white'
                                    }`}>
                                        {team.points}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Finish Button */}
            {sortedStats.length > 0 && onFinish && (
                <div className="flex justify-center pt-2">
                    <button
                        onClick={handleFinish}
                        disabled={isFinishing}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 transform ${isFinishing
                            ? "bg-gray-400 cursor-not-allowed scale-95"
                            : "bg-black hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-200 hover:scale-105 text-white dark:text-black"
                            }`}
                    >
                        <CheckCircle className="w-3 h-3" />
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
