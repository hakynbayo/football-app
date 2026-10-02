"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Team } from "@/types/team";
import { Sparkles, AlertCircle } from "lucide-react";

interface PlayerInputFormProps {
    onGenerateTeams: (teams: Team[]) => void;
}

const PlayerInputForm: FC<PlayerInputFormProps> = ({
    onGenerateTeams,
}) => {
    const [playersPerTeam, setPlayersPerTeam] = useState(4);
    const [mode, setMode] = useState<"unseeded" | "seeded">("unseeded");
    const [unseededPlayers, setUnseededPlayers] = useState("");
    const [pots, setPots] = useState<[string, string]>(["", ""]);

    const shufflePlayers = (players: string[]) => {
        const shuffled = [...players];
        for (let index = shuffled.length - 1; index > 0; index -= 1) {
            const swapIndex = Math.floor(Math.random() * (index + 1));
            [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
        }
        return shuffled;
    };

    const updatePot = (potIndex: number, value: string) => {
        setPots((currentPots) => {
            const updatedPots: [string, string] = [...currentPots];
            updatedPots[potIndex] = value;
            return updatedPots;
        });
    };

    const handleGenerateTeams = () => {
        if (playersPerTeam < 4) {
            alert("Players per team must be at least 4.");
            return;
        }

        const playersByPot = mode === "seeded"
            ? pots.map((pot) => pot.split("\n").map((name) => name.trim()).filter(Boolean))
            : [unseededPlayers.split("\n").map((name) => name.trim()).filter(Boolean)];
        const totalPlayers = playersByPot.reduce((total, pot) => total + pot.length, 0);
        if (totalPlayers < 8) {
            alert("Please enter at least 8 players.");
            return;
        }

        const totalTeams = Math.ceil(totalPlayers / playersPerTeam);
        const teamPlayers: string[][] = Array.from({ length: totalTeams }, () => []);
        const groupCounts = Array.from({ length: playersByPot.length }, () => Array(totalTeams).fill(0));

        playersByPot.forEach((pot, potIndex) => {
            shufflePlayers(pot).forEach((player) => {
                const teamIndex = teamPlayers
                    .map((players, index) => ({ index, groupCount: groupCounts[potIndex][index], size: players.length }))
                    .sort((a, b) => a.groupCount - b.groupCount || a.size - b.size)[0].index;
                teamPlayers[teamIndex].push(player);
                groupCounts[potIndex][teamIndex] += 1;
            });
        });

        const teams: Team[] = teamPlayers.map((players) => {
            const firstName = players[0];
            return {
                name: firstName,
                players,
            };
        });

        alert("Teams generated");
        onGenerateTeams(teams);
    };

    const playerCount = mode === "seeded"
        ? pots.reduce((count, pot) => count + pot.split("\n").filter((line) => line.trim()).length, 0)
        : unseededPlayers.split("\n").filter((line) => line.trim()).length;

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-black dark:text-white mt-0.5 flex-shrink-0" />
                <div className="text-xs text-black dark:text-white">
                    <p className="font-medium mb-1">Tips for best results:</p>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                        <li>Choose whether to use two seeded player pots</li>
                        <li>Enter one player name per line</li>
                        <li>Adjust players per team to balance group sizes</li>
                    </ul>
                </div>
            </div>

            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1" role="group" aria-label="Player seeding mode">
                    {(["unseeded", "seeded"] as const).map((option) => (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={mode === option}
                            onClick={() => setMode(option)}
                            className={`h-10 rounded-md text-sm font-medium transition-colors ${mode === option
                                ? "bg-white text-black shadow-sm dark:bg-gray-700 dark:text-white"
                                : "text-gray-600 hover:text-black dark:text-gray-300 dark:hover:text-white"
                                }`}
                        >
                            {option === "unseeded" ? "Unseeded" : "Seeded"}
                        </button>
                    ))}
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

                {mode === "unseeded" ? (
                    <section className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <h3 className="text-sm font-semibold text-black dark:text-white mb-2">Players</h3>
                        <Textarea
                            aria-label="Unseeded players"
                            placeholder="Enter players, one name per line"
                            rows={8}
                            value={unseededPlayers}
                            onChange={(event) => setUnseededPlayers(event.target.value)}
                            className="resize-none text-sm"
                        />
                    </section>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {pots.map((pot, index) => (
                            <section
                                key={index}
                                className="rounded-lg border border-gray-200 dark:border-gray-700 p-4"
                            >
                                <h3 className="text-sm font-semibold text-black dark:text-white mb-2">
                                    Pot {index + 1} <span className="font-normal text-gray-500">({pot.split("\n").filter((line) => line.trim()).length})</span>
                                </h3>
                                <Textarea
                                    aria-label={`Pot ${index + 1} players`}
                                    placeholder={`Enter players for Pot ${index + 1}, one name per line`}
                                    rows={8}
                                    value={pot}
                                    onChange={(event) => updatePot(index, event.target.value)}
                                    className="resize-none text-sm"
                                />
                            </section>
                        ))}
                    </div>
                )}

                <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                    {playerCount} {playerCount === 1 ? "player" : "players"}{mode === "seeded" ? " across both pots" : ""}
                </p>

                <Button
                    className="w-full flex items-center justify-center gap-2 text-sm h-12 px-8 bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                    onClick={handleGenerateTeams}
                    disabled={playerCount < 8}
                >
                    <Sparkles className="w-5 h-5" />
                    Generate {mode === "seeded" ? "Seeded " : ""}Teams
                </Button>
            </div>
        </div>
    );
};

export default PlayerInputForm;
