"use client";

import { FC, useState } from "react";
import { Plus, Users } from "lucide-react";
import { Team } from "@/types/team";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ManualTeamFormProps {
  onAddTeam: (team: Team) => void;
}

const ManualTeamForm: FC<ManualTeamFormProps> = ({ onAddTeam }) => {
  const [name, setName] = useState("");
  const [playerText, setPlayerText] = useState("");

  const players = playerText
    .split("\n")
    .map((player) => player.trim())
    .filter(Boolean);

  const handleSubmit = () => {
    if (!name.trim()) {
      alert("Please enter a team name.");
      return;
    }

    if (players.length === 0) {
      alert("Please enter at least one player.");
      return;
    }

    onAddTeam({ name: name.trim(), players });
    setName("");
    setPlayerText("");
  };

  return (
    <div className="space-y-4 border-t border-slate-200 dark:border-slate-700 pt-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Add Team Manually
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Create a team without generating a player list.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Team name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          aria-label="Team name"
        />
        <div className="relative">
          <Textarea
            placeholder="Player names, one per line"
            rows={4}
            value={playerText}
            onChange={(event) => setPlayerText(event.target.value)}
            className="resize-none pr-10"
            aria-label="Player names"
          />
          <Users className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>
      <Button
        type="button"
        onClick={handleSubmit}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
      >
        <Plus className="h-4 w-4" />
        Add Team
      </Button>
    </div>
  );
};

export default ManualTeamForm;
