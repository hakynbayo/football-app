import { FC } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Team } from "@/types/team";

interface TeamCardProps {
  team: Team;
}


const TeamCard: FC<TeamCardProps> = ({ team }) => {

  return (
    <Card className="w-full mb-4">
      <CardHeader className="text-xl font-semibold text-center">
        {team.name}
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1">
          {team.players.map((player, idx) => (
            <li key={idx} className="pl-2 border-l-2 border-blue-500">
              {player}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};


export default TeamCard;
