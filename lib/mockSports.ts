import { MOCK_MATCHES } from "@/lib/sports/mockSports";

/** Legacy shape for home / casino previews — data sourced from `lib/sports/mockSports`. */
export const mockSports = MOCK_MATCHES.slice(0, 4).map((m) => ({
  id: m.id,
  sport: m.sport,
  match: `${m.homeTeam} vs ${m.awayTeam}`,
  odds: [m.markets.matchWinner.home, m.markets.matchWinner.draw ?? 0, m.markets.matchWinner.away].filter((o) => o > 0),
  status: m.status === "live" ? ("LIVE" as const) : ("PRE" as const),
}));
