import type { SportsMatch } from "./types";

function iso(hoursFromNow: number): string {
  return new Date(Date.now() + hoursFromNow * 3600000).toISOString();
}

/** Seeded-style static fixtures for demo search + UI (not live API data). */
export const MOCK_MATCHES: SportsMatch[] = [
  {
    id: "fb-el-clasico",
    sport: "football",
    league: "La Liga",
    country: "Spain",
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    startTime: iso(-0.5),
    status: "live",
    liveMinute: 67,
    score: { home: 1, away: 1 },
    popularity: 100,
    markets: {
      matchWinner: { home: 2.15, draw: 3.4, away: 2.05 },
      overUnder: [
        { line: 1.5, over: 1.22, under: 3.9 },
        { line: 2.5, over: 1.72, under: 2.05 },
        { line: 3.5, over: 2.25, under: 1.62 },
      ],
      handicap: [
        { team: "home", line: -0.5, odds: 1.95 },
        { team: "away", line: 0.5, odds: 1.85 },
      ],
    },
  },
  {
    id: "fb-pl-ars-che",
    sport: "football",
    league: "Premier League",
    country: "England",
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    startTime: iso(2),
    status: "upcoming",
    popularity: 88,
    markets: {
      matchWinner: { home: 1.92, draw: 3.5, away: 3.25 },
      overUnder: [
        { line: 1.5, over: 1.18, under: 4.2 },
        { line: 2.5, over: 1.65, under: 2.18 },
        { line: 3.5, over: 2.1, under: 1.68 },
      ],
      handicap: [
        { team: "home", line: -0.25, odds: 1.88 },
        { team: "away", line: 0.25, odds: 1.92 },
      ],
    },
  },
  {
    id: "fb-int-tur-ger",
    sport: "football",
    league: "International Friendly",
    country: "Neutral",
    homeTeam: "Turkey",
    awayTeam: "Germany",
    startTime: iso(26),
    status: "upcoming",
    popularity: 72,
    markets: {
      matchWinner: { home: 4.1, draw: 3.6, away: 1.72 },
      overUnder: [
        { line: 1.5, over: 1.28, under: 3.35 },
        { line: 2.5, over: 1.82, under: 1.92 },
        { line: 3.5, over: 2.4, under: 1.52 },
      ],
      handicap: [
        { team: "home", line: 1, odds: 1.9 },
        { team: "away", line: -1, odds: 1.9 },
      ],
    },
  },
  {
    id: "bk-lal-gsw",
    sport: "basketball",
    league: "NBA",
    country: "USA",
    homeTeam: "Los Angeles Lakers",
    awayTeam: "Golden State Warriors",
    startTime: iso(5),
    status: "upcoming",
    popularity: 95,
    markets: {
      matchWinner: { home: 1.88, away: 1.94 },
      overUnder: [
        { line: 215.5, over: 1.9, under: 1.9 },
        { line: 220.5, over: 2.05, under: 1.75 },
        { line: 225.5, over: 2.2, under: 1.62 },
      ],
      handicap: [
        { team: "home", line: -2.5, odds: 1.91 },
        { team: "away", line: 2.5, odds: 1.89 },
      ],
    },
  },
  {
    id: "bk-live-den-mia",
    sport: "basketball",
    league: "NBA",
    country: "USA",
    homeTeam: "Denver Nuggets",
    awayTeam: "Miami Heat",
    startTime: iso(-0.2),
    status: "live",
    liveMinute: 36,
    score: { home: 58, away: 52 },
    popularity: 70,
    markets: {
      matchWinner: { home: 1.42, away: 2.75 },
      overUnder: [
        { line: 210.5, over: 1.85, under: 1.95 },
        { line: 215.5, over: 2.0, under: 1.8 },
        { line: 220.5, over: 2.15, under: 1.68 },
      ],
      handicap: [
        { team: "home", line: -6.5, odds: 1.88 },
        { team: "away", line: 6.5, odds: 1.92 },
      ],
    },
  },
  {
    id: "tn-wim-final",
    sport: "tennis",
    league: "Wimbledon",
    country: "United Kingdom",
    homeTeam: "C. Noir",
    awayTeam: "A. Ember",
    startTime: iso(8),
    status: "upcoming",
    popularity: 62,
    markets: {
      matchWinner: { home: 1.73, away: 2.05 },
      overUnder: [
        { line: 2.5, over: 1.85, under: 1.9 },
        { line: 3.5, over: 2.1, under: 1.7 },
        { line: 4.5, over: 2.45, under: 1.52 },
      ],
      handicap: [
        { team: "home", line: -1.5, odds: 2.05 },
        { team: "away", line: 1.5, odds: 1.75 },
      ],
    },
  },
  {
    id: "es-lol-demo",
    sport: "esports",
    league: "LoL · Demo League",
    country: "Online",
    homeTeam: "VoidStack Esports",
    awayTeam: "Rift Wolves",
    startTime: iso(-0.1),
    status: "live",
    liveMinute: 24,
    score: { home: 1, away: 0 },
    popularity: 55,
    markets: {
      matchWinner: { home: 1.62, away: 2.2 },
      overUnder: [
        { line: 2.5, over: 1.75, under: 2.0 },
        { line: 3.5, over: 2.05, under: 1.72 },
        { line: 4.5, over: 2.35, under: 1.55 },
      ],
      handicap: [
        { team: "home", line: -1.5, odds: 1.95 },
        { team: "away", line: 1.5, odds: 1.85 },
      ],
    },
  },
  {
    id: "mma-demo-title",
    sport: "mma",
    league: "Demo Fight Night",
    country: "USA",
    homeTeam: "Silva (Demo)",
    awayTeam: "Costa (Demo)",
    startTime: iso(30),
    status: "upcoming",
    popularity: 48,
    markets: {
      matchWinner: { home: 1.55, away: 2.35 },
      overUnder: [
        { line: 1.5, over: 2.8, under: 1.38 },
        { line: 2.5, over: 1.95, under: 1.82 },
        { line: 3.5, over: 1.52, under: 2.35 },
      ],
      handicap: [
        { team: "home", line: -1.5, odds: 1.88 },
        { team: "away", line: 1.5, odds: 1.92 },
      ],
    },
  },
  {
    id: "box-demo-heavy",
    sport: "boxing",
    league: "Heavyweight · Demo",
    country: "UK",
    homeTeam: "Fury (Demo)",
    awayTeam: "Usyk (Demo)",
    startTime: iso(72),
    status: "upcoming",
    popularity: 60,
    markets: {
      matchWinner: { home: 1.68, draw: 19.0, away: 2.1 },
      overUnder: [
        { line: 8.5, over: 1.9, under: 1.85 },
        { line: 10.5, over: 2.05, under: 1.72 },
        { line: 12.5, over: 2.3, under: 1.58 },
      ],
      handicap: [
        { team: "home", line: -2.5, odds: 1.9 },
        { team: "away", line: 2.5, odds: 1.9 },
      ],
    },
  },
  {
    id: "fb-ended",
    sport: "football",
    league: "Serie A",
    country: "Italy",
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    startTime: iso(-48),
    status: "ended",
    score: { home: 2, away: 1 },
    popularity: 40,
    markets: {
      matchWinner: { home: 2.0, draw: 3.2, away: 3.4 },
      overUnder: [
        { line: 1.5, over: 1.2, under: 4.0 },
        { line: 2.5, over: 1.7, under: 2.0 },
        { line: 3.5, over: 2.2, under: 1.6 },
      ],
      handicap: [
        { team: "home", line: -0.5, odds: 1.9 },
        { team: "away", line: 0.5, odds: 1.9 },
      ],
    },
  },
];
