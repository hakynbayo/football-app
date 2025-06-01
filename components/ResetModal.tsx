"use client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchResults } from "@/hooks/useMatchResult";
import { useTeams } from "@/hooks/useTeams";
import { useState } from "react";

const DEFAULT_PASSWORD = "256256";

export function ResetTeamsButton() {
  const { clearTeams } = useTeams();
  const { clearMatchResults } = useMatchResults();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    if (password === DEFAULT_PASSWORD) {
      clearTeams();
      clearMatchResults();
      setPassword("");
      setError("");
      setOpen(false); // Close the dialog

      // 🔁 Reload the page after a short delay to allow state updates to propagate
      setTimeout(() => {
        window.location.reload();
      }, 100); // 100ms delay
    } else {
      setError("Incorrect password.");
    }
  };


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button className="w-[78%]" variant="destructive">
          Reset Teams
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all teams and matches?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all teams and match results. Enter &quot;256256&quot; to confirm.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
        />
        {error && <p className="text-sm text-red-500 mt-1">{error}</p>}

        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => {
              setPassword("");
              setError("");
            }}
          >
            Cancel
          </AlertDialogCancel>
          {/* Instead of using AlertDialogAction as a button, use a regular Button */}
          <Button variant="destructive" onClick={handleConfirm}>
            Yes, Reset
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
