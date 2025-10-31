import { FC, useState } from "react";
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

interface MatchInputProps {
    teams: string[];
    onSubmit: (teamA: string, teamB: string, scoreA: string, scoreB: string) => void;
}

const MatchInput: FC<MatchInputProps> = ({ teams, onSubmit }) => {
    const [teamA, setTeamA] = useState("");
    const [teamB, setTeamB] = useState("");
    const [scoreA, setScoreA] = useState("");
    const [scoreB, setScoreB] = useState("");

    const [showDialog, setShowDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const isValid = teamA && teamB && teamA !== teamB;

    const handleConfirm = () => {
        if (isValid) {
            onSubmit(teamA, teamB, scoreA, scoreB);

            setSuccessMessage(`Result submitted: ${teamA} ${scoreA} - ${scoreB} ${teamB}`);
            setTimeout(() => setSuccessMessage(""), 3000);

            // Reset form
            setTeamA("");
            setTeamB("");
            setScoreA("");
            setScoreB("");
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {successMessage && (
                <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <p className="text-green-800 dark:text-green-200 font-medium">{successMessage}</p>
                </div>
            )}

            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Note:</strong> Select two different teams and enter their scores. The statistics will be automatically calculated.
                </p>
            </div>

            <div className="space-y-6">
                {/* Team A Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        First Team
                    </label>
                    <div className="space-y-3">
                        <div className="relative">
                            <Select value={teamA} onValueChange={setTeamA}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select first team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team} value={team}>
                                            Team {team}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Target className="w-5 h-5 text-slate-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals scored"
                                value={scoreA}
                                onChange={(e) => setScoreA(e.target.value)}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamA}
                            />
                        </div>
                    </div>
                </div>

                {/* VS Divider */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-slate-300 dark:to-slate-600"></div>
                    <div className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full font-bold text-lg shadow-lg">
                        VS
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 dark:via-slate-600 to-slate-300 dark:to-slate-600"></div>
                </div>

                {/* Team B Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                        Second Team
                    </label>
                    <div className="space-y-3">
                        <div className="relative">
                            <Select value={teamB} onValueChange={setTeamB}>
                                <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select second team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {teams.map((team) => (
                                        <SelectItem key={team} value={team}>
                                            Team {team}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                                <Target className="w-5 h-5 text-slate-400" />
                            </div>
                            <Input
                                type="number"
                                placeholder="Goals scored"
                                value={scoreB}
                                onChange={(e) => setScoreB(e.target.value)}
                                className="h-12 pl-10 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                disabled={!teamB}
                            />
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                    <AlertDialogTrigger asChild>
                        <Button
                            className="w-full h-12 text-base bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center gap-2"
                            disabled={!isValid}
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
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                                    <div className="text-center">
                                        <div className="text-blue-600 dark:text-blue-400">{teamA}</div>
                                        <div className="text-2xl text-blue-700 dark:text-blue-300 mt-1">{scoreA}</div>
                                    </div>
                                    <div className="text-slate-400">-</div>
                                    <div className="text-center">
                                        <div className="text-purple-600 dark:text-purple-400">{teamB}</div>
                                        <div className="text-2xl text-purple-700 dark:text-purple-300 mt-1">{scoreB}</div>
                                    </div>
                                </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2">
                                Are you sure you want to submit this match result?
                            </p>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancel</AlertDialogCancel>
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
