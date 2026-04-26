"use client";

import { Trash2, X } from "lucide-react";
import type { OddsPick } from "./MarketSelector";

export type SlipLine = OddsPick & { lockedOdds: number };

export function BetSlip({
  lines,
  stake,
  onStakeChange,
  onRemove,
  onClear,
  onPlace,
  balance,
  isLoggedIn,
  onRequestAuth,
  combinedOdds,
  potentialReturn,
  mobileOpen,
  onMobileToggle,
}: {
  lines: SlipLine[];
  stake: number;
  onStakeChange: (n: number) => void;
  onRemove: (selectionId: string) => void;
  onClear: () => void;
  onPlace: () => void;
  balance: number;
  isLoggedIn: boolean;
  onRequestAuth: () => void;
  combinedOdds: number;
  potentialReturn: number;
  mobileOpen: boolean;
  onMobileToggle: (open: boolean) => void;
}) {
  const canPlace = isLoggedIn && lines.length > 0 && stake > 0 && stake <= balance;

  const panelInner = (
    <div className="flex max-h-[min(70vh,520px)] flex-col">
      <div className="flex items-center justify-between border-b border-[#2A1D19] px-4 py-3">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[#C9A45C]">Bet slip</h2>
        <div className="flex items-center gap-2">
          {lines.length > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded border border-[#2A1D19] px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[#BFAF91] hover:border-[#B11226]"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
          <button
            type="button"
            className="rounded p-1 text-[#BFAF91] hover:text-white lg:hidden"
            onClick={() => onMobileToggle(false)}
            aria-label="Close bet slip"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {!isLoggedIn && (
          <div className="rounded-lg border border-[#B11226]/40 bg-[#3A0B10]/30 p-3 text-center text-xs text-[#F2E3C6]">
            <p className="font-black uppercase tracking-widest text-[#C9A45C]">Login required</p>
            <p className="mt-1 text-[10px] text-[#BFAF91]">Sign in to place demo sports bets with fake DBAK.</p>
            <button
              type="button"
              onClick={onRequestAuth}
              className="mt-3 w-full rounded-lg bg-[#B11226] py-2 text-[10px] font-black uppercase tracking-widest text-[#F2E3C6]"
            >
              Login / Sign up
            </button>
          </div>
        )}

        {lines.length === 0 ? (
          <p className="py-6 text-center text-[11px] text-[#BFAF91]">Tap odds to build a demo accumulator.</p>
        ) : (
          lines.map((ln) => (
            <div key={ln.selectionId} className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] p-2">
              <div className="flex justify-between gap-2">
                <p className="text-[10px] leading-snug text-[#F2E3C6]">{ln.label}</p>
                <button type="button" onClick={() => onRemove(ln.selectionId)} className="shrink-0 text-[#BFAF91] hover:text-[#E21B35]">
                  <X size={14} />
                </button>
              </div>
              <p className="mt-1 font-mono text-xs text-[#C9A45C]">Locked @ {ln.lockedOdds.toFixed(2)}</p>
            </div>
          ))
        )}
      </div>

      <div className="border-t border-[#2A1D19] px-4 py-3">
        <label className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Stake (DBAK)</label>
        <input
          type="number"
          min={1}
          disabled={!isLoggedIn}
          value={stake || ""}
          onChange={(e) => onStakeChange(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none disabled:opacity-40"
        />
        <div className="mt-2 space-y-1 font-mono text-[11px] text-[#BFAF91]">
          <div className="flex justify-between">
            <span>Combined (demo)</span>
            <span className="text-[#F2E3C6]">{combinedOdds.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Potential return</span>
            <span className="text-[#C9A45C]">{Math.floor(potentialReturn)} DBAK</span>
          </div>
        </div>
        <button
          type="button"
          disabled={!canPlace}
          onClick={onPlace}
          className="mt-3 w-full rounded-lg bg-[#B11226] py-3 text-xs font-black uppercase tracking-widest text-[#F2E3C6] transition hover:bg-[#E21B35] disabled:cursor-not-allowed disabled:opacity-40"
        >
          PLACE DEMO BET
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile trigger */}
      <div className="fixed bottom-0 left-0 right-0 z-[90] border-t border-[#2A1D19] bg-[#050505]/95 p-2 backdrop-blur lg:hidden">
        <button
          type="button"
          onClick={() => onMobileToggle(true)}
          className="flex w-full items-center justify-between rounded-xl border border-[#2A1D19] bg-[#15110F] px-4 py-3 text-left"
        >
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C9A45C]">Slip</span>
          <span className="font-mono text-sm text-[#F2E3C6]">
            {lines.length} pick{lines.length === 1 ? "" : "s"} · {Math.floor(potentialReturn)} ret.
          </span>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[190] flex flex-col justify-end bg-black/70 lg:hidden" role="presentation">
          <button type="button" className="absolute inset-0" aria-label="Close" onClick={() => onMobileToggle(false)} />
          <div className="relative z-10 max-h-[85vh] overflow-hidden rounded-t-2xl border border-[#2A1D19] bg-[#0D0D0D] shadow-2xl">{panelInner}</div>
        </div>
      )}

      {/* Desktop */}
      <aside className="sticky top-24 hidden h-fit max-h-[calc(100vh-7rem)] w-full max-w-[360px] shrink-0 overflow-hidden rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] lg:block">
        {panelInner}
      </aside>
    </>
  );
}
