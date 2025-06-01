import { FC } from "react";
import { TeamStats } from "@/types/team";

interface StatsTableProps {
    stats: TeamStats[];
}

const StatsTable: FC<StatsTableProps> = ({ stats }) => {
    return (
        <div className="w-full overflow-x-auto mt-6">
            <table className="min-w-[600px] sm:min-w-full w-full text-center border border-gray-300 text-xs sm:text-sm">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-24 sm:w-auto">Team</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-12 sm:w-auto">Played</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-12 sm:w-auto">Points</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-12 sm:w-auto">Win</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-12 sm:w-auto">Draw</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-12 sm:w-auto">Loss</th>
                        <th className="p-2 border border-gray-300 whitespace-nowrap w-14 sm:w-auto">Goals</th>
                    </tr>
                </thead>
                <tbody>
                    {[...stats]
                        .sort((a, b) => {
                            if (b.points !== a.points) return b.points - a.points;
                            return b.goals - a.goals;
                        })
                        .map((team) => (
                            <tr key={team.name} className="hover:bg-gray-50">
                                <td className="p-2 border border-gray-300 w-24 sm:w-auto">{team.name}</td>
                                <td className="p-2 border border-gray-300 w-12 sm:w-auto">{team.played}</td>
                                <td className="p-2 border border-gray-300 w-12 sm:w-auto">{team.points}</td>
                                <td className="p-2 border border-gray-300 w-12 sm:w-auto">{team.wins}</td>
                                <td className="p-2 border border-gray-300 w-12 sm:w-auto">{team.draws}</td>
                                <td className="p-2 border border-gray-300 w-12 sm:w-auto">{team.losses}</td>
                                <td className="p-2 border border-gray-300 w-14 sm:w-auto">{team.goals}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatsTable;
