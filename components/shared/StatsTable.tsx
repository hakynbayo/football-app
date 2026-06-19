import { FC, useState } from "react";
import { TeamStats, Team } from "@/types/team";
<<<<<<< HEAD
import { Trophy, Medal, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
=======
import { CheckCircle } from "lucide-react";
import PasswordDialog from "./PasswordDialog";
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb

interface StatsTableProps {
    stats: TeamStats[];
    teams: Team[];
    onFinish?: (winningTeam: Team) => void;
}

const StatsTable: FC<StatsTableProps> = ({ stats, teams, onFinish }) => {
    const [isFinishing, setIsFinishing] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

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
            setIsFinishing(true);
            const winningTeamName = sortedStats[0].name;
            const winningTeam = teams.find(team => team.name === winningTeamName);
            if (winningTeam) {
                onFinish(winningTeam);
                setTimeout(() => {
                    setIsFinishing(false);
                }, 1000);
            } else {
                setIsFinishing(false);
            }
        }
    };

    return (
<<<<<<< HEAD
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
                                        GD
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
                                        <td className="py-4 px-4 whitespace-nowrap text-center text-sm font-medium">
                                            <span className={team.goals > 0 ? "text-green-600 dark:text-green-400" : team.goals < 0 ? "text-red-600 dark:text-red-400" : "text-slate-600 dark:text-slate-400"}>
                                                {team.goals > 0 ? `+${team.goals}` : team.goals}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Finish Button - Admin only */}
            {sortedStats.length > 0 && onFinish && isAdmin && (
                <div className="flex justify-center">
=======
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
>>>>>>> d91965a8bff51d5d9fdafa1e262d9d0245df6acb
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
        </div>
    );
};

export default StatsTable;
