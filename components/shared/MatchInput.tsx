"use client";

import { FC, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Trophy, Target, CheckCircle2 } from "lucide-react";
import { Team, GoalEvent } from "@/types/team";

interface MatchInputProps {
    teams: Team[];
    onSubmit: (
        teamA: string,
        teamB: string,
        scoreA: number,
        scoreB: number,
        goals: GoalEvent[],
    ) => void;
}

interface GoalEntry {
    scorer: string;
    assist: string;
}

const MatchInput: FC<MatchInputProps> = ({ teams, onSubmit }) => {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");
    const [goalsA, setGoalsA] = useState<GoalEntry[]>([]);
    const [goalsB, setGoalsB] = useState<GoalEntry[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const teamAObj = useMemo(() => teams.find((t) => t.name === teamA), [teams, teamA]);
    const teamBObj = useMemo(() => teams.find((t) => t.name === teamB), [teams, teamB]);

    const numScoreA = Number(scoreA) || 0;
    const numScoreB = Number(scoreB) || 0;

    // Sync goal entry arrays when scores change
    const syncGoals = (count: number, current: GoalEntry[]): GoalEntry[] => {
        if (count <= 0) return [];
        if (current.length === count) return current;
        if (current.length < count) {
            return [
                ...current,
                ...Array.from({ length: count - current.length }, () => ({
                    scorer: "",
                    assist: "",
                })),
            ];
        }
        return current.slice(0, count);
    };

    const effectiveGoalsA = syncGoals(numScoreA, goalsA);
    const effectiveGoalsB = syncGoals(numScoreB, goalsB);

    const updateGoalA = (index: number, field: "scorer" | "assist", value: string) => {
        const updated = [...effectiveGoalsA];
        updated[index] = { ...updated[index], [field]: value };
        setGoalsA(updated);
    };

    const updateGoalB = (index: number, field: "scorer" | "assist", value: string) => {
        const updated = [...effectiveGoalsB];
        updated[index] = { ...updated[index], [field]: value };
        setGoalsB(updated);
    };

    const isValid =
        teamA &&
        teamB &&
        teamA !== teamB &&
        scoreA !== "" &&
        scoreB !== "" &&
        Number(scoreA) >= 0 &&
        Number(scoreB) >= 0;

    // All scorers must be filled for goals > 0
    const allScorersSet =
        effectiveGoalsA.every((g) => g.scorer !== "") &&
        effectiveGoalsB.every((g) => g.scorer !== "");

    const canSubmit = isValid && allScorersSet;

    const handleConfirm = () => {
        if (canSubmit) {
            const goalEvents: GoalEvent[] = [
                ...effectiveGoalsA.map((g) => ({
                    team: teamA,
                    scorer: g.scorer,
                    assist: g.assist || null,
                })),
                ...effectiveGoalsB.map((g) => ({
                    team: teamB,
                    scorer: g.scorer,
                    assist: g.assist || null,
                })),
            ];

            onSubmit(teamA, teamB, numScoreA, numScoreB, goalEvents);

            setSuccessMessage(
                `Result submitted: ${teamA} ${scoreA} - ${scoreB} ${teamB}`,
            );
            setTimeout(() => setSuccessMessage(""), 3000);

            // Reset form
            setTeamA("");
            setTeamB("");
            setScoreA("");
            setScoreB("");
            setGoalsA([]);
            setGoalsB([]);
        }
    };

    const renderGoalEntries = (
        goalEntries: GoalEntry[],
        teamPlayers: string[],
        teamName: string,
        updateFn: (index: number, field: "scorer" | "assist", value: string) => void,
    ) => {
        if (goalEntries.length === 0) return null;

        return (
            <div className="space-y-3 mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {teamName} — Goal Details
                </p>
                {goalEntries.map((entry, idx) => (
                    <div
                        key={idx}
                        className="flex flex-col sm:flex-row gap-2 p-2 bg-white dark:bg-slate-700 rounded-lg border border-slate-100 dark:border-slate-600"
                    >
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 w-14">
                                Goal {idx + 1}
                            </span>
                        </div>
                        <Select
                            value={entry.scorer}
                            onValueChange={(val) => updateFn(idx, "scorer", val)}
                        >
                            <SelectTrigger className="flex-1 h-9 text-sm">
                                <SelectValue placeholder="Scorer *" />
                            </SelectTrigger>
                            <SelectContent>
                                {teamPlayers.map((player) => (
                                    <SelectItem key={player} value={player}>
                                        {player}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={entry.assist}
                            onValueChange={(val) => updateFn(idx, "assist", val)}
                        >
                            <SelectTrigger className="flex-1 h-9 text-sm">
                                <SelectValue placeholder="Assist (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">No assist</SelectItem>
                                {teamPlayers
                                    .filter((p) => p !== entry.scorer)
                                    .map((player) => (
                                        <SelectItem key={player} value={player}>
                                            {player}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {successMessage && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-green-800 dark:text-green-200 font-medium">
                        {successMessage}
                    </p>
                </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Select two different teams, enter scores, then
                    assign goalscorers and assists for each goal.
                </p>
            </div>

            <div className="space-y-6">
                {/* Team A Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-black dark:text-white">
                        First Team
                    </label>
                    <div className="space-y-3">
                        <Select value={teamA} onValueChange={setTeamA}>
                            <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select first team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.name} value={team.name}>
                                        Team {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Target className="w-5 h-5 text-gray-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals scored"
                                value={scoreA}
                                onChange={(e) => {
                                    setScoreA(e.target.value);
                                    setGoalsA([]);
                                }}
                                min={0}
                                max={99}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamA}
                            />
                        </div>
                    </div>
                    {/* Goal entries for Team A */}
                    {teamAObj &&
                        numScoreA > 0 &&
                        renderGoalEntries(
                            effectiveGoalsA,
                            teamAObj.players,
                            teamA,
                            updateGoalA,
                        )}
                </div>

                {/* VS Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full font-bold text-lg shadow-lg">
                        VS
                    </div>
                    <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                </div>

                {/* Team B Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-black dark:text-white">
                        Second Team
                    </label>
                    <div className="space-y-3">
                        <Select value={teamB} onValueChange={setTeamB}>
                            <SelectTrigger className="h-12 text-base">
                                <SelectValue placeholder="Select second team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.name} value={team.name}>
                                        Team {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Target className="w-5 h-5 text-gray-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals scored"
                                value={scoreB}
                                onChange={(e) => {
                                    setScoreB(e.target.value);
                                    setGoalsB([]);
                                }}
                                min={0}
                                max={99}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamB}
                            />
                        </div>
                    </div>
                    {/* Goal entries for Team B */}
                    {teamBObj &&
                        numScoreB > 0 &&
                        renderGoalEntries(
                            effectiveGoalsB,
                            teamBObj.players,
                            teamB,
                            updateGoalB,
                        )}
                </div>

                {/* Submit Button */}
                <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                            disabled={!canSubmit}
                            onClick={() => setShowDialog(true)}
                        >
                            <Trophy className="w-5 h-5" />
                            Submit Match Result
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl">
                                Confirm Match Result
                            </AlertDialogTitle>
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                                    <div className="text-center">
                                        <div className="text-blue-600 dark:text-blue-400">
                                            {teamA}
                                        </div>
                                        <div className="text-2xl text-blue-700 dark:text-blue-300 mt-1">
                                            {scoreA}
                                        </div>
                                    </div>
                                    <div className="text-gray-400">-</div>
                                    <div className="text-center">
                                        <div className="text-purple-600 dark:text-purple-400">
                                            {teamB}
                                        </div>
                                        <div className="text-2xl text-purple-700 dark:text-purple-300 mt-1">
                                            {scoreB}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {(effectiveGoalsA.length > 0 || effectiveGoalsB.length > 0) && (
                                <div className="mt-3 text-sm text-slate-600 dark:text-slate-400 space-y-1">
                                    {effectiveGoalsA.map((g, i) => (
                                        <div key={`a-${i}`}>
                                            ⚽ {g.scorer}
                                            {g.assist && g.assist !== "none" && (
                                                <span className="text-slate-400"> (assist: {g.assist})</span>
                                            )}
                                        </div>
                                    ))}
                                    {effectiveGoalsB.map((g, i) => (
                                        <div key={`b-${i}`}>
                                            ⚽ {g.scorer}
                                            {g.assist && g.assist !== "none" && (
                                                <span className="text-slate-400"> (assist: {g.assist})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-sm text-muted-foreground mt-2">
                                Are you sure you want to submit this match result?
                            </p>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowDialog(false)}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={() => {
                                    handleConfirm();
                                    setShowDialog(false);
                                }}
                                className="bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black"
                            >
                                Submit
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
};

export default MatchInput;
