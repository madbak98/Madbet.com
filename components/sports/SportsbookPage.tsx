"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { MatchFilters, SportsMatch } from "@/lib/sports/types";
import { getMatches, getLiveMatches, subscribeSports, simulateOddsMovement } from "@/lib/sports/sportsService";
import { useSportsDemoStore } from "@/store/useSportsDemoStore";
import { SportTabs } from "./SportTabs";
import { LiveOddsTicker } from "./LiveOddsTicker";
import { MatchCard } from "./MatchCard";
import { MarketSelector, type OddsPick } from "./MarketSelector";
import { BetSlip, type SlipLine } from "./BetSlip";

function buildOddsMap(list: SportsMatch[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of list) {
    const w = x.markets.matchWinner;
    m.set(`${x.id}|mw|home`, w.home);
    m.set(`${x.id}|mw|away`, w.away);
    if (w.draw != null) m.set(`${x.id}|mw|draw`, w.draw);
    for (const ou of x.markets.overUnder) {
      m.set(`${x.id}|ou|${ou.line}|over`, ou.over);
      m.set(`${x.id}|ou|${ou.line}|under`, ou.under);
    }
    x.markets.handicap.forEach((h, idx) => {
      m.set(`${x.id}|hc|${idx}|${h.team}|${h.line}`, h.odds);
    });
  }
  return m;
}

