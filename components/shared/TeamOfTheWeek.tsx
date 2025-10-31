"use client";

import { FC, useState } from "react";
import { TeamOfTheWeek } from "@/types/team";
import { Trophy, Calendar, Users2, Filter } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

interface TeamOfTheWeekComponentProps {
    teamOfWeek: TeamOfTheWeek | null;
    getTeamOfWeekByMonth: (month: string) => TeamOfTheWeek[];
}

const TeamOfTheWeekComponent: FC<TeamOfTheWeekComponentProps> = ({
    teamOfWeek,
    getTeamOfWeekByMonth,
}) => {
    const [selectedMonth, setSelectedMonth] = useState("all");

    // Get all unique months from team of the week
    const allMonths = new Set<string>();
    if (teamOfWeek) {
        allMonths.add(teamOfWeek.month);
    }

    // Generate current month and 5 previous months
    const generateMonthOptions = () => {
        const options = [];
        const now = new Date();
        for (let i = 0; i < 6; i++) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
            options.push({ value: monthStr, label: displayStr });
        }
        return options;
    };

    const monthOptions = generateMonthOptions();

    const filteredTeams = selectedMonth && selectedMonth !== "all"
        ? getTeamOfWeekByMonth(selectedMonth)
        : teamOfWeek ? [teamOfWeek] : [];

    return (
        <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 rounded-xl shadow-lg border-2 border-yellow-300 dark:border-yellow-700 p-6">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="team-of-week" className="border-none">
                    <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500 rounded-lg shadow-lg">
                                <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    Team of the Week
                                </h3>
                                {teamOfWeek && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        Last saved: {teamOfWeek.date}
                                    </p>
                                )}
                                {!teamOfWeek && (
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        No team saved yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        {/* Month Filter */}
                        {teamOfWeek && monthOptions.length > 0 && (
                            <div className="mb-4 flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-[200px]">
                                        <SelectValue placeholder="All Time" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Time</SelectItem>
                                        {monthOptions.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {/* Display Teams */}
                        {filteredTeams.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {filteredTeams.map((tw, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-md border border-slate-200 dark:border-slate-700"
                                    >
                                        <div className="flex items-start gap-3 mb-3">
                                            <Users2 className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                                            <div className="flex-1">
                                                <div className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                                                    {tw.team.name}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{tw.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <ul className="list-disc list-inside space-y-1">
                                            {tw.team.players.map((player: string, idx: number) => (
                                                <li
                                                    key={idx}
                                                    className="text-slate-700 dark:text-slate-300 text-sm"
                                                >
                                                    {player}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                                <p className="text-sm">No teams saved yet. Use the &quot;Finish&quot; button in League Standings to save the top team.</p>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default TeamOfTheWeekComponent;
