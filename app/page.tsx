"use client"
import { ResetTeamsButton } from "@/components/ResetModal";
import MatchHistory from "@/components/shared/MatchHistory";
import MatchInput from "@/components/shared/MatchInput";
import PlayerInputForm from "@/components/shared/PlayerInputForm";
import StatsTable from "@/components/shared/StatsTable";
import TeamCard from "@/components/shared/TeamCard";
import { useMatchResults } from "@/hooks/useMatchResult";
import { useTeams } from "@/hooks/useTeams";
import { Team } from "@/types/team";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { teams, setTeams } = useTeams();
  const [playerText, setPlayerText] = useState("");
  const { stats, addMatchResult } = useMatchResults();

  const handleGenerateTeams = (teams: Team[]) => {
    setTeams(teams);
  };

  return (
    <main className="p-2 md:p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Football App</h1>
      <div className="border border-black p-4 md:p-12 rounded-xl">
        <Accordion type="multiple" className="w-full space-y-4">
          {/* Player Input */}
          <AccordionItem value="player-input">
            <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium border-b border-gray-200 transition-all">
              GENERATE TEAMS
              <ChevronDownIcon
                className="w-5 h-5 text-black transition-transform duration-300 group-radix-state-open:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent>
              <PlayerInputForm
                playerText={playerText}
                setPlayerText={setPlayerText}
                onGenerateTeams={handleGenerateTeams}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Teams Display */}
          <AccordionItem value="teams">
            <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium border-b border-gray-200 transition-all">
              TEAMS
              <ChevronDownIcon
                className="w-5 h-5 text-black transition-transform duration-300 group-radix-state-open:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent>
              {teams.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-4">
                  No teams have been generated yet.
                </p>
              ) : (
                <section className="grid grid-cols-2 gap-4 mt-4 md:grid-cols-2 lg:grid-cols-4">
                  {teams.map((team) => (
                    <TeamCard key={team.name} team={team} />
                  ))}
                </section>

              )}
            </AccordionContent>
          </AccordionItem>

          {/* Match Input */}
          <AccordionItem value="match-input">
            <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium border-b border-gray-200 transition-all">
              ENTER MATCH RESULT
              <ChevronDownIcon
                className="w-5 h-5 text-black transition-transform duration-300 group-radix-state-open:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent>
              <MatchInput
                teams={teams.map((t) => t.name)}
                onSubmit={(teamA, teamB, scoreA, scoreB) =>
                  addMatchResult(teamA, teamB, Number(scoreA), Number(scoreB))
                }
              />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="match-history">
            <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium border-b border-gray-200 transition-all">
              MATCH HISTORY
              <ChevronDownIcon
                className="w-5 h-5 text-black transition-transform duration-300 group-radix-state-open:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent>
              <MatchHistory />
            </AccordionContent>
          </AccordionItem>

          {/* Stats Table */}
          <AccordionItem value="stats">
            <AccordionTrigger className="flex items-center justify-between w-full py-4 text-left font-medium border-b border-gray-200 transition-all">
              STANDINGS
              <ChevronDownIcon
                className="w-5 h-5 text-black transition-transform duration-300 group-radix-state-open:rotate-180"
              />
            </AccordionTrigger>
            <AccordionContent>
              <StatsTable stats={stats} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      {/* Reset stays always visible */}
      <div className="flex justify-center mx-auto mt-6 w-[60%]">
        <ResetTeamsButton />
      </div>
    </main>
  );
}