export function SportsbookPage({
  isLoggedIn,
  balance,
  onRequestAuth,
  onNotify,
  onDebitStake,
  onCreditPayout,
  focusedMatchId,
  onClearMatchFocus,
}: {
  isLoggedIn: boolean;
  balance: number;
  onRequestAuth: () => void;
  onNotify: (msg: string, type?: "success" | "error" | "info") => void;
  onDebitStake: (stake: number) => void;
  onCreditPayout: (amount: number) => void;
  focusedMatchId?: string | null;
  onClearMatchFocus?: () => void;
}) {
  const [filters, setFilters] = useState<MatchFilters>({ sport: "all", tab: "popular" });
  const [matches, setMatches] = useState<SportsMatch[]>(() => getMatches({ sport: "all", tab: "popular" }));
  const [prevOdds, setPrevOdds] = useState<Map<string, number>>(() => new Map());
  const [lines, setLines] = useState<SlipLine[]>([]);
  const [stake, setStake] = useState(50);
  const [marketMatch, setMarketMatch] = useState<SportsMatch | null>(null);
  const [mobileSlipOpen, setMobileSlipOpen] = useState(false);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const addPendingBet = useSportsDemoStore((s) => s.addPendingBet);
  const settleBet = useSportsDemoStore((s) => s.settleBet);
  const demoBets = useSportsDemoStore((s) => s.bets);

  const pullMatches = useCallback(() => {
    queueMicrotask(() => {
      setMatches((cur) => {
        setPrevOdds(buildOddsMap(cur));
        return getMatches(filters);
      });
    });
  }, [filters]);

  const applyFilters = useCallback((next: MatchFilters) => {
    setFilters(next);
    queueMicrotask(() => {
      setMatches((cur) => {
        setPrevOdds(buildOddsMap(cur));
        return getMatches(next);
      });
    });
  }, []);

  useEffect(() => {
    const unsub = subscribeSports(() => pullMatches());
    const id = window.setInterval(() => simulateOddsMovement(), 5000);
    return () => {
      unsub();
      window.clearInterval(id);
    };
  }, [pullMatches]);

  useEffect(() => {
    if (!focusedMatchId) return;
    const el = cardRefs.current[focusedMatchId];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const t = window.setTimeout(() => onClearMatchFocus?.(), 500);
    return () => window.clearTimeout(t);
  }, [focusedMatchId, onClearMatchFocus]);

  const liveFeed = getLiveMatches();

  const selectedKeys = useMemo(() => new Set(lines.map((l) => l.selectionId)), [lines]);

  const combinedOdds = useMemo(() => {
    if (!lines.length) return 1;
    let p = 1;
    for (const ln of lines) {
      p *= ln.lockedOdds;
      if (p > 99999) return 99999;
    }
    return Math.round(p * 100) / 100;
  }, [lines]);

  const potentialReturn = useMemo(() => Math.floor(stake * combinedOdds), [stake, combinedOdds]);

  const toggleLine = (pick: { selectionId: string; label: string; odds: number }) => {
    setLines((prev) => {
      const exists = prev.find((p) => p.selectionId === pick.selectionId);
      if (exists) return prev.filter((p) => p.selectionId !== pick.selectionId);
      return [...prev, { ...pick, lockedOdds: pick.odds }];
    });
  };

  const onPickFromMarket = (pick: OddsPick) => {
    toggleLine({ selectionId: pick.selectionId, label: pick.label, odds: pick.odds });
  };

  const placeDemo = () => {
    if (!isLoggedIn || !lines.length || stake <= 0 || stake > balance) return;
    onDebitStake(stake);
    const legLabels = lines.map((l) => l.label);
    const id = addPendingBet({
      stake,
      combinedOdds,
      potentialReturn,
      legs: legLabels,
    });
    onNotify(`Demo bet placed · ${lines.length} leg(s) · stake ${stake} DBAK`, "success");
    setLines([]);
    setMobileSlipOpen(false);

    window.setTimeout(() => {
      const r = Math.random();
      if (r < 0.45) {
        onCreditPayout(potentialReturn);
        settleBet(id, "won_demo");
        onNotify("Demo settlement: won (fake)", "success");
      } else if (r < 0.85) {
        settleBet(id, "lost_demo");
        onNotify("Demo settlement: lost (fake)", "info");
      } else {
        onCreditPayout(stake);
        settleBet(id, "void_demo");
        onNotify("Demo settlement: void — stake returned", "info");
      }
    }, 3500);
  };

  return (
    <div className="mx-auto max-w-[1400px] px-3 pb-28 pt-4 md:px-6 md:pb-8 lg:px-8">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-black uppercase italic text-white md:text-4xl">Sportsbook</h1>
          <p className="mt-1 max-w-2xl text-[11px] uppercase tracking-wider text-[#BFAF91]">
            Demo odds & fake stakes · API-ready architecture · No real wagering
          </p>
        </div>
        <span className="rounded border border-[#B11226]/50 bg-[#3A0B10]/40 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-[#E21B35]">
          Fake coins only
        </span>
      </header>

      <LiveOddsTicker matches={liveFeed} />

      <div className="mt-4 lg:grid lg:grid-cols-[1fr_minmax(280px,360px)] lg:items-start lg:gap-6">
        <div className="min-w-0 space-y-4">
          <SportTabs filters={filters} onChange={applyFilters} />

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            {matches.map((m) => (
              <div key={m.id} ref={(el) => { cardRefs.current[m.id] = el; }}>
                <MatchCard
                  match={m}
                  selectedKeys={selectedKeys}
                  prevOdds={prevOdds}
                  onToggleSelection={toggleLine}
                  onOpenMarkets={() => setMarketMatch(m)}
                />
              </div>
            ))}
          </div>

          {matches.length === 0 && (
            <p className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-8 text-center text-sm text-[#BFAF91]">No fixtures for this filter.</p>
          )}

          <section className="rounded-2xl border border-[#C9A45C]/30 bg-[#15110F] p-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A45C]">API ready mode</h2>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-[#BFAF91]">
              <li>• Real fixtures should stream from your chosen provider API on the server.</li>
              <li>• Odds must be fetched and normalized server-side; the client receives signed, versioned payloads.</li>
              <li>• Live price changes should use WebSocket or SSE — never long-poll public keys from the browser.</li>
              <li>• Real-money betting requires licensing, geo-fencing, and KYC/AML — this UI is simulation only.</li>
            </ul>
            <p className="mt-3 text-[10px] text-[#BFAF91]/70">
              Env placeholders: <span className="font-mono text-[#F2E3C6]">NEXT_PUBLIC_SPORTS_MODE</span>,{" "}
              <span className="font-mono text-[#F2E3C6]">SPORTS_API_PROVIDER</span>,{" "}
              <span className="font-mono text-[#F2E3C6]">SPORTS_API_KEY</span> (server-only in production).
            </p>
          </section>

          <section className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
            <h3 className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Recent demo sports bets</h3>
            {demoBets.length === 0 ? (
              <p className="mt-2 text-[10px] text-[#BFAF91]">No demo tickets yet.</p>
            ) : (
              <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto text-[10px] text-[#F2E3C6]">
                {demoBets.slice(0, 12).map((b) => (
                  <li key={b.id} className="flex flex-wrap justify-between gap-1 border-b border-[#1a1412] py-1 font-mono">
                    <span className="text-[#BFAF91]">{b.status}</span>
                    <span>{b.stake} → {b.potentialReturn}</span>
                    <span className="w-full truncate text-[9px] text-[#BFAF91]">{b.legs[0]}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <BetSlip
          lines={lines}
          stake={stake}
          onStakeChange={setStake}
          onRemove={(id) => setLines((p) => p.filter((x) => x.selectionId !== id))}
          onClear={() => setLines([])}
          onPlace={placeDemo}
          balance={balance}
          isLoggedIn={isLoggedIn}
          onRequestAuth={onRequestAuth}
          combinedOdds={combinedOdds}
          potentialReturn={potentialReturn}
          mobileOpen={mobileSlipOpen}
          onMobileToggle={setMobileSlipOpen}
        />
      </div>

      <MarketSelector
        match={marketMatch}
        open={!!marketMatch}
        onClose={() => setMarketMatch(null)}
        onPick={onPickFromMarket}
        selectedIds={selectedKeys}
      />
    </div>
  );
}
