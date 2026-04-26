"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import type { SportsMatch } from "@/lib/sports/types";

function OddCell({
  label,
  value,
  selected,
  onPick,
  prevValue,
}: {
  label: string;
  value: number;
  selected: boolean;
  onPick: () => void;
  prevValue: number | null;
}) {
  const moved = prevValue != null && Math.abs(prevValue - value) > 0.001 ? (value > prevValue ? "up" : "down") : null;

  return (
    <button
      type="button"
      onClick={onPick}
      className={`flex min-h-[44px] flex-1 flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center transition sm:min-h-0 sm:py-2 ${
        selected
          ? "border-[#B11226] bg-[#3A0B10]/55 text-[#F2E3C6] shadow-[0_0_0_1px_rgba(201,164,92,0.35)]"
          : "border-[#2A1D19] bg-[#0D0D0D] text-[#F2E3C6] hover:border-[#B11226]/45"
      }`}
    >
      <span className="text-[9px] font-black uppercase tracking-wider text-[#BFAF91]">{label}</span>
      <span className="flex items-center gap-0.5 font-mono text-sm font-bold">
        {value.toFixed(2)}
        {moved === "up" && <ChevronUp className="h-3.5 w-3.5 text-[#C9A45C]" strokeWidth={3} aria-hidden />}
        {moved === "down" && <ChevronDown className="h-3.5 w-3.5 text-[#E21B35]" strokeWidth={3} aria-hidden />}
      </span>
    </button>
  );
}

export function MatchCard({
  match,
  selectedKeys,
  onToggleSelection,
  onOpenMarkets,
  prevOdds,
}: {
  match: SportsMatch;
  selectedKeys: Set<string>;
  onToggleSelection: (args: { selectionId: string; label: string; odds: number }) => void;
  onOpenMarkets: () => void;
  prevOdds: Map<string, number>;
}) {
  const start = new Date(match.startTime);
  const timeStr = start.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <article className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-[#C9A45C]">
            {match.league} · {match.country}
          </p>
          <h3 className="mt-1 font-display text-sm font-black uppercase italic text-white sm:text-base">
            {match.homeTeam} <span className="text-[#BFAF91] not-italic">vs</span> {match.awayTeam}
          </h3>
          <p className="mt-1 text-[10px] text-[#BFAF91]">{timeStr}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {match.status === "live" && (
            <span className="rounded bg-[#B11226] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#F2E3C6]">
              Live {match.liveMinute != null ? `· ${match.liveMinute}'` : ""}
            </span>
          )}
          {match.status === "live" && match.score && (
            <span className="font-mono text-sm font-black text-[#F2E3C6]">
              {match.score.home} – {match.score.away}
            </span>
          )}
          {match.status === "ended" && <span className="text-[9px] font-bold uppercase text-[#BFAF91]">Ended</span>}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5">
        <OddCell
          label="Home"
          value={match.markets.matchWinner.home}
          selected={selectedKeys.has(`${match.id}|mw|home`)}
          prevValue={prevOdds.has(`${match.id}|mw|home`) ? prevOdds.get(`${match.id}|mw|home`)! : null}
          onPick={() =>
            onToggleSelection({
              selectionId: `${match.id}|mw|home`,
              label: `${match.homeTeam} vs ${match.awayTeam} · Match · Home`,
              odds: match.markets.matchWinner.home,
            })
          }
        />
        {match.markets.matchWinner.draw != null && (
          <OddCell
            label="Draw"
            value={match.markets.matchWinner.draw}
            selected={selectedKeys.has(`${match.id}|mw|draw`)}
            prevValue={prevOdds.has(`${match.id}|mw|draw`) ? prevOdds.get(`${match.id}|mw|draw`)! : null}
            onPick={() => {
              const d = match.markets.matchWinner.draw;
              if (d == null) return;
              onToggleSelection({
                selectionId: `${match.id}|mw|draw`,
                label: `${match.homeTeam} vs ${match.awayTeam} · Match · Draw`,
                odds: d,
              });
            }}
          />
        )}
        <OddCell
          label="Away"
          value={match.markets.matchWinner.away}
          selected={selectedKeys.has(`${match.id}|mw|away`)}
          prevValue={prevOdds.has(`${match.id}|mw|away`) ? prevOdds.get(`${match.id}|mw|away`)! : null}
          onPick={() =>
            onToggleSelection({
              selectionId: `${match.id}|mw|away`,
              label: `${match.homeTeam} vs ${match.awayTeam} · Match · Away`,
              odds: match.markets.matchWinner.away,
            })
          }
        />
      </div>

      <button
        type="button"
        onClick={onOpenMarkets}
        className="mt-2 w-full rounded-lg border border-[#C9A45C]/40 py-2 text-[10px] font-black uppercase tracking-widest text-[#C9A45C] hover:bg-[#15110F]"
      >
        More markets
      </button>
    </article>
  );
}
