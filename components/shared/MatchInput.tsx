import { FC, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MatchInputProps {
    teams: string[];
    onSubmit: (teamA: string, teamB: string, scoreA: number, scoreB: number) => void;
}

const MatchInput: FC<MatchInputProps> = ({ teams, onSubmit }) => {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [scoreA, setScoreA] = useState(0);
    const [scoreB, setScoreB] = useState(0);

    const handleSubmit = () => {
        if (teamA && teamB && teamA !== teamB) {
            onSubmit(teamA, teamB, scoreA, scoreB);
        }
    };

    return (
        <div className="space-y-4 max-w-lg mx-auto mt-6 flex flex-col items-center">
            <div>
            </div>
            <div className="flex flex-col gap-2">
                <select
                    className="border rounded p-2 "
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                >
                    <option value="">Select first team</option>
                    {teams.map((team) => (
                        <option key={team} value={team}>{team}</option>
                    ))}
                </select>
                <Input
                    type="number"
                    placeholder="Goals A"
                    value={scoreA}
                    onChange={(e) => setScoreA(Number(e.target.value))}
                    className=""
                />
            </div>
            <div>
                <p className="font-bold text-base text-center">VS</p>
            </div>

            <div className="flex flex-col  gap-2">
                <select
                    className="border rounded p-2 "
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                >
                    <option value="">Select second team</option>
                    {teams.map((team) => (
                        <option key={team} value={team}>{team}</option>
                    ))}
                </select>
                <Input
                    type="number"
                    placeholder="Goals B"
                    value={scoreB}
                    onChange={(e) => setScoreB(Number(e.target.value))}
                    className=""

                />
            </div>
            <Button onClick={handleSubmit} className="w-[50%]">
                Submit Match Result
            </Button>
        </div>
    );
};

export default MatchInput;
