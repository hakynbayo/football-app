"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMatchResults } from "@/hooks/useMatchResult";
import { useTeams } from "@/hooks/useTeams";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";

export function ResetTeamsButton() {
  const { clearTeams } = useTeams();
  const { clearMatchResults } = useMatchResults();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";

  const [open, setOpen] = useState(false);

  if (!isAdmin) return null;

  const handleConfirm = () => {
    clearTeams();
    clearMatchResults();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <button
          className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 rounded-lg transition-colors"
          title="Reset all data"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reset all teams and matches?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete all teams and match results. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-600 hover:bg-red-700"
          >
            Yes, Reset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
