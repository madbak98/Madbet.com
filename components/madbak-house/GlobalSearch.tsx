"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { buildSearchIndex, filterSearchResults, navigateFromSearch, type SearchResultItem } from "@/lib/search/globalSearchIndex";
import { getAllMatches, subscribeSports } from "@/lib/sports/sportsService";

type Props = {
  setView: (v: string) => void;
  onSportsMatchFocus: (matchId: string) => void;
  onOpenAuth: () => void;
  isLoggedIn: boolean;
};

function badge(t: SearchResultItem["type"]) {
  if (t === "game") return "border-[#B11226]/50 bg-[#3A0B10]/40 text-[#E21B35]";
  if (t === "sport") return "border-[#C9A45C]/40 bg-[#1a1810] text-[#C9A45C]";
  return "border-[#2A1D19] bg-[#0D0D0D] text-[#BFAF91]";
}

export function GlobalSearch({ setView, onSportsMatchFocus, onOpenAuth, isLoggedIn }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(getAllMatches()));
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeSports(() => {
      queueMicrotask(() => setSearchIndex(buildSearchIndex(getAllMatches())));
    });
    return unsub;
  }, []);

  const results = useMemo(() => filterSearchResults(searchIndex, q).slice(0, 24), [searchIndex, q]);
  const safeActive = results.length ? Math.min(active, results.length - 1) : 0;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const go = useCallback(
    (item: SearchResultItem) => {
      if (item.action.kind === "view") {
        const v = item.action.view;
        const authWall =
          v.startsWith("game-") || ["wallet", "profile", "rewards", "verify", "security", "leaderboard"].includes(v);
        if (!isLoggedIn && authWall) {
          onOpenAuth();
          setOpen(false);
          return;
        }
      }
      navigateFromSearch(item, { setView, onSportsMatchFocus });
      setQ("");
      setOpen(false);
    },
    [isLoggedIn, onOpenAuth, onSportsMatchFocus, setView],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, Math.max(0, results.length - 1)));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive((i) => Math.max(0, i - 1));
      }
      if (e.key === "Enter" && results[safeActive]) {
        e.preventDefault();
        go(results[safeActive]!);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, safeActive, go]);

  return (
    <div ref={wrapRef} className="relative w-full max-w-md flex-1">
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-[#BFAF91]" size={16} />
      <input
        ref={inputRef}
        type="text"
        value={q}
        onChange={(e) => {
          const v = e.target.value;
          setQ(v);
          setActive(0);
          setOpen(!!v.trim());
        }}
        onFocus={() => q.trim() && setOpen(true)}
        placeholder="Search games, matches, pages…"
        className="w-full rounded-full border border-[#2A1D19] bg-[#15110F] py-2 pl-10 pr-4 text-xs text-[#F2E3C6] transition focus:border-[#B11226] focus:outline-none"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-[min(70vh,420px)] overflow-y-auto rounded-xl border border-[#2A1D19] bg-[#0a0807] py-1 shadow-2xl">
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-[#BFAF91]">No results.</p>
          ) : (
            results.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseEnter={() => setActive(idx)}
                onClick={() => go(item)}
                className={`flex w-full items-start gap-3 px-4 py-2.5 text-left transition ${
                  idx === safeActive ? "bg-[#B11226]/25" : "hover:bg-[#B11226]/15"
                }`}
              >
                <span className={`mt-0.5 shrink-0 rounded border px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider ${badge(item.type)}`}>
                  {item.type}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-[#F2E3C6]">{item.title}</span>
                  <span className="block truncate text-[11px] text-[#BFAF91]">{item.subtitle}</span>
                </span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
