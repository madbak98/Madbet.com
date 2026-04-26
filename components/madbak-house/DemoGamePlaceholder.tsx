"use client";

import { LayoutGrid, Hammer } from "lucide-react";

export function DemoGamePlaceholder({
  title,
  slug,
  onBackToCasino,
  onRequestBuild,
}: {
  title: string;
  slug: string;
  onBackToCasino: () => void;
  onRequestBuild: () => void;
}) {
  return (
    <div className="container mx-auto max-w-lg px-4 py-16 md:px-8">
      <div className="rounded-2xl border border-[#C9A45C]/35 bg-[#15110F] p-10 text-center shadow-[0_0_40px_rgba(177,18,38,0.12)]">
        <Hammer className="mx-auto mb-4 text-[#C9A45C]" size={40} strokeWidth={1.5} />
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#B11226]">Demo module</p>
        <h1 className="mt-2 font-display text-3xl font-black uppercase italic text-white">{title}</h1>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-[#BFAF91]">
          This demo game module is queued for build. No real-money play — portfolio roadmap only.
        </p>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-[#BFAF91]/60">{slug}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onBackToCasino}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#B11226] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#F2E3C6] transition hover:bg-[#E21B35]"
          >
            <LayoutGrid size={16} />
            Back to Casino
          </button>
          <button
            type="button"
            onClick={onRequestBuild}
            className="rounded-xl border-2 border-[#C9A45C]/50 bg-[#0D0D0D] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#C9A45C] transition hover:border-[#C9A45C]"
          >
            Request build
          </button>
        </div>
      </div>
    </div>
  );
}
