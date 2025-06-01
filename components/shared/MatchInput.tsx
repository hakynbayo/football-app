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
        <div className="space-y-4 max-w-lg mx-auto mt-6 flex flex-col items-center">
            {successMessage && (
                <p className="text-green-600 font-medium text-center">{successMessage}</p>
            )}

            <div className="flex flex-col gap-2">
                <select
                    className="border rounded p-2"
                    value={teamA}
                    onChange={(e) => setTeamA(e.target.value)}
                >
                    <option value="">Select first team</option>
                    {teams.map((team) => (
                        <option key={team} value={team}>
                            {team}
                        </option>
                    ))}
                </select>
                <Input
                    type="number"
                    placeholder={`Goals by ${teamA || "Team A"}`}
                    value={scoreA}
                    onChange={(e) => setScoreA(e.target.value)}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />

            </div>

            <p className="font-bold text-base text-center">VS</p>

            <div className="flex flex-col gap-2">
                <select
                    className="border rounded p-2"
                    value={teamB}
                    onChange={(e) => setTeamB(e.target.value)}
                >
                    <option value="">Select second team</option>
                    {teams.map((team) => (
                        <option key={team} value={team}>
                            {team}
                        </option>
                    ))}
                </select>
                <Input
                    type="number"
                    placeholder={`Goals by ${teamB || "Team B"}`}
                    value={scoreB}
                    onChange={(e) => setScoreB(e.target.value)}
                    className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />


            </div>

            <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
                <AlertDialogTrigger asChild>
                    <Button
                        className="w-[50%]"
                        disabled={!isValid}
                        onClick={() => setShowDialog(true)}
                    >
                        Submit Match Result
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Confirm submitting: {teamA} {scoreA} - {scoreB} {teamB}?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setShowDialog(false)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                handleConfirm();
                                setShowDialog(false);
                            }}
                        >
                            Submit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MatchInput;
