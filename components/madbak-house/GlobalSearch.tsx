"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
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

function sectionTitle(t: SearchResultItem["type"]) {
  if (t === "game") return "Games";
  if (t === "sport") return "Sports";
  return "Pages";
}

export function GlobalSearch({ setView, onSportsMatchFocus, onOpenAuth, isLoggedIn }: Props) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [searchIndex, setSearchIndex] = useState(() => buildSearchIndex(getAllMatches()));
  const wrapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsub = subscribeSports(() => {
      queueMicrotask(() => setSearchIndex(buildSearchIndex(getAllMatches())));
    });
    return unsub;
  }, []);

  const results = useMemo(() => filterSearchResults(searchIndex, q).slice(0, 36), [searchIndex, q]);
  const safeActive = results.length ? Math.min(active, results.length - 1) : 0;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const t = window.setTimeout(() => mobileInputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const go = useCallback(
    (item: SearchResultItem) => {
      if (item.action.kind === "view") {
        const v = item.action.view;
        const authWall =
          v.startsWith("game-") || ["wallet", "profile", "rewards", "verify", "security", "leaderboard"].includes(v);
        if (!isLoggedIn && authWall) {
          onOpenAuth();
          setOpen(false);
          setMobileOpen(false);
          return;
        }
      }
      navigateFromSearch(item, { setView, onSportsMatchFocus });
      setQ("");
      setOpen(false);
      setMobileOpen(false);
    },
    [isLoggedIn, onOpenAuth, onSportsMatchFocus, setView],
  );

  useEffect(() => {
    if (!open && !mobileOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setMobileOpen(false);
        return;
      }
      const listOpen = open && q.trim();
      const mobileList = mobileOpen && q.trim();
      if (!listOpen && !mobileList) return;
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
  }, [open, mobileOpen, q, results, safeActive, go]);

  const closeMobile = () => {
    setMobileOpen(false);
    setQ("");
    setOpen(false);
  };

  return (
    <>
      <div className="contents lg:hidden">
        <button
          type="button"
          className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-full border border-[#2A1D19] bg-[#15110F] text-[#BFAF91] hover:border-[#B11226] hover:text-[#F2E3C6]"
          aria-label="Open search"
          onClick={() => setMobileOpen(true)}
        >
          <Search size={20} />
        </button>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[120] flex max-h-[100dvh] flex-col bg-[#050505] lg:hidden" role="dialog" aria-modal="true" aria-label="Search">
          <div className="flex shrink-0 items-center gap-2 border-b border-[#2A1D19] px-3 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
            <Search className="shrink-0 text-[#BFAF91]" size={18} />
            <input
              ref={mobileInputRef}
              type="search"
              value={q}
              onChange={(e) => {
                const v = e.target.value;
                setQ(v);
                setActive(0);
              }}
              placeholder="Games, sports, pages…"
              className="min-h-[48px] flex-1 rounded-xl border border-[#2A1D19] bg-[#15110F] px-4 py-2 text-sm text-[#F2E3C6] placeholder:text-[#BFAF91]/50 focus:border-[#B11226] focus:outline-none"
              enterKeyHint="search"
            />
            <button
              type="button"
              className="flex min-h-[48px] min-w-[48px] shrink-0 items-center justify-center rounded-lg text-[#BFAF91] hover:bg-white/5 hover:text-[#F2E3C6]"
              aria-label="Close search"
              onClick={closeMobile}
            >
              <X size={22} />
            </button>
          </div>
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain px-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
            {!q.trim() ? (
              <p className="px-3 py-8 text-center text-sm text-[#BFAF91]">Type to search games, matches, and pages.</p>
            ) : results.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-[#BFAF91]">No results.</p>
            ) : (
              <ul className="py-3">
                {results.map((item, idx) => {
                  const showHead = idx === 0 || results[idx - 1]!.type !== item.type;
                  return (
                    <li key={item.id} className="list-none">
                      {showHead ? (
                        <h3 className="sticky top-0 z-[1] bg-[#050505] px-3 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#C9A45C]">{sectionTitle(item.type)}</h3>
                      ) : null}
                      <button
                        type="button"
                        onMouseEnter={() => setActive(idx)}
                        onClick={() => go(item)}
                        className={`flex w-full min-h-[48px] items-start gap-3 px-4 py-2.5 text-left transition ${
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
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      ) : null}

      <div ref={wrapRef} className="relative hidden max-w-md flex-1 lg:block">
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
          className="min-h-[44px] w-full rounded-full border border-[#2A1D19] bg-[#15110F] py-2 pl-10 pr-4 text-xs text-[#F2E3C6] transition focus:border-[#B11226] focus:outline-none"
        />
        {open && q.trim() ? (
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
                  className={`flex w-full min-h-[44px] items-start gap-3 px-4 py-2.5 text-left transition ${
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
        ) : null}
      </div>
    </>
  );
}
