"use client";

import { X } from "lucide-react";
import type { SportsMatch } from "@/lib/sports/types";

export type OddsPick = {
  selectionId: string;
  label: string;
  odds: number;
};

export function MarketSelector({
  match,
  open,
  onClose,
  onPick,
  selectedIds,
}: {
  match: SportsMatch | null;
  open: boolean;
  onClose: () => void;
  onPick: (pick: OddsPick) => void;
  selectedIds: Set<string>;
}) {
  if (!open || !match) return null;

  const base = `text-left rounded-lg border px-2 py-2 text-[11px] font-mono transition`;

  return (
    <div className="fixed inset-0 z-[200] flex items-end justify-center bg-black/70 p-3 sm:items-center" role="dialog" aria-modal="true">
      <button type="button" className="absolute inset-0 h-full w-full cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-4 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#C9A45C]">{match.league}</p>
            <h2 className="font-display text-lg font-black uppercase italic text-[#F2E3C6]">
              {match.homeTeam} <span className="text-[#BFAF91] not-italic">vs</span> {match.awayTeam}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[#2A1D19] p-2 text-[#BFAF91] hover:border-[#B11226] hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <section className="mt-4 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Over / Under</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {match.markets.overUnder.map((line) => (
              <div key={line.line} className="rounded-lg border border-[#2A1D19] bg-[#15110F] p-2">
                <p className="text-[9px] font-bold text-[#BFAF91]">Line {line.line}</p>
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {(
                    [
                      ["over", line.over] as const,
                      ["under", line.under] as const,
                    ] as const
                  ).map(([side, odd]) => {
                    const selectionId = `${match.id}|ou|${line.line}|${side}`;
                    const sel = selectedIds.has(selectionId);
                    return (
                      <button
                        key={side}
                        type="button"
                        onClick={() =>
                          onPick({
                            selectionId,
                            odds: odd,
                            label: `${match.homeTeam} vs ${match.awayTeam} · O/U ${line.line} ${side}`,
                          })
                        }
                        className={`${base} ${
                          sel ? "border-[#C9A45C] bg-[#3A0B10]/40 text-[#F2E3C6]" : "border-[#2A1D19] text-[#F2E3C6] hover:border-[#B11226]/50"
                        }`}
                      >
                        {side} {odd.toFixed(2)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-6 space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Handicap</p>
          <div className="flex flex-wrap gap-2">
            {match.markets.handicap.map((h, idx) => {
              const teamName = h.team === "home" ? match.homeTeam : match.awayTeam;
              const selectionId = `${match.id}|hc|${idx}|${h.team}|${h.line}`;
              const sel = selectedIds.has(selectionId);
              return (
                <button
                  key={selectionId}
                  type="button"
                  onClick={() =>
                    onPick({
                      selectionId,
                      odds: h.odds,
                      label: `${match.homeTeam} vs ${match.awayTeam} · ${teamName} (${h.line > 0 ? "+" : ""}${h.line})`,
                    })
                  }
                  className={`${base} ${sel ? "border-[#C9A45C] bg-[#3A0B10]/40" : "border-[#2A1D19] hover:border-[#B11226]/50"}`}
                >
                  {teamName} {h.line > 0 ? `+${h.line}` : h.line} @ {h.odds.toFixed(2)}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
