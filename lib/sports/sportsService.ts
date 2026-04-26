/**
 * Demo sports data service. Swap `liveState` hydration for provider API results later.
 *
 * Production note (see .env.example): all real provider calls must run server-side
 * (Next.js route handlers / backend). Never ship private API keys to the browser.
 */

import type { MatchFilters, SportCategory, SportsMatch } from "./types";
import { MOCK_MATCHES } from "./mockSports";

function cloneMatch(m: SportsMatch): SportsMatch {
  return JSON.parse(JSON.stringify(m)) as SportsMatch;
}

let liveState: SportsMatch[] = MOCK_MATCHES.map(cloneMatch);

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeSports(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  listeners.forEach((l) => l());
}

export function getSports(): { id: SportCategory; label: string }[] {
  return [
    { id: "football", label: "Football" },
    { id: "basketball", label: "Basketball" },
    { id: "tennis", label: "Tennis" },
    { id: "esports", label: "Esports" },
    { id: "mma", label: "MMA" },
    { id: "boxing", label: "Boxing" },
  ];
}

function dayKey(iso: string): string {
  return new Date(iso).toDateString();
}

export function getMatches(filters: MatchFilters = {}): SportsMatch[] {
  let list = liveState.map(cloneMatch);
  const sport = filters.sport ?? "all";
  if (sport !== "all") list = list.filter((m) => m.sport === sport);

  const tab = filters.tab ?? "popular";
  const now = new Date();
  const today = now.toDateString();
  const tomorrow = new Date(now.getTime() + 86400000).toDateString();

  if (tab === "live") list = list.filter((m) => m.status === "live");
  else if (tab === "upcoming") list = list.filter((m) => m.status === "upcoming");
  else if (tab === "today") list = list.filter((m) => dayKey(m.startTime) === today);
  else if (tab === "tomorrow") list = list.filter((m) => dayKey(m.startTime) === tomorrow);
  else if (tab === "popular") {
    list = list
      .filter((m) => m.status !== "ended")
      .sort((a, b) => b.popularity - a.popularity);
  }

  return list;
}

export function getLiveMatches(): SportsMatch[] {
  return getMatches({ sport: "all", tab: "live" });
}

export function getUpcomingMatches(): SportsMatch[] {
  return getMatches({ sport: "all", tab: "upcoming" });
}

export function getOddsForMatch(matchId: string): SportsMatch | undefined {
  return liveState.find((m) => m.id === matchId);
}

function nudgeOdds(value: number): number {
  const step = Math.random() > 0.65 ? 0.02 : 0.01;
  const dir = Math.random() > 0.5 ? 1 : -1;
  return Math.max(1.01, Math.round((value + dir * step) * 100) / 100);
}

/** Small random walk on a few prices — keeps UI alive without reshuffling entire boards. */
export function simulateOddsMovement(): void {
  const active = liveState.filter((m) => m.status !== "ended");
  if (!active.length) return;
  const pick = active[Math.floor(Math.random() * active.length)]!;
  const idx = liveState.findIndex((m) => m.id === pick.id);
  if (idx < 0) return;

  const next = cloneMatch(liveState[idx]!);
  const r = Math.random();
  if (r < 0.34) next.markets.matchWinner.home = nudgeOdds(next.markets.matchWinner.home);
  else if (r < 0.67) next.markets.matchWinner.away = nudgeOdds(next.markets.matchWinner.away);
  else if (next.markets.matchWinner.draw != null) next.markets.matchWinner.draw = nudgeOdds(next.markets.matchWinner.draw);
  else {
    const ou = next.markets.overUnder[Math.floor(Math.random() * next.markets.overUnder.length)];
    if (ou && Math.random() > 0.5) ou.over = nudgeOdds(ou.over);
    else if (ou) ou.under = nudgeOdds(ou.under);
  }

  liveState = [...liveState.slice(0, idx), next, ...liveState.slice(idx + 1)];
  emit();
}

/** Tests / storybook */
export function resetSportsOddsDemo(): void {
  liveState = MOCK_MATCHES.map(cloneMatch);
  emit();
}

/** All matches (e.g. search index). */
export function getAllMatches(): SportsMatch[] {
  return liveState.map(cloneMatch);
}
