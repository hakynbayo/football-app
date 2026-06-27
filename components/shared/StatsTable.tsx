import { FC, useState } from "react";
import { TeamStats, Team } from "@/types/team";
import { Trophy, Medal, CheckCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StatsTableProps {
    stats: TeamStats[];
    teams: Team[];
    onFinish?: (winningTeam: Team) => void;
}

const StatsTable: FC<StatsTableProps> = ({ stats, teams, onFinish }) => {
    const [isFinishing, setIsFinishing] = useState(false);
    const [showFinishDialog, setShowFinishDialog] = useState(false);
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";

    const sortedStats = [...stats].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        return b.goals - a.goals;
    });

    const getRankIcon = (index: number) => {
        if (index === 0) return <Trophy className="w-3.5 h-3.5 text-yellow-500" />;
        if (index === 1) return <Medal className="w-3.5 h-3.5 text-slate-400" />;
        if (index === 2) return <Medal className="w-3.5 h-3.5 text-amber-600" />;
        return null;
    };

    if (sortedStats.length === 0) {
        return (
            <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 mb-3">
                    <Trophy className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                    No standings available yet. Start entering match results!
                </p>
            </div>
        );
    }

    const leadingTeam = teams.find((team) => team.name === sortedStats[0]?.name);

    const handleFinish = () => {
        if (leadingTeam && onFinish) {
            setIsFinishing(true);
            onFinish(leadingTeam);
            setShowFinishDialog(false);
            setTimeout(() => {
                setIsFinishing(false);
            }, 1000);
        }
    };

    return (
        <div className="space-y-3">
            <div className="w-full overflow-x-auto -mx-2 px-2">
                <table className="w-full text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                            <th className="py-2 px-1 text-left font-semibold text-slate-500 dark:text-slate-400 w-8">#</th>
                            <th className="py-2 px-1 text-left font-semibold text-slate-500 dark:text-slate-400">Team</th>
                            <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-7">P</th>
                            <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-7">W</th>
                            <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-7">D</th>
                            <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-7">L</th>
                            <th className="py-2 px-1 text-center font-semibold text-slate-500 dark:text-slate-400 w-8">GD</th>
                            <th className="py-2 px-1 text-center font-bold text-slate-700 dark:text-slate-200 w-8">Pts</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                        {sortedStats.map((team, index) => (
                            <tr key={team.name} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                <td className="py-1.5 px-1">
                                    <div className="flex items-center gap-1">
                                        <span className="font-bold text-slate-600 dark:text-slate-300">
                                            {index + 1}
                                        </span>
                                        {getRankIcon(index)}
                                    </div>
                                </td>
                                <td className="py-1.5 px-1">
                                    <span className="font-medium text-slate-900 dark:text-slate-100 truncate block max-w-[100px]">
                                        {team.name}
                                    </span>
                                </td>
                                <td className="py-1.5 px-1 text-center text-slate-600 dark:text-slate-400">
                                    {team.played}
                                </td>
                                <td className="py-1.5 px-1 text-center text-green-600 dark:text-green-400">
                                    {team.wins}
                                </td>
                                <td className="py-1.5 px-1 text-center text-slate-500 dark:text-slate-400">
                                    {team.draws}
                                </td>
                                <td className="py-1.5 px-1 text-center text-red-600 dark:text-red-400">
                                    {team.losses}
                                </td>
                                <td className="py-1.5 px-1 text-center">
                                    <span className={team.goals > 0 ? "text-green-600 dark:text-green-400" : team.goals < 0 ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400"}>
                                        {team.goals > 0 ? `+${team.goals}` : team.goals}
                                    </span>
                                </td>
                                <td className="py-1.5 px-1 text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-blue-500 text-white font-bold text-[10px]">
                                        {team.points}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Finish Button - Admin only */}
            {sortedStats.length > 0 && onFinish && isAdmin && (
                <div className="flex justify-center pt-1">
                    <AlertDialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
                        <AlertDialogTrigger asChild>
                            <button
                                disabled={isFinishing || !leadingTeam}
                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${isFinishing
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                                    } text-white`}
                            >
                                <CheckCircle className="w-3.5 h-3.5" />
                                {isFinishing ? "Saving..." : "Finish & Save Team of the Week"}
                            </button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Save Team of the Week?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will save {leadingTeam?.name} as Team of the Week and clear the current match results.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isFinishing}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleFinish}
                                    disabled={isFinishing || !leadingTeam}
                                    className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                                >
                                    Confirm
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
};

export default StatsTable;
