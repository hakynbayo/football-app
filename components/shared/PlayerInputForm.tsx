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
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                        <li>Enter at least 8 players (one name per line)</li>
                        <li>Teams are randomly generated for fairness</li>
                        <li>Adjust players per team to balance group sizes</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-4">
                <div className="relative">
                    <label className="block text-sm font-medium mb-2 text-slate-700 dark:text-slate-300">
                        Player Names
                        <span className="ml-2 text-xs text-muted-foreground">
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
                            <Users className="w-5 h-5 text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
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
                        <span className="text-sm text-muted-foreground whitespace-nowrap">
                            (~{playerCount > 0 ? Math.ceil(playerCount / playersPerTeam) : 0} teams)
                        </span>
                    </div>
                </div>

                <Button
                    className="w-full sm:w-auto sm:mx-auto flex items-center gap-2 text-base h-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
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
