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

export default function HomePage() {
  const { teams, setTeams } = useTeams();
  const { stats, addMatchResult } = useMatchResults();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold text-center mb-4">Football App</h1>
      <div className="border p-12 rounded-xl">

        <Accordion type="multiple" className="w-full space-y-4">
          {/* Player Input */}
          <AccordionItem value="player-input">
            <AccordionTrigger>GENERATE TEAMS</AccordionTrigger>
            <AccordionContent>
              <PlayerInputForm onGenerateTeams={setTeams} />
            </AccordionContent>
          </AccordionItem>

          {/* Teams Display */}
          {teams.length > 0 && (
            <AccordionItem value="teams">
              <AccordionTrigger>TEAMS</AccordionTrigger>
              <AccordionContent>
                <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {teams.map((team) => (
                    <TeamCard key={team.name} team={team} />
                  ))}
                </section>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Match Input */}
          {teams.length >= 2 && (
            <AccordionItem value="match-input">
              <AccordionTrigger>ENTER MATCH RESULT</AccordionTrigger>
              <AccordionContent>
                <MatchInput
                  teams={teams.map((t) => t.name)}
                  onSubmit={addMatchResult}
                />
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Stats Table */}
          {stats.length > 0 && (
            <AccordionItem value="stats">
              <AccordionTrigger>STANDINGS</AccordionTrigger>
              <AccordionContent>
                <StatsTable stats={stats} />
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>

      {/* Reset stays always visible */}
      {teams.length > 0 && (
        <div className="flex justify-center mx-auto mt-6 w-[60%]">
          <ResetTeamsButton />
        </div>
      )}
    </main>
  );
}
