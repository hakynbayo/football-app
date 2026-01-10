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
        <div className="space-y-6">
            {successMessage && (
                <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white dark:text-black" />
                    </div>
                    <p className="text-black dark:text-white font-medium">{successMessage}</p>
                </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <Trophy className="w-4 h-4 text-white dark:text-black" />
                    </div>
                    <p className="text-sm text-black dark:text-white">
                        Select teams and enter scores to track match results
                    </p>
                </div>
            </div>

            <div className="space-y-6">
                {/* Team A Section */}
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-black dark:text-white">
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
                                <Target className="w-5 h-5 text-gray-400" />
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
                                <Target className="w-5 h-5 text-gray-400" />
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
                            className="w-full h-12 text-base bg-black hover:bg-gray-800 text-white dark:bg-white dark:hover:bg-gray-200 dark:text-black flex items-center gap-2"
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
                            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-center gap-4 text-lg font-semibold">
                                    <div className="text-center">
                                        <div className="text-black dark:text-white">{teamA}</div>
                                        <div className="text-2xl text-black dark:text-white mt-1">{scoreA}</div>
                                    </div>
                                    <div className="text-gray-400">-</div>
                                    <div className="text-center">
                                        <div className="text-black dark:text-white">{teamB}</div>
                                        <div className="text-2xl text-black dark:text-white mt-1">{scoreB}</div>
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
