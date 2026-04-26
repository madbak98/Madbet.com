export type SportCategory = "football" | "basketball" | "tennis" | "esports" | "mma" | "boxing";

export type MatchStatus = "live" | "upcoming" | "ended";

export type MatchWinnerOdds = {
  home: number;
  /** Omitted for sports with no draw (e.g. basketball, tennis). */
  draw?: number;
  away: number;
};

export type OverUnderLine = { line: number; over: number; under: number };

export type HandicapLine = { team: "home" | "away"; line: number; odds: number };

export type SportsMatchMarkets = {
  matchWinner: MatchWinnerOdds;
  overUnder: OverUnderLine[];
  handicap: HandicapLine[];
};

export type ScorePair = { home: number; away: number };

export type SportsMatch = {
  id: string;
  sport: SportCategory;
  league: string;
  country: string;
  homeTeam: string;
  awayTeam: string;
  /** ISO 8601 */
  startTime: string;
  status: MatchStatus;
  liveMinute?: number | null;
  score?: ScorePair | null;
  markets: SportsMatchMarkets;
  /** Higher = more featured in Popular tab */
  popularity: number;
};

export type SportsbookTab = "live" | "upcoming" | "today" | "tomorrow" | "popular";

export type MatchFilters = {
  sport?: SportCategory | "all";
  tab?: SportsbookTab;
};
