"use client";

import { FC, useEffect, useMemo, useState } from "react";
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
    ) => void;
}

const MatchInput: FC<MatchInputProps> = ({ teams, onSubmit }) => {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");
    const [goals, setGoals] = useState<GoalEvent[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const numScoreA = Number(scoreA) || 0;
    const numScoreB = Number(scoreB) || 0;

    const allPlayers = useMemo(() => {
        const playerSet = new Set<string>();
        for (const team of teams) {
            for (const player of team.players) {
                playerSet.add(player);
            }
        }
        return Array.from(playerSet).sort((a, b) => a.localeCompare(b));
    }, [teams]);

   

    const isValid =
        teamA &&
        teamB &&
        teamA !== teamB &&
        scoreA !== "" &&
        scoreB !== "" &&
        Number(scoreA) >= 0 &&
        Number(scoreB) >= 0;

    const goalsByTeam = goals.reduce(
        (acc, goal) => {
            if (goal.team === teamA) acc.teamA += 1;
            if (goal.team === teamB) acc.teamB += 1;
            return acc;
        },
        { teamA: 0, teamB: 0 },
    );

    const teamAGoals = goals.filter((goal) => goal.team === teamA);
    const teamBGoals = goals.filter((goal) => goal.team === teamB);

    const goalsMatchScore =
        goals.length === numScoreA + numScoreB &&
        (!teamA || goalsByTeam.teamA === numScoreA) &&
        (!teamB || goalsByTeam.teamB === numScoreB);

    const canSubmit = isValid && goalsMatchScore;

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
                    scorer:
                        existing && allPlayers.includes(existing.scorer)
                            ? existing.scorer
                            : allPlayers[0] || "",
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
    }, [teamA, teamB, numScoreA, numScoreB, allPlayers, isValid]);

    const updateGoalRow = (
        index: number,
        field: keyof GoalEvent,
        value: string | null,
    ) => {
        setGoals((current) =>
            current.map((goal, idx) =>
                idx !== index
                    ? goal
                    : {
                          ...goal,
                          [field]: value,
                      },
            ),
        );
    };

    const handleConfirm = () => {
        if (canSubmit) {
            onSubmit(teamA, teamB, numScoreA, numScoreB, goals);

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
                    <strong>Note:</strong> Select teams and enter the final score. Goal rows are created automatically, and all players are visible for easy selection.
                </p>
            </div>

            <div className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-black dark:text-white">
                            First Team
                        </label>
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
                                onChange={(e) => setScoreA(e.target.value)}
                                min={0}
                                max={99}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamA}
                            />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-black dark:text-white">
                            Second Team
                        </label>
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
                                onChange={(e) => setScoreB(e.target.value)}
                                min={0}
                                max={99}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamB}
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-4 gap-3">
                        <div>
                            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                                Goals ({goals.length})
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Goal rows are generated automatically from the entered score. Select scorer and assist for each goal.
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {teamA || "Team A"}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {numScoreA} {numScoreA === 1 ? "goal" : "goals"}
                                    </p>
                                </div>
                            </div>
                            {teamAGoals.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
                                    No goals for this team.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {teamAGoals.map((goal, index) => (
                                        <div key={`${goal.team}-goal-${index}`} className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                Goal {index + 1}
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        Scorer
                                                    </label>
                                                    <Select
                                                        value={goal.scorer}
                                                        onValueChange={(value) => updateGoalRow(goals.indexOf(goal), "scorer", value)}
                                                    >
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select scorer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem key="none" value="none">
                                                                None
                                                            </SelectItem>
                                                            {allPlayers.map((player) => (
                                                                <SelectItem key={player} value={player}>
                                                                    {player}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        Assist
                                                    </label>
                                                    <Select
                                                        value={goal.assist ?? "none"}
                                                        onValueChange={(value) =>
                                                            updateGoalRow(goals.indexOf(goal), "assist", value === "none" ? null : value)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select assist" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem key="none" value="none">
                                                                None
                                                            </SelectItem>
                                                            {allPlayers.map((player) => (
                                                                <SelectItem key={player} value={player}>
                                                                    {player}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                                        {teamB || "Team B"}
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {numScoreB} {numScoreB === 1 ? "goal" : "goals"}
                                    </p>
                                </div>
                            </div>
                            {teamBGoals.length === 0 ? (
                                <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-4 text-sm text-slate-500 dark:text-slate-400">
                                    No goals for this team.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {teamBGoals.map((goal, index) => (
                                        <div key={`${goal.team}-goal-${index}`} className="space-y-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4">
                                            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                                                Goal {index + 1}
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        Scorer
                                                    </label>
                                                    <Select
                                                        value={goal.scorer}
                                                        onValueChange={(value) => updateGoalRow(goals.indexOf(goal), "scorer", value)}
                                                    >
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select scorer" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem key="none" value="none">
                                                                None
                                                            </SelectItem>
                                                            {allPlayers.map((player) => (
                                                                <SelectItem key={player} value={player}>
                                                                    {player}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                                        Assist
                                                    </label>
                                                    <Select
                                                        value={goal.assist ?? "none"}
                                                        onValueChange={(value) =>
                                                            updateGoalRow(goals.indexOf(goal), "assist", value === "none" ? null : value)
                                                        }
                                                    >
                                                        <SelectTrigger className="h-12 text-base">
                                                            <SelectValue placeholder="Select assist" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem key="none" value="none">
                                                                None
                                                            </SelectItem>
                                                            {allPlayers.map((player) => (
                                                                <SelectItem key={player} value={player}>
                                                                    {player}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center justify-between gap-4">
                            <span>Score entered</span>
                            <span>{teamA || "Team A"}: {numScoreA}</span>
                            <span>{teamB || "Team B"}: {numScoreB}</span>
                        </div>
                        <div className="flex items-center justify-between gap-4 mt-2">
                            <span>Goals rows</span>
                            <span>{teamA || "Team A"}: {goalsByTeam.teamA}</span>
                            <span>{teamB || "Team B"}: {goalsByTeam.teamB}</span>
                        </div>
                        {!goalsMatchScore && (
                            <p className="mt-3 text-xs text-red-600 dark:text-red-400">
                                The number of goal rows must exactly match the score for each team.
                            </p>
                        )}
                    </div>
                </div>

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
