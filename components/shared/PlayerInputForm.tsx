"use client";

import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Team } from "@/types/team";

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

        const teams: Team[] = Array.from({ length: totalTeams }, (_, i) => ({
            name: `Team ${i + 1}`,
            players: shuffled.slice(i * playersPerTeam, (i + 1) * playersPerTeam),
        }));

        alert("Teams generated")
        onGenerateTeams(teams);
    };

    return (
        <div className="max-w-lg mx-auto mt-6 space-y-4">
            <Textarea
                placeholder="Enter player names, one per line"
                rows={8}
                value={playerText}
                onChange={(e) => setPlayerText(e.target.value)}
            />

            <div>
                <label className="text-sm font-medium block mb-1">
                    Players per team:
                </label>
                <Input
                    type="number"
                    min={1}
                    max={100}
                    value={playersPerTeam}
                    onChange={(e) => setPlayersPerTeam(Number(e.target.value))}
                    className="w-[20%]"
                />
            </div>

            <Button className="w-[50%] mx-auto" onClick={handleGenerate}>
                Generate Teams
            </Button>
        </div>
    );
};

export default PlayerInputForm;
