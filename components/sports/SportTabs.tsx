"use client";

import type { MatchFilters, SportCategory, SportsbookTab } from "@/lib/sports/types";

const TABS: { id: SportsbookTab; label: string }[] = [
  { id: "live", label: "Live" },
  { id: "upcoming", label: "Upcoming" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "popular", label: "Popular" },
];

const SPORTS: { id: SportCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "football", label: "Football" },
  { id: "basketball", label: "Basketball" },
  { id: "tennis", label: "Tennis" },
  { id: "esports", label: "Esports" },
  { id: "mma", label: "MMA" },
  { id: "boxing", label: "Boxing" },
];

export function SportTabs({
  filters,
  onChange,
}: {
  filters: MatchFilters;
  onChange: (next: MatchFilters) => void;
}) {
  const tab = filters.tab ?? "popular";
  const sport = filters.sport ?? "all";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
        {SPORTS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onChange({ ...filters, sport: s.id })}
            className={`rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition ${
              sport === s.id
                ? "border-[#B11226] bg-[#3A0B10] text-[#F2E3C6]"
                : "border-[#2A1D19] bg-[#0D0D0D] text-[#BFAF91] hover:border-[#C9A45C]/40"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1 border-b border-[#2A1D19] pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange({ ...filters, tab: t.id })}
            className={`rounded-md px-3 py-1.5 text-[11px] font-black uppercase tracking-wide ${
              tab === t.id ? "bg-[#B11226] text-[#F2E3C6]" : "text-[#BFAF91] hover:text-[#F2E3C6]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
