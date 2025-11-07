import { FC, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Team } from "@/types/team";
import { Users2, Edit2, X } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TeamCardProps {
  team: Team;
  teamIndex: number;
  onUpdateTeam?: (index: number, updatedTeam: Team) => void;
  onDeleteTeam?: (index: number) => void;
}

const getPlayerColor = (index: number) => {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-purple-500",
    "bg-teal-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
    "bg-cyan-500",
  ];
  return colors[index % colors.length];
};

const getTeamColor = (index: number) => {
  const colors = [
    {
      border: "border-l-blue-500",
      bg: "from-blue-50 to-white dark:from-blue-900 dark:to-slate-800",
      badge: "bg-blue-600"
    },
    {
      border: "border-l-purple-500",
      bg: "from-purple-50 to-white dark:from-purple-900 dark:to-slate-800",
      badge: "bg-purple-600"
    },
    {
      border: "border-l-green-500",
      bg: "from-green-50 to-white dark:from-green-900 dark:to-slate-800",
      badge: "bg-green-600"
    },
    {
      border: "border-l-yellow-500",
      bg: "from-yellow-50 to-white dark:from-yellow-900 dark:to-slate-800",
      badge: "bg-yellow-600"
    },
    {
      border: "border-l-pink-500",
      bg: "from-pink-50 to-white dark:from-pink-900 dark:to-slate-800",
      badge: "bg-pink-600"
    },
    {
      border: "border-l-indigo-500",
      bg: "from-indigo-50 to-white dark:from-indigo-900 dark:to-slate-800",
      badge: "bg-indigo-600"
    },
    {
      border: "border-l-red-500",
      bg: "from-red-50 to-white dark:from-red-900 dark:to-slate-800",
      badge: "bg-red-600"
    },
    {
      border: "border-l-teal-500",
      bg: "from-teal-50 to-white dark:from-teal-900 dark:to-slate-800",
      badge: "bg-teal-600"
    },
    {
      border: "border-l-orange-500",
      bg: "from-orange-50 to-white dark:from-orange-900 dark:to-slate-800",
      badge: "bg-orange-600"
    },
    {
      border: "border-l-cyan-500",
      bg: "from-cyan-50 to-white dark:from-cyan-900 dark:to-slate-800",
      badge: "bg-cyan-600"
    },
  ];
  return colors[index % colors.length];
};

const TeamCard: FC<TeamCardProps> = ({ team, teamIndex, onUpdateTeam, onDeleteTeam }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const teamColor = getTeamColor(teamIndex);

  const handleEdit = (index: number, currentName: string) => {
    setEditingIndex(index);
    setEditedName(currentName);
  };

  const handleSave = () => {
    if (editedName.trim() && editingIndex !== null) {
      const updatedTeam = {
        ...team,
        players: team.players.map((p, idx) => idx === editingIndex ? editedName : p),
        // Auto-update team name based on first player
        name: editingIndex === 0 ? editedName : team.name
      };
      onUpdateTeam?.(teamIndex, updatedTeam);
      setEditingIndex(null);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditedName("");
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    onDeleteTeam?.(teamIndex);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <Card className={`w-full h-full transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4 ${teamColor.border} bg-gradient-to-br ${teamColor.bg} group`}>
        <CardHeader className="pb-3 relative">
          {/* Team Index Badge */}
          <div className={`absolute -top-2 -left-2 w-8 h-8 ${teamColor.badge} text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg`}>
            {teamIndex + 1}
          </div>

          {/* Delete Button - Always visible (Admin only) */}
          {onDeleteTeam && isAdmin && (
            <button
              onClick={handleDelete}
              className="absolute -top-2 -right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors flex items-center justify-center"
              title="Delete team"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Users2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                Team {team.name}
              </h3>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-1.5">
          <ul className="space-y-1">
            {team.players.map((player, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <div className={`w-6 h-6 rounded-full ${getPlayerColor(idx)} text-white text-xs flex items-center justify-center font-bold flex-shrink-0 shadow-sm`}>
                  {idx + 1}
                </div>
                {editingIndex === idx ? (
                  <div className="flex items-center gap-1 flex-1 min-w-0">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      onBlur={handleSave}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSave();
                        } else if (e.key === "Escape") {
                          handleCancel();
                        }
                      }}
                      className="flex-1 px-2 py-1 text-sm border-2 border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white min-w-0"
                      autoFocus
                    />
                    <button
                      onClick={handleCancel}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-sm text-slate-700 dark:text-slate-300 font-medium truncate">{player}</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(idx, player)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded flex-shrink-0 active:bg-slate-300 dark:active:bg-slate-500 transition-colors"
                        title="Edit player name"
                      >
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{team.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};


export default TeamCard;
