"use client";

import type { SportsMatch } from "@/lib/sports/types";

export function LiveOddsTicker({ matches }: { matches: SportsMatch[] }) {
  const live = matches.filter((m) => m.status === "live");
  if (!live.length) {
    return (
      <div className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-[#BFAF91]">
        No live markets right now · demo clock
      </div>
    );
  }

  const row = [...live, ...live];

  return (
    <div className="relative overflow-hidden rounded-lg border border-[#B11226]/30 bg-[#15110F]">
      <div className="madbak-sports-ticker flex w-max gap-10 py-2 pl-4 pr-20 text-[11px] font-mono text-[#F2E3C6]">
        {row.map((m, i) => (
          <span key={`${m.id}-${i}`} className="inline-flex shrink-0 items-center gap-2">
            <span className="rounded bg-[#B11226] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#F2E3C6]">Live</span>
            <span className="text-[#C9A45C]">{m.homeTeam}</span>
            <span className="text-[#BFAF91]">vs</span>
            <span className="text-[#C9A45C]">{m.awayTeam}</span>
            <span className="text-[#BFAF91]">
              {m.score ? `${m.score.home}-${m.score.away}` : "—"} · H {m.markets.matchWinner.home.toFixed(2)}
              {m.markets.matchWinner.draw != null ? ` / D ${m.markets.matchWinner.draw.toFixed(2)}` : ""} / A{" "}
              {m.markets.matchWinner.away.toFixed(2)}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
