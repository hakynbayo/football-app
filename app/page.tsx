"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ResetTeamsButton } from "@/components/ResetModal";
import MatchInput from "@/components/shared/MatchInput";
import PlayerInputForm from "@/components/shared/PlayerInputForm";
import StatsTable from "@/components/shared/StatsTable";
import TeamCard from "@/components/shared/TeamCard";
import { useMatchResults } from "@/hooks/useMatchResult";
import { useTeams } from "@/hooks/useTeams";
import MatchHistory from "@/components/shared/MatchHistory";

export default function HomePage() {
  const { teams, setTeams } = useTeams();
  const { stats, addMatchResult } = useMatchResults();


  return (
    <main className="p-2 md:p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Football App</h1>
      <div className="border p-4 md:p-12 rounded-xl">

        <Accordion type="single" className="w-full space-y-4">
          {/* Player Input */}
          <AccordionItem value="player-input">
            <AccordionTrigger>GENERATE TEAMS</AccordionTrigger>
            <AccordionContent>
              <PlayerInputForm onGenerateTeams={setTeams} />
            </AccordionContent>
          </AccordionItem>

          {/* Teams Display */}
          <AccordionItem value="teams">
            <AccordionTrigger>TEAMS</AccordionTrigger>
            <AccordionContent>
              {teams.length === 0 ? (
                <p className="text-center text-gray-500 italic mt-4">
                  No teams have been generated yet.
                </p>
              ) : (
                <section className="flex gap-4 justify-between items-center mt-4">
                  {teams.map((team) => (
                    <TeamCard key={team.name} team={team} />
                  ))}
                </section>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Match Input */}

          <AccordionItem value="match-input">
            <AccordionTrigger>ENTER MATCH RESULT</AccordionTrigger>
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
            <AccordionTrigger> MATCH HISTORY</AccordionTrigger>
            <AccordionContent>
              <MatchHistory
              />
            </AccordionContent>
          </AccordionItem>

          {/* Stats Table */}
          <AccordionItem value="stats">
            <AccordionTrigger>STANDINGS</AccordionTrigger>
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
