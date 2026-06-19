import { FC, useState } from "react";
import { Team } from "@/types/team";
import { Edit2, X } from "lucide-react";
import { useSession } from "next-auth/react";

interface TeamCardProps {
  team: Team;
  teamIndex: number;
  onUpdateTeam?: (index: number, updatedTeam: Team) => void;
  onDeleteTeam?: (index: number) => void;
}

const TeamCard: FC<TeamCardProps> = ({ team, teamIndex, onUpdateTeam }) => {
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editedName, setEditedName] = useState("");

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

  return (
    <>
      <div className={`w-full transition-all duration-300 hover:scale-[1.01] border-l-4 bg-gradient-to-br rounded-xl border border-gray-800 dark:border-gray-800 relative overflow-hidden`}>
        {/* Team Index Badge */}
        

        <div className="p-3">
          {/* Team Header */}
          <div className="flex items-center gap-2 mb-3 pt-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs`}>
          {teamIndex + 1}
        </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-black dark:text-white truncate">
                Team {team.name}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {team.players.length} players
              </p>
            </div>
          </div>

          {/* Players List */}
          <div className="grid grid-cols-2 gap-1.5">
            {team.players.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-200 border border-gray-200 dark:border-gray-700 "
              >
                {/* <div className={`w-6 h-6 rounded-full ${getPlayerColor(idx)} flex items-center justify-center flex-shrink-0`}> */}
                  <div className="w-2 h-2 bg-black dark:bg-white rounded-full"></div>
                {/* </div> */}
                {editingIndex === idx ? (
                  <div className="flex items-center gap-1.5 flex-1 min-w-0">
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
                      className="flex-1 px-2 py-1 text-xs border-2 border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-gray-700 dark:text-white min-w-0 bg-white"
                      autoFocus
                    />
                    <button
                      onClick={handleCancel}
                      className="flex-shrink-0 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-md transition-colors"
                      title="Cancel editing"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between flex-1 min-w-0">
                    <span className="text-xs text-black dark:text-white font-medium truncate">{player}</span>
                    {isAdmin && (
                      <button
                        onClick={() => handleEdit(idx, player)}
                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md flex-shrink-0 transition-all duration-200 hover:scale-110"
                        title="Edit player name"
                      >
                        <Edit2 className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};


export default TeamCard;
