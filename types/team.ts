export interface Team {
  name: string;
  players: string[];
}

export interface TeamStats {
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  points: number;
}

export interface MatchResult {
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
}
