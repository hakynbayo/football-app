"use client";

import { FC, useState } from "react";
import { TeamOfTheWeek } from "@/types/team";
import { Trophy, Calendar, Filter } from "lucide-react";
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
        <div className="bg-white dark:bg-black rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-3">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="team-of-week" className="border-none">
                    <AccordionTrigger className="hover:no-underline p-0">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <Trophy className="w-4 h-4 text-black dark:text-white" />
                            </div>
                            <div className="text-left">
                                <h3 className="text-sm font-bold text-black dark:text-white">
                                    Team of the Week
                                </h3>
                                {teamOfWeek && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        Last saved: {teamOfWeek.date}
                                    </p>
                                )}
                                {!teamOfWeek && (
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        No team saved yet
                                    </p>
                                )}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-3">
                        {/* Month Filter */}
                        {teamOfWeek && monthOptions.length > 0 && (
                            <div className="mb-3 flex items-center gap-2">
                                <Filter className="w-3 h-3 text-gray-600 dark:text-gray-400" />
                                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                                    <SelectTrigger className="w-[160px] h-8 text-xs">
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredTeams.map((tw, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 border border-gray-200 dark:border-gray-700"
                                    >
                                        <div className="flex items-start gap-2 mb-2">
                                            <div className="w-4 h-4 bg-black dark:bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <div className="w-1.5 h-1.5 bg-white dark:bg-black rounded-full"></div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-bold text-sm text-black dark:text-white mb-1 truncate">
                                                    {tw.team.name}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                    <Calendar className="w-3 h-3" />
                                                    <span>{tw.date}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-1">
                                            {tw.team.players.map((player: string, idx: number) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-1.5 p-1 bg-white dark:bg-black rounded text-xs"
                                                >
                                                    <div className="w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></div>
                                                    <span className="text-black dark:text-white truncate">
                                                        {player}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-6 text-gray-600 dark:text-gray-400">
                                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 mb-2">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                </div>
                                <p className="text-xs">No teams saved yet. Use the Finish button in League Standings to save the top team.</p>
                            </div>
                        )}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    );
};

export default TeamOfTheWeekComponent;
