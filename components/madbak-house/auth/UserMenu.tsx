"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, User, Wallet, ShieldCheck, LogOut, Shield, LayoutDashboard } from "lucide-react";
import type { MadbakUser } from "@/lib/auth/types";
import { getVerificationLevel, verificationLevelLabel } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/madbak-format";

function badgeClasses(level: 0 | 1 | 2 | 3): string {
  if (level === 0) return "bg-[#2A1D19] text-[#BFAF91]";
  if (level === 1) return "bg-[#1a2d1a] text-[#7ddf8a] border border-[#2d5a2d]";
  if (level === 2) return "bg-[#2d2410] text-[#C9A45C] border border-[#5a4a20]";
  return "bg-[#3A0B10] text-[#F2E3C6] border border-[#B11226]";
}

export function UserMenu({
  user,
  balance,
  onNavigate,
  onLogout,
}: {
  user: MadbakUser;
  balance: number;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const level = getVerificationLevel(user, true);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const initial = user.username.slice(0, 2).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-[#2A1D19] bg-[#15110F] px-2 py-1.5 hover:border-[#B11226] transition-all"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B11226]/20 text-xs font-black text-[#F2E3C6]">
          {initial}
        </div>
        <div className="hidden text-left sm:block">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-black text-[#F2E3C6] leading-tight">{user.username}</span>
            {user.authProvider === "google" && (
              <span className="rounded border border-[#4285F4]/50 bg-[#F2E3C6]/10 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#F2E3C6]">
                Google
              </span>
            )}
            {user.authProvider === "apple" && (
              <span className="rounded border border-[#BFAF91]/40 bg-[#050505] px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#BFAF91]">
                Apple
              </span>
            )}
          </div>
          <div className="text-[9px] font-mono text-[#C9A45C]">{formatCurrency(balance)} DBAK</div>
        </div>
        <ChevronDown size={16} className={`text-[#BFAF91] transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[120] mt-2 w-56 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] py-2 shadow-xl">
          <div className="border-b border-[#2A1D19] px-3 pb-2">
            <span className={`inline-block rounded px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${badgeClasses(level)}`}>
              {verificationLevelLabel(level)}
            </span>
            {(user.authProvider === "google" || user.authProvider === "apple") && (
              <span className="mt-2 block text-[9px] font-black uppercase tracking-wider text-[#BFAF91]">
                Signed in with {user.authProvider === "google" ? "Google" : "Apple"}
              </span>
            )}
          </div>
          <MenuRow icon={User} label="Profile" onClick={() => { setOpen(false); onNavigate("profile"); }} />
          <MenuRow icon={Wallet} label="Wallet" onClick={() => { setOpen(false); onNavigate("wallet"); }} />
          <MenuRow icon={ShieldCheck} label="Verify account" onClick={() => { setOpen(false); onNavigate("verify"); }} />
          <MenuRow icon={Shield} label="Security" onClick={() => { setOpen(false); onNavigate("security"); }} />
          {user.role === "admin" && (
            <MenuRow icon={LayoutDashboard} label="Admin" onClick={() => { setOpen(false); onNavigate("admin"); }} />
          )}
          <div className="my-1 border-t border-[#2A1D19]" />
          <MenuRow
            icon={LogOut}
            label="Logout"
            danger
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          />
        </div>
      )}
    </div>
  );
}

function MenuRow({
  icon: Icon,
  label,
  onClick,
  danger,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-bold uppercase tracking-wide transition hover:bg-[#15110F] ${
        danger ? "text-[#E21B35]" : "text-[#BFAF91] hover:text-[#F2E3C6]"
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}
