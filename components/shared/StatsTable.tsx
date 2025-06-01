import { FC } from "react";
import { TeamStats } from "@/types/team";

interface StatsTableProps {
    stats: TeamStats[];
}

const StatsTable: FC<StatsTableProps> = ({ stats }) => {
    return (
        <div className="w-full overflow-x-auto mt-6">
            <table className="w-full table-fixed text-center border border-gray-300">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border border-gray-300">Team</th>
                        <th className="p-2 border border-gray-300">Played</th>
                        <th className="p-2 border border-gray-300">Points</th>
                        <th className="p-2 border border-gray-300">Win</th>
                        <th className="p-2 border border-gray-300">Draw</th>
                        <th className="p-2 border border-gray-300">Loss</th>
                        <th className="p-2 border border-gray-300">Goals</th>
                    </tr>
                </thead>
                <tbody>
                    {[...stats]
                        .sort((a, b) => {
                            if (b.points !== a.points) return b.points - a.points;
                            return b.goals - a.goals;
                        })
                        .map((team) => (
                            <tr key={team.name}>
                                <td className="p-2 border border-gray-300">{team.name}</td>
                                <td className="p-2 border border-gray-300">{team.played}</td>
                                <td className="p-2 border border-gray-300">{team.points}</td>
                                <td className="p-2 border border-gray-300">{team.wins}</td>
                                <td className="p-2 border border-gray-300">{team.draws}</td>
                                <td className="p-2 border border-gray-300">{team.losses}</td>
                                <td className="p-2 border border-gray-300">{team.goals}</td>
                            </tr>
                        ))}
                </tbody>
            </table>
        </div>
    );
};

export default StatsTable;
