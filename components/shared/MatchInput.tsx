"use client";

import { FC, useCallback, useEffect, useState } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    ) => Promise<void>;
}

const MatchInput: FC<MatchInputProps> = ({ teams, onSubmit }) => {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");
    const [goals, setGoals] = useState<GoalEvent[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const numScoreA = Number(scoreA) || 0;
    const numScoreB = Number(scoreB) || 0;

    const getPlayersForTeam = useCallback((teamName: string) => {
        const team = teams.find((item) => item.name === teamName);
        return (team?.players ?? []).slice().sort((a, b) => a.localeCompare(b));
    }, [teams]);

    const isValid =
        teamA &&
        teamB &&
        teamA !== teamB &&
        scoreA !== "" &&
        scoreB !== "" &&
        Number(scoreA) >= 0 &&
        Number(scoreB) >= 0;

    const teamAGoals = goals.filter((goal) => goal.team === teamA);
    const teamBGoals = goals.filter((goal) => goal.team === teamB);

    const canSubmit = isValid && goals.length === numScoreA + numScoreB;

    useEffect(() => {
        if (!teamA || !teamB || !isValid) {
            setGoals([]);
            return;
        }

        setGoals((currentGoals) => {
            const totalGoals = numScoreA + numScoreB;
            const nextGoals: GoalEvent[] = [];

            for (let index = 0; index < totalGoals; index += 1) {
                const assignedTeam = index < numScoreA ? teamA : teamB;
                const existing = currentGoals[index];

                nextGoals.push({
                    team: assignedTeam,
                    scorer: existing?.scorer ?? "none",
                    assist: existing?.assist ?? null,
                });
            }

            const sameLength = nextGoals.length === currentGoals.length;
            const noChanges = sameLength && nextGoals.every((next, idx) => {
                const current = currentGoals[idx];
                return (
                    current?.team === next.team &&
                    current?.scorer === next.scorer &&
                    current?.assist === next.assist
                );
            });

            return noChanges ? currentGoals : nextGoals;
        });
    }, [teamA, teamB, numScoreA, numScoreB, isValid, getPlayersForTeam]);

    const updateGoalRow = (
        index: number,
        field: keyof GoalEvent,
        value: string | null,
    ) => {
        setGoals((current) =>
            current.map((goal, idx) =>
                idx !== index
                    ? goal
                    : { ...goal, [field]: value },
            ),
        );
    };

    const handleConfirm = async () => {
        if (canSubmit) {
            // Filter out "none" scorers and clean assists
            const cleanGoals = goals
                .filter((g) => g.scorer !== "none")
                .map((g) => ({
                    ...g,
                    assist: g.assist === "none" ? null : g.assist,
                }));

            setErrorMessage("");
            try {
                await onSubmit(teamA, teamB, numScoreA, numScoreB, cleanGoals);
            } catch (error) {
                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : "Could not save this match and its goal details.",
                );
                return;
            }

            setSuccessMessage(
                `Result submitted: ${teamA} ${scoreA} - ${scoreB} ${teamB}`,
            );
            setTimeout(() => setSuccessMessage(""), 3000);

            setTeamA("");
            setTeamB("");
            setScoreA("");
            setScoreB("");
            setGoals([]);
        }
    };

    const renderGoalRows = (goalList: GoalEvent[], teamName: string) => {
        const teamPlayers = getPlayersForTeam(teamName);

        if (goalList.length === 0) {
            return (
                <p className="text-xs text-slate-400 dark:text-slate-500 italic py-2">
                    No goals for this team.
                </p>
            );
        }

        return (
            <div className="space-y-2">
                {goalList.map((goal, localIdx) => {
                    const globalIdx = goals.indexOf(goal);
                    return (
                        <div
                            key={`${teamName}-${localIdx}`}
                            className="p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-2"
                        >
                            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                Goal {localIdx + 1}
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                                <Select
                                    value={goal.scorer}
                                    onValueChange={(val) => updateGoalRow(globalIdx, "scorer", val)}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Scorer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {teamPlayers.map((player) => (
                                            <SelectItem key={player} value={player}>
                                                {player}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={goal.assist ?? "none"}
                                    onValueChange={(val) =>
                                        updateGoalRow(globalIdx, "assist", val === "none" ? null : val)
                                    }
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue placeholder="Assist" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">None</SelectItem>
                                        {teamPlayers
                                            .filter((p) => p !== goal.scorer)
                                            .map((player) => (
                                                <SelectItem key={player} value={player}>
                                                    {player}
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="space-y-5">
            {errorMessage && (
                <div role="alert" className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-3">
                    <p className="text-sm text-red-800 dark:text-red-200 font-medium">{errorMessage}</p>
                </div>
            )}

            {successMessage && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                        {successMessage}
                    </p>
                </div>
            )}

            <div className="space-y-4">
                {/* Team & Score Selection */}
                <div className="grid gap-4 grid-cols-2">
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                            First Team
                        </label>
                        <Select value={teamA} onValueChange={setTeamA}>
                            <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.name} value={team.name}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                                <Target className="w-4 h-4 text-slate-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals"
                                value={scoreA}
                                onChange={(e) => setScoreA(e.target.value)}
                                min={0}
                                max={99}
                                className="h-10 pl-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamA}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300">
                            Second Team
                        </label>
                        <Select value={teamB} onValueChange={setTeamB}>
                            <SelectTrigger className="h-10 text-sm">
                                <SelectValue placeholder="Select team" />
                            </SelectTrigger>
                            <SelectContent>
                                {teams.map((team) => (
                                    <SelectItem key={team.name} value={team.name}>
                                        {team.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="relative">
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                                <Target className="w-4 h-4 text-slate-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals"
                                value={scoreB}
                                onChange={(e) => setScoreB(e.target.value)}
                                min={0}
                                max={99}
                                className="h-10 pl-8 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamB}
                            />
                        </div>
                    </div>
                </div>

                {/* Goal Details */}
                {goals.length > 0 && (
                    <div className="space-y-3">
                        <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                            Goal Details ({goals.length})
                        </h3>
                        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2">
                            {/* Team A goals */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    {teamA} ({numScoreA})
                                </p>
                                {renderGoalRows(teamAGoals, teamA)}
                            </div>
                            {/* Team B goals */}
                            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">
                                    {teamB} ({numScoreB})
                                </p>
                                {renderGoalRows(teamBGoals, teamB)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit */}
                <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="w-full h-11 text-sm bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                            disabled={!canSubmit}
                            onClick={() => setShowDialog(true)}
                        >
                            <Trophy className="w-4 h-4" />
                            Submit Match Result
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Match Result</AlertDialogTitle>
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-center gap-4 font-semibold">
                                    <div className="text-center">
                                        <div className="text-xs text-blue-600 dark:text-blue-400">{teamA}</div>
                                        <div className="text-2xl text-blue-700 dark:text-blue-300">{scoreA}</div>
                                    </div>
                                    <div className="text-slate-400">-</div>
                                    <div className="text-center">
                                        <div className="text-xs text-purple-600 dark:text-purple-400">{teamB}</div>
                                        <div className="text-2xl text-purple-700 dark:text-purple-300">{scoreB}</div>
                                    </div>
                                </div>
                            </div>
                            {goals.filter((g) => g.scorer !== "none").length > 0 && (
                                <div className="mt-2 text-xs text-slate-500 space-y-0.5">
                                    {goals.filter((g) => g.scorer !== "none").map((g, i) => (
                                        <div key={i}>
                                            ⚽ {g.scorer}
                                            {g.assist && g.assist !== "none" && (
                                                <span className="text-slate-400"> (🅰️ {g.assist})</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
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
                                className="bg-green-600 hover:bg-green-700"
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
