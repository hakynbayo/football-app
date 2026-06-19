"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Team } from "@/types/team";
import { Users, Sparkles, AlertCircle } from "lucide-react";

interface PlayerInputFormProps {
    playerText: string;
    setPlayerText: (value: string) => void;
    onGenerateTeams: (teams: Team[]) => void;
}

const PlayerInputForm: FC<PlayerInputFormProps> = ({
    playerText,
    setPlayerText,
    onGenerateTeams,
}) => {
    const [playersPerTeam, setPlayersPerTeam] = useState(4);

    const handleGenerate = () => {
        const players = playerText
            .split("\n")
            .map((name) => name.trim())
            .filter(Boolean);

        if (players.length < 8) {
            alert("Please enter at least 8 players.");
            return;
        }

        if (playersPerTeam < 4) {
            alert("Players per team must be at least 4.");
            return;
        }

        const shuffled = [...players].sort(() => 0.5 - Math.random());
        const totalTeams = Math.ceil(players.length / playersPerTeam);

        const teams: Team[] = Array.from({ length: totalTeams }, (_, i) => {
            const teamPlayers = shuffled.slice(i * playersPerTeam, (i + 1) * playersPerTeam);
            const firstName = teamPlayers[0];
            return {
                name: firstName, // Use just the first player's name
                players: teamPlayers,
            };
        });

        alert("Teams generated")
        onGenerateTeams(teams);
    };

    const playerCount = playerText.split('\n').filter(line => line.trim()).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                <div className="text-xs text-black dark:text-white">
                    <p className="font-medium mb-1">Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        <li>Enter at least 8 players (one name per line)</li>
                        <li>Teams are randomly generated for fairness</li>
                        <li>Adjust players per team to balance group sizes</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-black dark:text-white">
                        Player Names
                        <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                            ({playerCount} {playerCount === 1 ? 'player' : 'players'})
                        </span>
                    </label>
                    <div className="relative">
                        <Textarea
                            placeholder="Enter player names, one per line&#10;John Doe&#10;Jane Smith&#10;Mike Johnson"
                            rows={10}
                            value={playerText}
                            onChange={(e) => setPlayerText(e.target.value)}
                            className="resize-none text-base pr-10"
                        />
                        <div className="absolute top-3 right-3">
                            <Users className="w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-medium text-black dark:text-white flex-shrink-0">
                        Players per team:
                    </label>
                    <div className="flex items-center gap-3 flex-1 w-full sm:w-auto">
                        <Input
                            type="number"
                            min={1}
                            max={100}
                            value={playersPerTeam}
                            onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                            className="w-full sm:w-24 text-center font-semibold"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                            (~{playerCount > 0 ? Math.ceil(playerCount / playersPerTeam) : 0} teams)
                        </span>
                    </div>
                </div>

                <Button
                    className="w-[60%] mx-auto flex items-center gap-2 text-sm h-12 px-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                    onClick={handleGenerate}
                    disabled={playerCount < 8}
                >
                    <Sparkles className="w-5 h-5" />
                    Generate Teams
                </Button>
            </div>
        </div>
    );
};

export default PlayerInputForm;
