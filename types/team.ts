export interface Team {
  id?: string;
  name: string;
  players: string[];
}

export interface TeamStats {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number; // goal difference
  points: number;
}

export interface MatchResult {
  id?: string;
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  goals?: GoalEvent[];
}

export interface GoalEvent {
  id?: string;
  matchId?: string;
  team: string;
  scorer: string;
  assist?: string | null;
}

export interface PlayerLeaderboard {
  player: string;
  goals: number;
  assists: number;
}

export interface TeamOfTheWeek {
  team: Team;
  date: string;
  month: string;
}
