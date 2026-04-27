"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import Matter from "matter-js";
import {
  LayoutGrid,
  Trophy,
  Gamepad2,
  Dices,
  Zap,
  ShieldCheck,
  User,
  Wallet,
  AlertTriangle,
  Coins,
  Bomb,
  Grid3X3,
  Disc,
  Gamepad,
  BarChart3,
  LayoutDashboard,
  Crown,
  Gem,
  Skull,
  Flame,
  X,
  LogIn,
  Sparkles,
  Tv,
  Mic2,
  FileText,
  CircleDot,
  ListOrdered,
  LifeBuoy,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { useAuthStore, useCurrentUser } from "@/store/useAuthStore";
import type { MadbakUser } from "@/lib/auth/types";
import { getVerificationLevel } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/madbak-format";
import { AuthModal } from "@/components/madbak-house/auth/AuthModal";
import { UserMenu } from "@/components/madbak-house/auth/UserMenu";
import { MadbakProfileView } from "@/components/madbak-house/profile/MadbakProfileView";
import { MadbakSecurityView } from "@/components/madbak-house/profile/MadbakSecurityView";
import { MadbakKycView } from "@/components/madbak-house/verify/MadbakKycView";
import { MadbakAdminDashboard } from "@/components/madbak-house/admin/MadbakAdminDashboard";
import { SportsbookPage } from "@/components/sports/SportsbookPage";
import { GlobalSearch } from "@/components/madbak-house/GlobalSearch";
import { SupportForm } from "@/components/support/SupportForm";

const COLORS = {
  bgMain: "#050505",
  bgSoft: "#0D0D0D",
  panel: "#15110F",
  panelBorder: "#2A1D19",
  red: "#B11226",
  redHot: "#E21B35",
  cream: "#F2E3C6",
  creamMuted: "#BFAF91",
  goldSoft: "#C9A45C",
  dangerDark: "#3A0B10",
} as const;

const GAMES = [
  { id: "crash", title: "CRASH", icon: Zap, category: "Originals", color: COLORS.red, rtp: "99.0%", players: 1243 },
  { id: "dice", title: "DICE", icon: Dices, category: "Originals", color: COLORS.cream, rtp: "98.5%", players: 840 },
  { id: "mines", title: "MINES", icon: Bomb, category: "Originals", color: COLORS.goldSoft, rtp: "97.0%", players: 612 },
  { id: "slots", title: "SLOTS", icon: LayoutGrid, category: "Slots", color: COLORS.redHot, rtp: "96.2%", players: 2105 },
  { id: "roulette", title: "ROULETTE", icon: Disc, category: "Table", color: COLORS.red, rtp: "97.3%", players: 450 },
  { id: "plinko", title: "PLINKO", icon: Grid3X3, category: "Originals", color: COLORS.cream, rtp: "98.0%", players: 733 },
  { id: "blackjack", title: "BLACKJACK", icon: Gamepad, category: "Card", color: COLORS.goldSoft, rtp: "99.5%", players: 312 },
  { id: "coinflip", title: "COINFLIP", icon: Coins, category: "Originals", color: COLORS.red, rtp: "98.0%", players: 156 },
  { id: "keno", title: "KENO", icon: Grid3X3, category: "Originals", color: COLORS.cream, rtp: "97.0%", players: 98 },
  { id: "baccarat", title: "BACCARAT", icon: Gamepad2, category: "Card", color: COLORS.redHot, rtp: "98.9%", players: 144 },
] as const;

const MOCK_BETS = [
  { user: "HiddenTiger", game: "Crash", amount: 450, multiplier: "2.40x", payout: 1080, time: "Just now" },
  { user: "Shadow_King", game: "Dice", amount: 1200, multiplier: "1.50x", payout: 1800, time: "2m ago" },
  { user: "Madbak_Elite", game: "Mines", amount: 50, multiplier: "12.5x", payout: 625, time: "3m ago" },
  { user: "CrimsonGhost", game: "Slots", amount: 100, multiplier: "0x", payout: 0, time: "5m ago" },
  { user: "Zenith", game: "Roulette", amount: 2500, multiplier: "2x", payout: 5000, time: "6m ago" },
];

type NotificationType = "success" | "error" | "info";
type NotificationPriority = "normal" | "big";

type Notification = {
  id: number;
  msg: string;
  type: NotificationType;
  duration: number;
  priority: NotificationPriority;
};

function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "red" | "outline" | "demo" }) {
  const styles: Record<string, string> = {
    default: "bg-[#2A1D19] text-[#BFAF91]",
    red: "bg-[#B11226] text-[#F2E3C6]",
    outline: "border border-[#2A1D19] text-[#BFAF91]",
    demo: "bg-[#3A0B10] border border-[#B11226] text-[#E21B35] text-[10px] tracking-widest font-bold",
  };
  return <span className={`px-2 py-0.5 rounded text-xs uppercase font-medium ${styles[variant]}`}>{children}</span>;
}

function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className = "",
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "outline" | "cream";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
}) {
  const base =
    "relative overflow-hidden transition-all duration-300 font-bold uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100";
  const variants: Record<string, string> = {
    primary: "bg-[#B11226] text-[#F2E3C6] hover:bg-[#E21B35] shadow-lg shadow-[#B11226]/20",
    secondary: "bg-[#15110F] text-[#F2E3C6] border border-[#2A1D19] hover:border-[#BFAF91]",
    ghost: "bg-transparent text-[#BFAF91] hover:text-[#F2E3C6]",
    outline: "border-2 border-[#B11226] text-[#B11226] hover:bg-[#B11226] hover:text-[#F2E3C6]",
    cream: "bg-[#F2E3C6] text-[#050505] hover:bg-white",
  };
  const sizes: Record<string, string> = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-10 py-4 text-base",
  };

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

function GameCard({ game, onPlay }: { game: (typeof GAMES)[number]; onPlay: (view: string) => void }) {
  const Icon = game.icon;
  return (
    <motion.div
      whileHover={{ y: -8 }}
      onClick={() => onPlay(`game-${game.id}`)}
      className="group cursor-pointer relative bg-[#15110F] border border-[#2A1D19] p-4 rounded-xl overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-t from-[#B11226]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-[#050505] border border-[#2A1D19] flex items-center justify-center mb-4 group-hover:border-[#B11226] transition-colors">
          <Icon size={24} color={game.color} />
        </div>
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-[#F2E3C6]">{game.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-[#BFAF91] uppercase tracking-tighter">RTP {game.rtp}</span>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-white/50">{game.players}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SidebarNavRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left transition-all ${
        active ? "border-l-4 border-[#B11226] bg-[#15110F] text-[#F2E3C6]" : "text-[#BFAF91] hover:bg-[#15110F] hover:text-[#F2E3C6]"
      }`}
    >
      <Icon size={18} />
      <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
    </button>
  );
}

function Sidebar({
  currentView,
  setView,
  showAdmin,
}: {
  currentView: string;
  setView: (v: string) => void;
  showAdmin: boolean;
}) {
  const platform = [
    { id: "home", label: "Home", icon: LayoutGrid },
    { id: "casino", label: "Casino", icon: Gamepad2 },
    { id: "sports", label: "Sportsbook", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: BarChart3 },
    { id: "rewards", label: "Rewards", icon: Crown },
    { id: "support", label: "Support", icon: LifeBuoy },
  ];
  const originals = [
    { id: "crash", label: "Crash", icon: Zap },
    { id: "dice", label: "Dice", icon: Dices },
    { id: "mines", label: "Mines", icon: Bomb },
    { id: "plinko", label: "Plinko", icon: Grid3X3 },
    { id: "coinflip", label: "Coinflip", icon: CircleDot },
    { id: "keno", label: "Keno", icon: ListOrdered },
  ];
  const tables = [
    { id: "roulette", label: "Roulette", icon: Disc },
    { id: "blackjack", label: "Blackjack", icon: Gamepad },
    { id: "baccarat", label: "Baccarat", icon: Gamepad2 },
  ];
  const slots = [
    { id: "slots", label: "Slots", icon: Gem },
    { id: "jackpot-slots", label: "Jackpot Slots", icon: Sparkles },
    { id: "classic-slots", label: "Classic Slots", icon: LayoutGrid },
  ];
  const liveDemo = [
    { id: "live-casino", label: "Live Casino", icon: Tv },
    { id: "game-shows", label: "Game Shows", icon: Mic2 },
  ];

  return (
    <aside className="custom-scrollbar fixed left-0 top-0 z-50 hidden h-full w-64 flex-col border-r border-[#2A1D19] bg-[#050505] md:flex">
      <div className="p-8 pb-4">
        <h1 className="flex items-center gap-2 font-display text-2xl font-black tracking-tighter text-[#F2E3C6]">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#B11226] font-black">M</div>
          MADBAK
        </h1>
        <p className="mt-1 text-[10px] font-bold tracking-widest text-[#B11226]">HOUSE OF DEMO</p>
      </div>

      <nav className="custom-scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <div>
          <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#BFAF91]">Platform</p>
          <div className="space-y-0.5">
            {platform.map((item) => (
              <SidebarNavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => setView(item.id)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#BFAF91]">Originals</p>
          <div className="space-y-0.5">
            {originals.map((item) => (
              <SidebarNavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === `game-${item.id}`}
                onClick={() => setView(`game-${item.id}`)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#BFAF91]">Table games</p>
          <div className="space-y-0.5">
            {tables.map((item) => (
              <SidebarNavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === `game-${item.id}`}
                onClick={() => setView(`game-${item.id}`)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#BFAF91]">Slots</p>
          <div className="space-y-0.5">
            {slots.map((item) => (
              <SidebarNavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === `game-${item.id}`}
                onClick={() => setView(`game-${item.id}`)}
              />
            ))}
          </div>
        </div>
        <div>
          <p className="mb-3 px-4 text-[10px] uppercase tracking-widest text-[#BFAF91]">Live demo</p>
          <div className="space-y-0.5">
            {liveDemo.map((item) => (
              <SidebarNavRow
                key={item.id}
                icon={item.icon}
                label={item.label}
                active={currentView === item.id}
                onClick={() => setView(item.id)}
              />
            ))}
          </div>
        </div>
      </nav>

      <div className="space-y-2 border-t border-[#2A1D19] p-4">
        {showAdmin && (
          <button
            type="button"
            onClick={() => setView("admin")}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-widest text-[#C9A45C] hover:bg-[#15110F]"
          >
            <LayoutDashboard size={14} />
            Admin
          </button>
        )}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setView("responsible-play")}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#BFAF91] transition-colors hover:text-[#B11226]"
          >
            <ShieldCheck size={14} />
            Responsible Play
          </button>
          <button
            type="button"
            onClick={() => setView("terms")}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#BFAF91] transition-colors hover:text-[#B11226]"
          >
            <FileText size={14} />
            Terms
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopNav({
  balance,
  setView,
  user,
  onOpenAuth,
  onLogout,
  onSportsMatchFocus,
}: {
  balance: number;
  setView: (v: string) => void;
  user: MadbakUser | null;
  onOpenAuth: (tab: "login" | "signup") => void;
  onLogout: () => void;
  onSportsMatchFocus: (matchId: string) => void;
}) {
  const level = user ? getVerificationLevel(user, true) : 0;

  return (
    <nav className="fixed left-0 right-0 top-0 z-40 flex min-h-20 flex-col gap-2 border-b border-[#2A1D19] bg-[#050505]/90 px-3 py-2 backdrop-blur-xl md:left-64 md:h-20 md:flex-row md:items-center md:justify-between md:px-8 md:py-0">
      <div className="flex w-full flex-1 flex-col md:max-w-xl md:pr-4">
        <GlobalSearch
          setView={setView}
          onSportsMatchFocus={onSportsMatchFocus}
          onOpenAuth={() => onOpenAuth("login")}
          isLoggedIn={!!user}
        />
      </div>

      <div className="flex w-full items-center justify-end gap-2 md:w-auto md:gap-4">
        <div className="hidden lg:flex flex-col items-end mr-1">
          <Badge variant="demo">DEMO MODE ACTIVE</Badge>
          <span className="text-[10px] text-[#BFAF91] mt-1 uppercase font-bold">Fake coins only</span>
        </div>

        {user && level > 0 && (
          <span className="hidden rounded border border-[#2A1D19] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#C9A45C] sm:inline">
            L{level}
          </span>
        )}

        <button
          type="button"
          onClick={() => setView("wallet")}
          className="cursor-pointer flex items-center gap-2 px-2 py-2 md:gap-3 md:px-3 bg-[#15110F] border border-[#2A1D19] rounded-lg hover:border-[#B11226] transition-all"
        >
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-[#BFAF91] uppercase font-bold leading-none">Balance</span>
            <span className="text-xs font-black text-[#F2E3C6] font-mono tracking-tighter md:text-sm">
              {user ? (
                <>
                  {formatCurrency(balance)} <span className="text-[#C9A45C]">DBAK</span>
                </>
              ) : (
                <span className="text-[#BFAF91]">—</span>
              )}
            </span>
          </div>
          <div className="w-8 h-8 bg-[#C9A45C]/10 rounded-full flex items-center justify-center text-[#C9A45C]">
            <Wallet size={16} />
          </div>
        </button>

        <div className="flex items-center gap-1 md:gap-2">
          {user ? (
            <UserMenu user={user} balance={balance} onNavigate={setView} onLogout={onLogout} />
          ) : (
            <>
              <button
                type="button"
                onClick={() => onOpenAuth("login")}
                className="flex items-center gap-1 rounded-lg border border-[#2A1D19] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#BFAF91] hover:border-[#B11226] hover:text-[#F2E3C6]"
              >
                <LogIn size={14} />
                Login
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth("signup")}
                className="rounded-lg bg-[#B11226] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#F2E3C6] hover:bg-[#E21B35]"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function BetPanel({
  onBet,
  balance,
  min = 1,
  max = 10000,
  isLoading = false,
  frozen = false,
  loadingLabel,
  betButtonLabel,
  betButtonExtraDisabled = false,
  footer,
}: {
  onBet: (amount: number) => void;
  balance: number;
  min?: number;
  max?: number;
  isLoading?: boolean;
  frozen?: boolean;
  loadingLabel?: string;
  betButtonLabel?: string;
  betButtonExtraDisabled?: boolean;
  footer?: React.ReactNode;
}) {
  const [amount, setAmount] = useState(100);
  const locked = isLoading || frozen;

  const handleAdjust = (factor: number) => {
    setAmount((prev) => {
      const next = factor === 0.5 ? prev / 2 : prev * 2;
      return Math.max(min, Math.min(balance, max, Math.floor(next)));
    });
  };

  return (
    <div className="bg-[#15110F] border border-[#2A1D19] p-6 rounded-2xl space-y-6">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <label className="text-[10px] uppercase font-black text-[#BFAF91] tracking-widest">Amount</label>
          <span className="text-[10px] text-white/30 font-mono">Min: {min}</span>
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            disabled={locked}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full bg-[#050505] border border-[#2A1D19] p-4 rounded-xl text-[#F2E3C6] font-mono text-lg focus:outline-none focus:border-[#B11226] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button type="button" disabled={locked} onClick={() => handleAdjust(0.5)} className="p-2 px-3 text-xs bg-[#15110F] border border-[#2A1D19] text-[#BFAF91] hover:text-white rounded-lg disabled:opacity-40">
              1/2
            </button>
            <button type="button" disabled={locked} onClick={() => handleAdjust(2)} className="p-2 px-3 text-xs bg-[#15110F] border border-[#2A1D19] text-[#BFAF91] hover:text-white rounded-lg disabled:opacity-40">
              2x
            </button>
            <button type="button" disabled={locked} onClick={() => setAmount(Math.min(balance, max))} className="p-2 px-3 text-xs bg-[#15110F] border border-[#2A1D19] text-[#BFAF91] hover:text-white rounded-lg disabled:opacity-40">
              MAX
            </button>
          </div>
        </div>
      </div>

      <Button
        className="w-full h-16 text-lg"
        onClick={() => onBet(amount)}
        disabled={locked || betButtonExtraDisabled || amount > balance || amount <= 0}
      >
        {isLoading ? (loadingLabel ?? "PLAYING...") : frozen ? "ROUND LIVE" : (betButtonLabel ?? "PLACE BET")}
      </Button>

      {footer ?? (
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-[#050505] border border-[#2A1D19] rounded-xl">
            <span className="block text-[8px] uppercase text-[#BFAF91] mb-1">Profit on win</span>
            <span className="text-sm font-black text-[#C9A45C]">+{(amount * 0.99).toFixed(2)}</span>
          </div>
          <div className="p-3 bg-[#050505] border border-[#2A1D19] rounded-xl">
            <span className="block text-[8px] uppercase text-[#BFAF91] mb-1">Risk Factor</span>
            <span className="text-sm font-black text-white">LOW</span>
          </div>
        </div>
      )}
    </div>
  );
}

type BJRank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";
type BJSuit = "hearts" | "diamonds" | "spades" | "clubs";

type BJCard = {
  id: string;
  rank: BJRank;
  suit: BJSuit;
  value: number;
};

const BJ_SUITS: BJSuit[] = ["hearts", "diamonds", "spades", "clubs"];
const BJ_RANKS: BJRank[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function rankToValue(rank: BJRank): number {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  if (rank === "10") return 10;
  return parseInt(rank, 10);
}

function createDeck(): BJCard[] {
  const deck: BJCard[] = [];
  let n = 0;
  for (const suit of BJ_SUITS) {
    for (const rank of BJ_RANKS) {
      deck.push({
        id: `c-${n++}`,
        rank,
        suit,
        value: rankToValue(rank),
      });
    }
  }
  return deck;
}

function shuffleDeck<T>(deck: T[]): T[] {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function drawCard(deck: BJCard[]): { card: BJCard; rest: BJCard[] } {
  const card = deck[0];
  const rest = deck.slice(1);
  return { card, rest };
}

function calculateHandValue(cards: BJCard[]): number {
  let sum = 0;
  let aces = 0;
  for (const c of cards) {
    if (c.rank === "A") {
      aces += 1;
      sum += 11;
    } else {
      sum += c.value;
    }
  }
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces -= 1;
  }
  return sum;
}

function isNaturalBlackjack(cards: BJCard[]): boolean {
  return cards.length === 2 && calculateHandValue(cards) === 21;
}

function isRedSuit(s: BJSuit): boolean {
  return s === "hearts" || s === "diamonds";
}

function suitSymbol(s: BJSuit): string {
  switch (s) {
    case "hearts":
      return "♥";
    case "diamonds":
      return "♦";
    case "spades":
      return "♠";
    default:
      return "♣";
  }
}

function BlackjackCardFace({ card, compact }: { card: BJCard; compact?: boolean }) {
  const red = isRedSuit(card.suit);
  const fg = red ? "text-[#E21B35]" : "text-[#F2E3C6]";
  const sym = suitSymbol(card.suit);
  return (
    <div
      className={`relative flex aspect-[2.5/3.5] min-h-[88px] w-[min(100%,112px)] flex-col rounded-xl border-2 border-[#C9A45C]/50 bg-[#0D0D0D] shadow-lg md:min-h-[104px] md:w-[120px] ${compact ? "min-h-[72px] md:min-h-[88px]" : ""}`}
    >
      <div className={`absolute left-1.5 top-1.5 text-xs font-black leading-none md:text-sm ${fg}`}>
        <div>{card.rank}</div>
        <div className="mt-0.5 text-[10px] md:text-xs">{sym}</div>
      </div>
      <div className={`flex flex-1 items-center justify-center text-3xl font-black md:text-4xl ${fg}`}>{sym}</div>
      <div className={`absolute bottom-1.5 right-1.5 rotate-180 text-xs font-black leading-none md:text-sm ${fg}`}>
        <div>{card.rank}</div>
        <div className="mt-0.5 text-[10px] md:text-xs">{sym}</div>
      </div>
    </div>
  );
}

function BlackjackCardBack({ compact }: { compact?: boolean }) {
  return (
    <div
      className={`relative flex aspect-[2.5/3.5] min-h-[88px] w-[min(100%,112px)] flex-col items-center justify-center rounded-xl border-2 border-[#B11226] bg-gradient-to-br from-[#2A1016] via-[#15110F] to-[#050505] shadow-[0_0_24px_rgba(177,18,38,0.35)] md:min-h-[104px] md:w-[120px] ${compact ? "min-h-[72px] md:min-h-[88px]" : ""}`}
    >
      <span className="font-display text-xl font-black italic text-[#B11226] md:text-2xl">M</span>
      <span className="mt-1 text-[8px] font-black uppercase tracking-[0.35em] text-[#BFAF91]">MADBAK</span>
    </div>
  );
}

function BlackjackGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  type Phase = "betting" | "playing" | "dealer" | "ended";
  type HandStatus = "active" | "stood" | "busted" | "blackjack" | "completed";
  type HandOutcome = "win" | "lose" | "push" | "blackjack";
  type PlayerHandState = {
    id: string;
    cards: BJCard[];
    bet: number;
    status: HandStatus;
    result: HandOutcome | null;
    payout: number;
    actions: number;
    splitAcesHand: boolean;
    naturalEligible: boolean;
  };

  const [phase, setPhase] = useState<Phase>("betting");
  const [deck, setDeck] = useState<BJCard[]>([]);
  const [playerHands, setPlayerHands] = useState<PlayerHandState[]>([]);
  const [activeHandIndex, setActiveHandIndex] = useState(0);
  const [dealerHand, setDealerHand] = useState<BJCard[]>([]);
  const [holeHidden, setHoleHidden] = useState(true);
  const [splitUsed, setSplitUsed] = useState(false);
  const [lastResult, setLastResult] = useState<string>("—");
  const [overlay, setOverlay] = useState<{ label: string; tone: "win" | "loss" | "push" | "bj" } | null>(null);
  const [betInput, setBetInput] = useState(100);
  const [lastSummary, setLastSummary] = useState<{
    label: string;
    payout: number;
    wager: number;
    net: number;
    hands: { hand: number; result: HandOutcome; payout: number; value: number }[];
  } | null>(null);
  type RecentRow = {
    id: string;
    result: HandOutcome;
    handLabel: string;
    bet: number;
    payout: number;
    playerVal: number;
    dealerVal: number;
  };
  const [recent, setRecent] = useState<RecentRow[]>([]);
  const dealerRunningRef = useRef(false);

  const roundLive = phase === "playing" || phase === "dealer";
  const totalStake = playerHands.reduce((sum, h) => sum + h.bet, 0);
  const activeHand = playerHands[activeHandIndex] ?? null;
  const activeHandVal = activeHand ? calculateHandValue(activeHand.cards) : 0;
  const dealerShownVal =
    dealerHand.length === 0
      ? 0
      : holeHidden
        ? calculateHandValue([dealerHand[0]])
        : calculateHandValue(dealerHand);

  const isTenValueCard = (c: BJCard) => c.value === 10;
  const splittable = (() => {
    if (!activeHand || activeHand.cards.length !== 2) return false;
    const [a, b] = activeHand.cards;
    return a.rank === b.rank || (isTenValueCard(a) && isTenValueCard(b));
  })();

  const canSplit =
    phase === "playing" &&
    !splitUsed &&
    activeHandIndex === 0 &&
    !!activeHand &&
    activeHand.cards.length === 2 &&
    activeHand.actions === 0 &&
    splittable &&
    balance >= activeHand.bet;

  const canDouble =
    phase === "playing" &&
    !!activeHand &&
    activeHand.status === "active" &&
    activeHand.actions === 0 &&
    activeHand.cards.length === 2 &&
    balance >= activeHand.bet &&
    activeHand.bet > 0 &&
    !activeHand.splitAcesHand;

  const canHit = phase === "playing" && !!activeHand && activeHand.status === "active" && !activeHand.splitAcesHand;

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  const appendRecent = (row: Omit<RecentRow, "id">) => {
    setRecent((prev) => [{ id: crypto.randomUUID(), ...row }, ...prev].slice(0, 8));
  };

  const handLabel = (idx: number, total: number) => (total > 1 ? `HAND ${idx + 1}` : "HAND");
  const activePlayableIndex = (hands: PlayerHandState[]) => hands.findIndex((h) => h.status === "active");

  const settleEndedRound = (finalHands: PlayerHandState[], finalDealerCards: BJCard[]) => {
    const dealerVal = calculateHandValue(finalDealerCards);
    let totalPayout = 0;
    let totalBet = 0;

    finalHands.forEach((h, idx) => {
      totalPayout += h.payout;
      totalBet += h.bet;
      appendRecent({
        result: h.result ?? "lose",
        handLabel: handLabel(idx, finalHands.length),
        bet: h.bet,
        payout: h.payout,
        playerVal: calculateHandValue(h.cards),
        dealerVal,
      });
    });

    const net = totalPayout - totalBet;
    const label = net > 0 ? "WIN" : net < 0 ? "LOSE" : "PUSH";
    const tone: "win" | "loss" | "push" | "bj" = label === "WIN" ? "win" : label === "LOSE" ? "loss" : "push";
    const detail = finalHands.map((h, i) => `${handLabel(i, finalHands.length)} ${h.result?.toUpperCase() ?? "LOSE"}`).join(" · ");

    setOverlay({ label: finalHands.length > 1 ? "ROUND COMPLETE" : label, tone });
    setLastResult(detail || label);
    setLastSummary({
      label,
      payout: totalPayout,
      wager: totalBet,
      net,
      hands: finalHands.map((h, i) => ({
        hand: i + 1,
        result: h.result ?? "lose",
        payout: h.payout,
        value: calculateHandValue(h.cards),
      })),
    });

    if (net > 0) onNotify(`+${Math.floor(net)} DBAK total`, "success", 1400, net >= 500 ? "big" : "normal");
    else if (net < 0) onNotify("Round lost", "error", 1200, "normal");
    else onNotify("Push round", "info", 1100, "normal");

    setPlayerHands(finalHands.map((h) => ({ ...h, status: "completed" })));
    setPhase("ended");
  };

  const runDealerAndResolve = async (handsStart: PlayerHandState[], dStart: BJCard[], deckStart: BJCard[]) => {
    if (dealerRunningRef.current) return;
    dealerRunningRef.current = true;
    setPhase("dealer");
    setHoleHidden(false);
    await sleep(420);

    let d = [...dStart];
    let dk = [...deckStart];
    while (calculateHandValue(d) < 17) {
      const { card, rest } = drawCard(dk);
      dk = rest;
      d = [...d, card];
      setDeck(dk);
      setDealerHand(d);
      await sleep(480);
    }

    const dealerVal = calculateHandValue(d);
    const settled = handsStart.map((h) => {
      if (h.status === "busted") {
        return { ...h, result: "lose" as HandOutcome, payout: 0, status: "completed" as HandStatus };
      }
      const pv = calculateHandValue(h.cards);
      if (dealerVal > 21 || pv > dealerVal) {
        const payout = h.bet * 2;
        onResult(payout);
        return { ...h, result: "win" as HandOutcome, payout, status: "completed" as HandStatus };
      }
      if (pv < dealerVal) {
        return { ...h, result: "lose" as HandOutcome, payout: 0, status: "completed" as HandStatus };
      }
      onResult(h.bet);
      return { ...h, result: "push" as HandOutcome, payout: h.bet, status: "completed" as HandStatus };
    });

    setDeck(dk);
    settleEndedRound(settled, d);
    dealerRunningRef.current = false;
  };

  const applyHandsProgress = (nextHands: PlayerHandState[], nextDeck: BJCard[]) => {
    setPlayerHands(nextHands);
    setDeck(nextDeck);
    const nxtIdx = activePlayableIndex(nextHands);
    if (nxtIdx >= 0) {
      setActiveHandIndex(nxtIdx);
      setPhase("playing");
      return;
    }
    void runDealerAndResolve(nextHands, dealerHand, nextDeck);
  };

  const startRound = (amount: number) => {
    if (phase !== "betting" || amount > balance || amount <= 0) return;
    setLastSummary(null);
    onResult(-amount);
    setSplitUsed(false);
    setActiveHandIndex(0);
    setOverlay(null);
    setHoleHidden(true);

    let d = shuffleDeck(createDeck());
    const { card: p1, rest: r1 } = drawCard(d);
    const { card: p2, rest: r2 } = drawCard(r1);
    const { card: d1, rest: r3 } = drawCard(r2);
    const { card: d2, rest: r4 } = drawCard(r3);
    d = r4;

    const pH = [p1, p2];
    const dH = [d1, d2];

    setDeck(d);
    setDealerHand(dH);
    const initialHand: PlayerHandState = {
      id: crypto.randomUUID(),
      cards: pH,
      bet: amount,
      status: "active",
      result: null,
      payout: 0,
      actions: 0,
      splitAcesHand: false,
      naturalEligible: true,
    };
    setPlayerHands([initialHand]);

    if (isNaturalBlackjack(pH)) {
      setHoleHidden(false);
      if (isNaturalBlackjack(dH)) {
        onResult(amount);
        setOverlay({ label: "PUSH", tone: "push" });
        setLastResult("Push (both blackjack)");
        appendRecent({
          result: "push",
          handLabel: "HAND",
          bet: amount,
          payout: amount,
          playerVal: 21,
          dealerVal: 21,
        });
        onNotify("Push — both blackjack", "info", 1200, "normal");
        setLastSummary({
          label: "PUSH",
          payout: amount,
          wager: amount,
          net: 0,
          hands: [{ hand: 1, result: "push", payout: amount, value: 21 }],
        });
        setPlayerHands([{ ...initialHand, status: "completed", result: "push", payout: amount }]);
        setPhase("ended");
        return;
      }
      const pay = Math.floor(2.5 * amount);
      onResult(pay);
      setOverlay({ label: "BLACKJACK", tone: "bj" });
      setLastResult("Blackjack!");
      appendRecent({
        result: "blackjack",
        handLabel: "HAND",
        bet: amount,
        payout: pay,
        playerVal: 21,
        dealerVal: calculateHandValue(dH),
      });
      setLastSummary({
        label: "BLACKJACK",
        payout: pay,
        wager: amount,
        net: pay - amount,
        hands: [{ hand: 1, result: "blackjack", payout: pay, value: 21 }],
      });
      setPlayerHands([{ ...initialHand, status: "completed", result: "blackjack", payout: pay }]);
      onNotify("BLACKJACK!", "success", 2400, "big");
      setPhase("ended");
      return;
    }

    setPhase("playing");
  };

  const hit = () => {
    if (!canHit || !activeHand) return;
    const { card, rest } = drawCard(deck);
    const nextHands = playerHands.map((h, idx) => {
      if (idx !== activeHandIndex) return h;
      const cards = [...h.cards, card];
      const busted = calculateHandValue(cards) > 21;
      return {
        ...h,
        cards,
        actions: h.actions + 1,
        status: (busted ? "busted" : "active") as HandStatus,
      };
    });
    applyHandsProgress(nextHands, rest);
  };

  const stand = () => {
    if (phase !== "playing" || !activeHand || activeHand.status !== "active") return;
    const nextHands = playerHands.map((h, idx) => (idx === activeHandIndex ? { ...h, status: "stood" as HandStatus } : h));
    applyHandsProgress(nextHands, deck);
  };

  const doubleDown = () => {
    if (!canDouble || !activeHand) return;
    onResult(-activeHand.bet);
    const { card, rest } = drawCard(deck);
    const nextHands = playerHands.map((h, idx) => {
      if (idx !== activeHandIndex) return h;
      const bet = h.bet * 2;
      const cards = [...h.cards, card];
      const busted = calculateHandValue(cards) > 21;
      return {
        ...h,
        bet,
        cards,
        actions: h.actions + 1,
        status: (busted ? "busted" : "stood") as HandStatus,
      };
    });
    applyHandsProgress(nextHands, rest);
  };

  const splitHand = () => {
    if (!canSplit || !activeHand) return;
    const [first, second] = activeHand.cards;
    const { card: draw1, rest: r1 } = drawCard(deck);
    const { card: draw2, rest: r2 } = drawCard(r1);
    const splitAces = first.rank === "A" && second.rank === "A";

    onResult(-activeHand.bet);
    const hand1: PlayerHandState = {
      id: crypto.randomUUID(),
      cards: [first, draw1],
      bet: activeHand.bet,
      status: splitAces ? "stood" : "active",
      result: null,
      payout: 0,
      actions: 0,
      splitAcesHand: splitAces,
      naturalEligible: false,
    };
    const hand2: PlayerHandState = {
      id: crypto.randomUUID(),
      cards: [second, draw2],
      bet: activeHand.bet,
      status: splitAces ? "stood" : "active",
      result: null,
      payout: 0,
      actions: 0,
      splitAcesHand: splitAces,
      naturalEligible: false,
    };
    const nextHands = [hand1, hand2];
    setSplitUsed(true);
    setPlayerHands(nextHands);
    setDeck(r2);
    setActiveHandIndex(0);
    if (splitAces) {
      void runDealerAndResolve(nextHands, dealerHand, r2);
      return;
    }
  };

  const newRound = () => {
    setPhase("betting");
    setPlayerHands([]);
    setActiveHandIndex(0);
    setDealerHand([]);
    setDeck([]);
    setSplitUsed(false);
    setHoleHidden(true);
    setOverlay(null);
    setLastSummary(null);
    dealerRunningRef.current = false;
    setBetInput((prev) => Math.max(betMin, Math.min(balance, betMax, Number.isFinite(prev) ? prev : betMin)));
  };

  const overlayClass =
    overlay?.tone === "win"
      ? "border-[#C9A45C] shadow-[0_0_40px_rgba(201,164,92,0.35)]"
      : overlay?.tone === "bj"
        ? "border-[#C9A45C] shadow-[0_0_48px_rgba(201,164,92,0.45)]"
        : overlay?.tone === "loss"
          ? "border-[#B11226] shadow-[0_0_36px_rgba(177,18,38,0.35)]"
          : "border-[#BFAF91]/40";

  const dealerStatText =
    dealerHand.length === 0 ? "—" : holeHidden ? `Visible: ${dealerShownVal}` : String(dealerShownVal);

  const guidance = useMemo(() => {
    if (phase === "betting") return "Choose your stake and deal a hand.";
    if (phase === "ended") return "Start a new hand or change your bet.";
    if (phase === "dealer") return "Dealer is drawing…";
    if (phase === "playing") {
      if (activeHandVal <= 11) return "Safe to hit.";
      if (activeHandVal <= 16) return "Risk zone.";
      return "Strong hand — consider standing.";
    }
    return "";
  }, [phase, activeHandVal]);

  const betMin = 1;
  const betMax = 10000;

  const adjustBet = (factor: number) => {
    setBetInput((prev) => {
      const next = factor === 0.5 ? prev / 2 : prev * 2;
      return Math.max(betMin, Math.min(balance, betMax, Math.floor(next)));
    });
  };

  const dealDisabled = phase !== "betting" || betInput > balance || betInput <= 0;

  return (
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(360px,420px)_1fr] lg:items-start lg:gap-6">
      {/* Blackjack control panel — replaces generic BetPanel for clearer single action zone */}
      <aside className="order-1 z-20 w-full max-lg:sticky max-lg:bottom-0 max-lg:rounded-t-2xl max-lg:border max-lg:border-[#2A1D19] max-lg:bg-[#050505]/95 max-lg:backdrop-blur-md max-lg:p-3 max-lg:shadow-[0_-8px_32px_rgba(0,0,0,0.5)] max-lg:pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:max-w-[420px]">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-5">
          {phase === "betting" && (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Stake</label>
                <input
                  type="number"
                  value={betInput}
                  onChange={(e) => setBetInput(Number(e.target.value))}
                  className="w-full rounded-xl border border-[#2A1D19] bg-[#050505] p-4 font-mono text-lg text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                  min={betMin}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => adjustBet(0.5)}
                    className="flex-1 rounded-lg border border-[#2A1D19] bg-[#15110F] py-2 text-xs font-bold text-[#BFAF91] hover:text-[#F2E3C6]"
                  >
                    1/2
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustBet(2)}
                    className="flex-1 rounded-lg border border-[#2A1D19] bg-[#15110F] py-2 text-xs font-bold text-[#BFAF91] hover:text-[#F2E3C6]"
                  >
                    2x
                  </button>
                  <button
                    type="button"
                    onClick={() => setBetInput(Math.min(balance, betMax))}
                    className="flex-1 rounded-lg border border-[#2A1D19] bg-[#15110F] py-2 text-xs font-bold text-[#BFAF91] hover:text-[#F2E3C6]"
                  >
                    MAX
                  </button>
                </div>
              </div>
              <p className="mt-3 text-[10px] leading-relaxed text-[#BFAF91]">
                Win 2× return · Blackjack 2.5× (natural only) · Push refunds stake. Dealer draws to 17. Split once max.
              </p>
              <Button className="mt-4 h-14 w-full text-base" disabled={dealDisabled} onClick={() => startRound(betInput)}>
                DEAL HAND
              </Button>
            </>
          )}

          {(phase === "playing" || phase === "dealer") && (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-[#C9A45C]">
                {phase === "dealer" ? "DEALER'S TURN" : "YOUR MOVE"}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] text-[#BFAF91]">
                <div className="rounded-lg border border-[#2A1D19] bg-[#050505] px-2 py-2">
                  <span className="font-black uppercase tracking-widest">Bet</span>
                  <p className="font-mono text-base font-black text-[#F2E3C6]">{activeHand?.bet ?? 0}</p>
                </div>
                <div className="rounded-lg border border-[#2A1D19] bg-[#050505] px-2 py-2">
                  <span className="font-black uppercase tracking-widest">{splitUsed ? "Active hand" : "Your total"}</span>
                  <p className="font-mono text-base font-black text-[#C9A45C]">{activeHand ? activeHandVal : "—"}</p>
                </div>
                <div className="col-span-2 rounded-lg border border-[#2A1D19] bg-[#050505] px-2 py-2">
                  <span className="font-black uppercase tracking-widest">Dealer visible</span>
                  <p className="font-mono text-base font-black text-[#F2E3C6]">{dealerStatText}</p>
                </div>
                {splitUsed && (
                  <div className="col-span-2 rounded-lg border border-[#2A1D19] bg-[#050505] px-2 py-2">
                    <span className="font-black uppercase tracking-widest">Turn</span>
                    <p className="text-xs font-black uppercase text-[#C9A45C]">Playing Hand {activeHandIndex + 1}</p>
                  </div>
                )}
              </div>
              {phase === "playing" && (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="primary" className="min-h-[52px] w-full text-sm" onClick={hit} disabled={!canHit}>
                      HIT
                    </Button>
                    <Button variant="cream" className="min-h-[52px] w-full text-sm" onClick={stand} disabled={!activeHand || activeHand.status !== "active"}>
                      STAND
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={!canDouble}
                      onClick={doubleDown}
                      className="w-full rounded-xl border-2 border-[#C9A45C]/50 bg-[#0D0D0D] py-3 text-xs font-black uppercase tracking-wider text-[#C9A45C] transition enabled:hover:border-[#C9A45C] enabled:hover:bg-[#15110F] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      DOUBLE
                    </button>
                    {canSplit ? (
                      <button
                        type="button"
                        onClick={splitHand}
                        className="w-full rounded-xl border-2 border-[#C9A45C]/50 bg-[#0D0D0D] py-3 text-xs font-black uppercase tracking-wider text-[#C9A45C] transition hover:border-[#C9A45C] hover:bg-[#15110F]"
                      >
                        SPLIT
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {phase === "ended" && lastSummary && (
            <>
              <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Result</p>
              <p className="mt-1 font-display text-2xl font-black uppercase italic text-[#F2E3C6]">{lastSummary.label}</p>
              <div className="mt-3 space-y-1 font-mono text-xs text-[#BFAF91]">
                <p>
                  Total payout:{" "}
                  <span className={lastSummary.payout > 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>{lastSummary.payout}</span>{" "}
                  DBAK
                </p>
                <p>
                  Total bet: <span className="text-[#F2E3C6]">{lastSummary.wager}</span> DBAK
                </p>
                <p>
                  Net result:{" "}
                  <span className={lastSummary.net > 0 ? "text-[#C9A45C]" : lastSummary.net < 0 ? "text-[#E21B35]" : "text-[#BFAF91]"}>
                    {lastSummary.net > 0 ? "+" : ""}
                    {lastSummary.net}
                  </span>{" "}
                  DBAK
                </p>
                {lastSummary.hands.map((h) => (
                  <p key={h.hand} className="text-[11px]">
                    HAND {h.hand}:{" "}
                    <span className="uppercase text-[#F2E3C6]">{h.result}</span>{" "}
                    <span className={h.payout > 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>+{h.payout}</span>
                  </p>
                ))}
              </div>
              <Button variant="primary" className="mt-5 h-12 w-full" onClick={newRound}>
                NEW HAND
              </Button>
              <Button variant="secondary" className="mt-2 h-10 w-full text-xs" onClick={newRound}>
                CHANGE BET
              </Button>
            </>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge variant="demo">DEMO MODE — FAKE COINS ONLY</Badge>
        </div>
        <p className="mt-2 text-[10px] text-[#BFAF91]/85">{guidance}</p>
        <p className="mt-1 text-[9px] uppercase tracking-wide text-[#BFAF91]/60">Client-side blackjack simulation. No real money.</p>
      </aside>

      <div className="order-2 min-w-0 space-y-3 lg:order-2">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="rounded-lg border border-[#2A1D19] bg-[#15110F] px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Current bet</span>
            <p className="font-mono text-lg font-black text-[#F2E3C6]">{roundLive || phase === "ended" ? totalStake : 0}</p>
          </div>
          <div className="rounded-lg border border-[#2A1D19] bg-[#15110F] px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Dealer value</span>
            <p className="font-mono text-lg font-black text-[#C9A45C]">{dealerStatText}</p>
          </div>
          <div
            className={`rounded-lg border px-3 py-2 ${
              phase === "playing" && activeHand
                ? "border-[#C9A45C]/50 bg-[#1a1810] shadow-[0_0_20px_rgba(201,164,92,0.12)]"
                : "border-[#2A1D19] bg-[#15110F]"
            }`}
          >
            <span className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Player value</span>
            <p className="font-mono text-lg font-black text-[#F2E3C6]">{activeHand ? activeHandVal : "—"}</p>
          </div>
          <div className="rounded-lg border border-[#2A1D19] bg-[#15110F] px-3 py-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Last result</span>
            <p className="truncate text-xs font-black uppercase text-[#F2E3C6]">{lastResult}</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] border-2 border-[#C9A45C]/30 bg-gradient-to-b from-[#12100e] via-[#0a0807] to-[#050505] px-3 py-6 shadow-inner md:px-8 md:py-10">
          <div className="pointer-events-none absolute inset-0 rounded-[2rem] border border-[#2A1D19]/80" />
          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BFAF91]">Dealer</span>
            {phase === "dealer" && (
              <span className="rounded-full border border-[#B11226]/50 bg-[#3A0B10]/40 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#E21B35] animate-pulse">
                Dealer turn
              </span>
            )}
          </div>
          <div
            className={`mb-2 flex min-h-[100px] flex-wrap justify-center gap-2 rounded-2xl py-1 md:gap-3 ${
              phase === "dealer"
                ? "animate-pulse shadow-[0_0_24px_rgba(177,18,38,0.25),0_0_12px_rgba(201,164,92,0.12)] ring-1 ring-[#B11226]/40"
                : ""
            }`}
          >
            <AnimatePresence mode="popLayout">
              {dealerHand.map((c, i) => (
                <div key={c.id} className="flex flex-col items-center gap-1">
                  <motion.div
                    layout
                    initial={{ opacity: 0, y: -16, rotate: -4 }}
                    animate={{ opacity: 1, y: 0, rotate: 0 }}
                    transition={{ type: "spring", damping: 22, stiffness: 320 }}
                  >
                    {i === 1 && holeHidden ? <BlackjackCardBack /> : <BlackjackCardFace card={c} />}
                  </motion.div>
                  {i === 1 && holeHidden && (
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#BFAF91]/80">Hidden card</span>
                  )}
                </div>
              ))}
            </AnimatePresence>
          </div>

          <div className="mx-auto my-3 h-px max-w-md bg-gradient-to-r from-transparent via-[#C9A45C]/40 to-transparent" />

          <div className="mb-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.35em] text-[#BFAF91]">{splitUsed ? "Your hands" : "Your hand"}</span>
            {phase === "playing" && (
              <span className="rounded-full border border-[#C9A45C]/40 bg-[#1a1810] px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-[#C9A45C]">
                {splitUsed ? `Playing Hand ${activeHandIndex + 1}` : "Your turn"}
              </span>
            )}
          </div>
          <div className={`mb-4 grid min-h-[100px] gap-3 ${splitUsed ? "md:grid-cols-2" : "grid-cols-1"}`}>
            {playerHands.map((hand, handIdx) => (
              <div
                key={hand.id}
                className={`rounded-2xl border px-3 py-2 ${
                  phase === "playing" && handIdx === activeHandIndex ? "border-[#F2E3C6]/35 ring-1 ring-[#F2E3C6]/25 shadow-[inset_0_0_24px_rgba(242,227,198,0.06)]" : "border-[#2A1D19]"
                }`}
              >
                <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">
                  {handLabel(handIdx, playerHands.length)} · Bet {hand.bet} · Value {calculateHandValue(hand.cards)}
                </p>
                <div className="flex min-h-[96px] flex-wrap justify-center gap-2">
                  <AnimatePresence mode="popLayout">
                    {hand.cards.map((c) => (
                      <motion.div
                        key={c.id}
                        layout
                        initial={{ opacity: 0, y: 16, rotate: 4 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ type: "spring", damping: 22, stiffness: 320 }}
                      >
                        <BlackjackCardFace card={c} compact={splitUsed} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {overlay && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`pointer-events-none absolute inset-0 flex items-center justify-center rounded-[2rem] border-2 bg-[#050505]/88 backdrop-blur-sm ${overlayClass}`}
              >
                <span className="font-display text-4xl font-black italic tracking-tighter text-[#F2E3C6] md:text-6xl">{overlay.label}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="rounded-lg border border-[#2A1D19] bg-[#15110F] px-3 py-2">
          <h3 className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Recent hands</h3>
          {recent.length === 0 ? (
            <p className="mt-1 text-[10px] text-[#BFAF91]">No rounds yet.</p>
          ) : (
            <ul className="mt-1 max-h-28 space-y-1 overflow-y-auto text-[10px]">
              {recent.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-1 rounded border border-[#1f1613] bg-[#0D0D0D] px-1.5 py-1 font-mono text-[#F2E3C6]"
                >
                  <span className="uppercase text-[#BFAF91]">{r.result}</span>
                  <span className="text-[#BFAF91]">{r.handLabel}</span>
                  <span className="text-[#BFAF91]">{r.bet}</span>
                  <span className={r.payout > 0 ? "text-[#C9A45C]" : r.payout < 0 ? "text-[#E21B35]" : "text-[#BFAF91]"}>
                    Δ{r.payout}
                  </span>
                  <span className="text-[9px] text-[#BFAF91]/80">
                    P{r.playerVal}/D{r.dealerVal}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

type RouletteBetType = "straight" | "red" | "black" | "odd" | "even" | "low" | "high" | "dozen" | "column";
type RouletteNumberColor = "red" | "black" | "green";
type RouletteBet = {
  id: string;
  type: RouletteBetType;
  label: string;
  amount: number;
  value: number | string;
};
type RouletteSpinRow = {
  id: string;
  result: number;
  color: RouletteNumberColor;
  totalBet: number;
  payout: number;
  net: number;
  at: string;
};
type RouletteLastSpin = {
  winningNumber: number;
  color: RouletteNumberColor;
  totalBet: number;
  totalPayout: number;
  net: number;
};

type SlotSymbolId = "SKULL" | "CROWN" | "DIAMOND" | "CHERRY" | "SEVEN" | "COIN" | "BAR" | "WILD" | "SCATTER";
type SlotSymbol = {
  id: SlotSymbolId;
  name: string;
  glyph: string;
  weight: number;
  payouts: Partial<Record<3 | 4 | 5, number>>;
};
type SlotLineWin = { lineIndex: number; symbol: SlotSymbolId; count: number; multiplier: number; win: number };
type SlotSpinRow = { id: string; win: number; totalBet: number; lines: number; symbols: string; at: string };

const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: "SKULL", name: "Skull", glyph: "SK", weight: 4, payouts: { 3: 5, 4: 15, 5: 50 } },
  { id: "CROWN", name: "Crown", glyph: "CR", weight: 6, payouts: { 3: 4, 4: 10, 5: 30 } },
  { id: "DIAMOND", name: "Diamond", glyph: "DI", weight: 7, payouts: { 3: 3, 4: 8, 5: 20 } },
  { id: "CHERRY", name: "Cherry", glyph: "CH", weight: 12, payouts: { 3: 1, 4: 3, 5: 8 } },
  { id: "SEVEN", name: "Seven", glyph: "77", weight: 9, payouts: { 3: 2, 4: 6, 5: 15 } },
  { id: "COIN", name: "Coin", glyph: "CO", weight: 14, payouts: { 3: 1, 4: 2, 5: 6 } },
  { id: "BAR", name: "Bar", glyph: "BA", weight: 13, payouts: { 3: 1, 4: 2, 5: 5 } },
  { id: "WILD", name: "Wild", glyph: "WI", weight: 5, payouts: { 3: 6, 4: 16, 5: 60 } },
  { id: "SCATTER", name: "Scatter", glyph: "SC", weight: 3, payouts: { 3: 2, 4: 5, 5: 20 } },
];

const SLOT_PAYLINES: number[][] = [
  [1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0],
  [2, 2, 2, 2, 2],
  [0, 1, 2, 1, 0],
  [2, 1, 0, 1, 2],
  [0, 0, 1, 0, 0],
  [2, 2, 1, 2, 2],
  [1, 0, 1, 2, 1],
  [1, 2, 1, 0, 1],
  [0, 1, 1, 1, 0],
  [2, 1, 1, 1, 2],
  [1, 1, 0, 1, 1],
  [1, 1, 2, 1, 1],
  [0, 1, 0, 1, 0],
  [2, 1, 2, 1, 2],
  [0, 2, 0, 2, 0],
  [2, 0, 2, 0, 2],
  [1, 0, 2, 0, 1],
  [1, 2, 0, 2, 1],
  [0, 2, 1, 2, 0],
];

function weightedPickSymbol(): SlotSymbol {
  const total = SLOT_SYMBOLS.reduce((sum, s) => sum + s.weight, 0);
  let r = Math.random() * total;
  for (const sym of SLOT_SYMBOLS) {
    r -= sym.weight;
    if (r <= 0) return sym;
  }
  return SLOT_SYMBOLS[0]!;
}

function generateSlotGrid(): SlotSymbolId[][] {
  const cols: SlotSymbolId[][] = [];
  for (let c = 0; c < 5; c++) {
    const col: SlotSymbolId[] = [];
    for (let r = 0; r < 3; r++) col.push(weightedPickSymbol().id);
    cols.push(col);
  }
  return cols;
}

function evaluateSlotLines(grid: SlotSymbolId[][], lines: number, betPerLine: number): { wins: SlotLineWin[]; totalPayout: number } {
  const wins: SlotLineWin[] = [];
  for (let i = 0; i < Math.min(lines, SLOT_PAYLINES.length); i++) {
    const path = SLOT_PAYLINES[i]!;
    const lineSymbols = path.map((row, col) => grid[col]![row]!) as SlotSymbolId[];
    let base: SlotSymbolId | null = null;
    let count = 0;
    for (const sym of lineSymbols) {
      if (sym === "SCATTER") break;
      if (!base) {
        if (sym === "WILD") {
          count += 1;
          continue;
        }
        base = sym;
        count += 1;
        continue;
      }
      if (sym === base || sym === "WILD") {
        count += 1;
      } else {
        break;
      }
    }
    const resolved = base ?? (lineSymbols[0] === "WILD" ? "WILD" : null);
    if (!resolved || count < 3) continue;
    const def = SLOT_SYMBOLS.find((s) => s.id === resolved);
    const mult = def?.payouts[count as 3 | 4 | 5] ?? 0;
    if (mult <= 0) continue;
    wins.push({ lineIndex: i + 1, symbol: resolved, count, multiplier: mult, win: betPerLine * mult });
  }
  const totalPayout = wins.reduce((sum, w) => sum + w.win, 0);
  return { wins, totalPayout };
}

function SlotsGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betInput, setBetInput] = useState(10);
  const [lines, setLines] = useState(20);
  const [grid, setGrid] = useState<SlotSymbolId[][]>(() => generateSlotGrid());
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuto, setIsAuto] = useState(false);
  const [spinTick, setSpinTick] = useState(0);
  const [stoppedReels, setStoppedReels] = useState(5);
  const [lastWin, setLastWin] = useState(0);
  const [lineWins, setLineWins] = useState<SlotLineWin[]>([]);
  const [recent, setRecent] = useState<SlotSpinRow[]>([]);
  const hasSettledRef = useRef(false);
  const autoTimerRef = useRef<number | null>(null);

  const totalBet = Math.max(0, Math.floor(betInput)) * Math.max(1, lines);
  const betPerLine = lines > 0 ? totalBet / lines : 0;
  const bigWin = lastWin >= 500;
  const jackpotWin = lastWin >= 3000;

  const previewSymbolForReel = (col: number, row: number): SlotSymbolId => {
    const idx = (spinTick + col * 7 + row * 3) % SLOT_SYMBOLS.length;
    return SLOT_SYMBOLS[idx]!.id;
  };

  const spin = useCallback(() => {
    if (isSpinning) return;
    if (totalBet <= 0) {
      onNotify("Set a valid bet amount", "error", 1000, "normal");
      return;
    }
    if (totalBet > balance) {
      onNotify("Insufficient balance", "error", 1000, "normal");
      return;
    }
    hasSettledRef.current = false;
    setIsSpinning(true);
    setStoppedReels(0);
    setLineWins([]);
    setLastWin(0);
    onResult(-totalBet);

    const nextGrid = generateSlotGrid();
    const timers: number[] = [];
    for (let c = 0; c < 5; c++) {
      timers.push(window.setTimeout(() => setStoppedReels(c + 1), 1200 + c * 180));
    }
    timers.push(
      window.setTimeout(() => {
        if (hasSettledRef.current) return;
        hasSettledRef.current = true;
        setGrid(nextGrid);
        const evalRes = evaluateSlotLines(nextGrid, lines, betPerLine);
        const payout = Math.floor(evalRes.totalPayout);
        setLineWins(evalRes.wins);
        setLastWin(payout);
        if (payout > 0) {
          onResult(payout);
          if (payout >= 500) onNotify(`BIG WIN +${payout} DBAK`, "success", 2200, "big");
          else onNotify(`+${payout} DBAK`, "success", 1200, "normal");
        }
        setRecent((prev) => [
          {
            id: crypto.randomUUID(),
            win: payout,
            totalBet,
            lines,
            symbols: evalRes.wins.length ? `${evalRes.wins[0]!.symbol} x${evalRes.wins[0]!.count}` : "No hit",
            at: new Date().toISOString(),
          },
          ...prev,
        ].slice(0, 10));
        setIsSpinning(false);
        setStoppedReels(5);
      }, 2200),
    );
  }, [isSpinning, totalBet, onNotify, balance, onResult, lines, betPerLine]);

  useEffect(() => {
    if (!isSpinning) return;
    const id = window.setInterval(() => setSpinTick((t) => t + 1), 70);
    return () => window.clearInterval(id);
  }, [isSpinning]);

  useEffect(() => {
    if (!isAuto || isSpinning) return;
    autoTimerRef.current = window.setTimeout(() => spin(), 1500);
    return () => {
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
  }, [isAuto, isSpinning, totalBet, balance, lines, spin]);

  const adjustBet = (factor: number) => {
    if (isSpinning) return;
    setBetInput((prev) => {
      const next = factor === 0.5 ? prev / 2 : prev * 2;
      return Math.max(1, Math.min(balance, 1000, Math.floor(next)));
    });
  };

  const symbolBadge = (id: SlotSymbolId) => {
    if (id === "WILD") return "text-[#C9A45C]";
    if (id === "SCATTER") return "text-[#E21B35]";
    return "text-[#F2E3C6]";
  };

  const displaySymbol = (id: SlotSymbolId) => SLOT_SYMBOLS.find((s) => s.id === id)?.glyph ?? id;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
      <aside className="order-2 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 lg:order-1">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet per line</label>
          <input
            type="number"
            min={1}
            value={betInput}
            disabled={isSpinning}
            onChange={(e) => setBetInput(Math.max(1, Number(e.target.value) || 1))}
            className="w-full rounded-xl border border-[#2A1D19] bg-[#050505] p-3 font-mono text-lg text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
          <div className="grid grid-cols-3 gap-2">
            <button type="button" disabled={isSpinning} onClick={() => adjustBet(0.5)} className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] py-2 text-xs font-bold text-[#BFAF91]">1/2</button>
            <button type="button" disabled={isSpinning} onClick={() => adjustBet(2)} className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] py-2 text-xs font-bold text-[#BFAF91]">2x</button>
            <button type="button" disabled={isSpinning} onClick={() => setBetInput(Math.max(1, Math.min(balance, 1000)))} className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] py-2 text-xs font-bold text-[#BFAF91]">MAX</button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] uppercase tracking-widest text-[#BFAF91]">Lines</p>
          <input
            type="range"
            min={1}
            max={20}
            value={lines}
            disabled={isSpinning}
            onChange={(e) => setLines(Number(e.target.value))}
            className="mt-2 w-full accent-[#B11226]"
          />
          <p className="mt-1 text-xs font-mono text-[#F2E3C6]">{lines} / 20</p>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-[#BFAF91]">Total bet</span>
            <span className={`font-mono font-black ${totalBet > balance ? "text-[#E21B35]" : "text-[#F2E3C6]"}`}>{totalBet}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <span className="text-xs font-black uppercase tracking-widest text-[#BFAF91]">Auto spin</span>
          <button
            type="button"
            disabled={isSpinning}
            onClick={() => setIsAuto((v) => !v)}
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${isAuto ? "bg-[#B11226] text-[#F2E3C6]" : "bg-[#15110F] text-[#BFAF91]"}`}
          >
            {isAuto ? "ON" : "OFF"}
          </button>
        </div>

        <div className="mt-4 max-h-36 overflow-y-auto rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Winning lines</p>
          {lineWins.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No active win.</p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs">
              {lineWins.map((w) => (
                <li key={`${w.lineIndex}-${w.symbol}`} className="flex justify-between text-[#F2E3C6]">
                  <span>L{w.lineIndex} {w.symbol} x{w.count}</span>
                  <span className="font-mono text-[#C9A45C]">{Math.floor(w.win)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 max-lg:sticky max-lg:bottom-2">
          <Button className="h-14 w-full text-base" onClick={spin} disabled={isSpinning}>
            {isSpinning ? "SPINNING..." : "SPIN"}
          </Button>
        </div>
      </aside>

      <section className="order-1 min-w-0 space-y-4 lg:order-2">
        <div className="overflow-hidden rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 shadow-[inset_0_0_40px_rgba(177,18,38,0.12)]">
          <div className="mx-auto max-w-[760px] rounded-2xl border-2 border-[#B11226]/45 bg-[#0D0D0D] p-3 shadow-[0_0_35px_rgba(201,164,92,0.14)]">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 5 }).map((_, col) => (
                <div key={col} className="rounded-xl border border-[#2A1D19] bg-[#050505] p-2">
                  {[0, 1, 2].map((row) => {
                    const visible = isSpinning && stoppedReels <= col ? previewSymbolForReel(col, row) : grid[col]![row]!;
                    return (
                      <motion.div
                        key={`${col}-${row}-${visible}-${spinTick}`}
                        initial={{ y: isSpinning && stoppedReels <= col ? -18 : 0, opacity: 0.85 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.22, delay: col * 0.04 }}
                        className={`mb-1 grid h-16 place-items-center rounded-lg border border-[#2A1D19] bg-[#15110F] text-sm font-black ${symbolBadge(visible)} ${isSpinning && stoppedReels <= col ? "blur-[1px]" : ""}`}
                      >
                        {displaySymbol(visible)}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          {bigWin && (
            <div className="mt-3 text-center">
              <p className="font-display text-2xl font-black italic text-[#C9A45C]">{jackpotWin ? "JACKPOT" : "BIG WIN"}</p>
              <p className="font-mono text-xl font-black text-[#F2E3C6]">+{Math.floor(lastWin)} DBAK</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Paytable</h3>
            <button type="button" className="rounded border border-[#2A1D19] px-2 py-1 text-[9px] font-black text-[#BFAF91]">View rules</button>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-2 text-[10px]">
            {SLOT_SYMBOLS.map((s) => (
              <div key={s.id} className="rounded border border-[#2A1D19] bg-[#0D0D0D] px-2 py-1 text-[#BFAF91]">
                <p className={`font-black ${symbolBadge(s.id)}`}>{s.glyph} {s.name}</p>
                <p>3:{s.payouts[3] ?? 0}x 4:{s.payouts[4] ?? 0}x 5:{s.payouts[5] ?? 0}x</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <aside className="order-3 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 lg:order-3">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Last win</p>
          <p className={`mt-1 font-mono text-2xl font-black ${lastWin > 0 ? "text-[#C9A45C]" : "text-[#BFAF91]"}`}>{lastWin > 0 ? `+${Math.floor(lastWin)}` : "0"}</p>
        </div>
        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent wins</h3>
          {recent.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No spins yet.</p>
          ) : (
            <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto text-[11px] font-mono">
              {recent.map((r) => (
                <li key={r.id} className="rounded border border-[#1f1613] bg-[#15110F] px-2 py-1 text-[#F2E3C6]">
                  <div className="flex justify-between">
                    <span>{r.symbols}</span>
                    <span className={r.win > 0 ? "text-[#C9A45C]" : "text-[#BFAF91]"}>{r.win > 0 ? `+${Math.floor(r.win)}` : "0"}</span>
                  </div>
                  <div className="mt-0.5 flex justify-between text-[10px] text-[#BFAF91]">
                    <span>Bet {r.totalBet} · {r.lines} lines</span>
                    <span>{new Date(r.at).toLocaleTimeString()}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

type CoinSide = "heads" | "tails";

function CoinflipGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betAmount, setBetAmount] = useState(10);
  const [choice, setChoice] = useState<CoinSide>("heads");
  const [isFlipping, setIsFlipping] = useState(false);
  const [lastResult, setLastResult] = useState<CoinSide | null>(null);
  const [recentFlips, setRecentFlips] = useState<CoinSide[]>([]);
  const [coinRotation, setCoinRotation] = useState(0);
  const [didWin, setDidWin] = useState(false);

  const applyHalf = () => setBetAmount((v) => Math.max(1, Math.floor(v / 2)));
  const applyDouble = () => setBetAmount((v) => Math.max(1, Math.min(balance, v * 2)));
  const applyMax = () => setBetAmount(Math.max(1, Math.floor(balance)));

  const flip = () => {
    if (isFlipping) return;
    const wager = Math.floor(betAmount);
    if (wager <= 0) {
      onNotify("Enter a valid bet amount", "error", 1000, "normal");
      return;
    }
    if (wager > balance) {
      onNotify("Insufficient balance", "error", 1000, "normal");
      return;
    }

    setIsFlipping(true);
    setDidWin(false);
    onResult(-wager);

    const result: CoinSide = Math.random() < 0.5 ? "heads" : "tails";
    const targetFaceRotation = result === "heads" ? 0 : 180;
    setCoinRotation((prev) => prev + 1800 + targetFaceRotation - (prev % 360));

    window.setTimeout(() => {
      setLastResult(result);
      setRecentFlips((prev) => [result, ...prev].slice(0, 12));
      const won = result === choice;
      setDidWin(won);
      if (won) {
        onResult(wager * 2);
        onNotify(`You won +${wager} DBAK`, "success", 1200, "normal");
      } else {
        onNotify("You lost this flip", "error", 1000, "normal");
      }
      setIsFlipping(false);
    }, 1300);
  };

  const coinBase = "absolute inset-0 grid place-items-center rounded-full border text-2xl font-black uppercase";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet amount</p>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.floor(balance))}
            value={Number.isFinite(betAmount) ? betAmount : 0}
            onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
            disabled={isFlipping}
            className="mt-2 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-base text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
          <div className="mt-2 grid grid-cols-3 gap-2">
            <Button variant="secondary" className="h-9 text-xs" onClick={applyHalf} disabled={isFlipping}>
              1/2
            </Button>
            <Button variant="secondary" className="h-9 text-xs" onClick={applyDouble} disabled={isFlipping}>
              2x
            </Button>
            <Button variant="secondary" className="h-9 text-xs" onClick={applyMax} disabled={isFlipping}>
              MAX
            </Button>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Pick side</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(["heads", "tails"] as const).map((side) => (
              <button
                key={side}
                type="button"
                disabled={isFlipping}
                onClick={() => setChoice(side)}
                className={`rounded-lg border px-3 py-2 text-xs font-black uppercase tracking-wider transition ${
                  choice === side
                    ? "border-[#C9A45C] bg-[#3A0B10]/30 text-[#F2E3C6]"
                    : "border-[#2A1D19] bg-[#15110F] text-[#BFAF91] hover:border-[#B11226]"
                }`}
              >
                {side}
              </button>
            ))}
          </div>
        </div>

        <Button variant="primary" className="mt-4 h-12 w-full text-sm" onClick={flip} disabled={isFlipping}>
          {isFlipping ? "FLIPPING..." : "FLIP"}
        </Button>
      </aside>

      <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="flex min-h-[420px] items-center justify-center rounded-2xl border border-[#F2E3C6]/10 bg-[#0D0D0D]">
          <motion.div
            animate={{ rotateY: coinRotation }}
            transition={{ duration: 1.3, ease: [0.18, 0.75, 0.24, 1] }}
            style={{ transformStyle: "preserve-3d" }}
            className={`relative h-56 w-56 rounded-full ${didWin ? "drop-shadow-[0_0_25px_rgba(201,164,92,0.85)]" : ""}`}
          >
            <div
              className={`${coinBase} border-[#C9A45C] bg-gradient-to-br from-[#fff1ba] via-[#C9A45C] to-[#8b6a2e] text-[#2A1D19]`}
              style={{ backfaceVisibility: "hidden" }}
            >
              H
            </div>
            <div
              className={`${coinBase} border-[#C9A45C] bg-gradient-to-br from-[#f6dc9a] via-[#b9923e] to-[#6c4f1f] text-[#2A1D19]`}
              style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
            >
              T
            </div>
          </motion.div>
        </div>
        <p className="mt-3 text-center text-xs text-[#BFAF91]">{isFlipping ? "Flipping..." : "Choose heads or tails and flip"}</p>
      </section>

      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Last result</p>
          <p className="mt-2 text-2xl font-black uppercase text-[#F2E3C6]">{lastResult ?? "—"}</p>
          <p className={`mt-1 text-xs font-bold ${lastResult == null ? "text-[#BFAF91]" : lastResult === choice ? "text-[#C9A45C]" : "text-[#E21B35]"}`}>
            {lastResult == null ? "No flips yet" : lastResult === choice ? "You won" : "You lost"}
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent flips</h3>
          {recentFlips.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No flips yet.</p>
          ) : (
            <ul className="mt-2 max-h-52 space-y-1 overflow-y-auto text-xs">
              {recentFlips.map((r, idx) => (
                <li key={`${r}-${idx}`} className="flex items-center justify-between rounded border border-[#1f1613] bg-[#15110F] px-2 py-1">
                  <span className="font-black uppercase text-[#F2E3C6]">{r}</span>
                  <span className={r === "heads" ? "text-[#C9A45C]" : "text-[#BFAF91]"}>{r === "heads" ? "H" : "T"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function kenoMultiplier(matches: number): number {
  if (matches <= 2) return 0;
  if (matches === 3) return 1;
  if (matches === 4) return 2;
  if (matches === 5) return 5;
  if (matches === 6) return 10;
  return 20;
}

function sampleUniqueNumbers(max: number, count: number): number[] {
  const pool = Array.from({ length: max }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, count).sort((a, b) => a - b);
}

function KenoGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betAmount, setBetAmount] = useState(10);
  const [picked, setPicked] = useState<number[]>([]);
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastMatches, setLastMatches] = useState<number>(0);
  const [lastPayout, setLastPayout] = useState<number>(0);

  const matchedNumbers = useMemo(
    () => picked.filter((n) => drawnNumbers.slice(0, revealedCount).includes(n)),
    [picked, drawnNumbers, revealedCount],
  );

  const togglePick = (n: number) => {
    if (isDrawing) return;
    setPicked((prev) => {
      if (prev.includes(n)) return prev.filter((x) => x !== n);
      if (prev.length >= 10) return prev;
      return [...prev, n].sort((a, b) => a - b);
    });
  };

  const clearPicks = () => {
    if (isDrawing) return;
    setPicked([]);
  };

  const quickPick = () => {
    if (isDrawing) return;
    setPicked(sampleUniqueNumbers(40, 10));
  };

  const play = () => {
    if (isDrawing) return;
    const wager = Math.floor(betAmount);
    if (wager <= 0) {
      onNotify("Enter a valid bet amount", "error", 1000, "normal");
      return;
    }
    if (picked.length === 0) {
      onNotify("Pick at least one number", "error", 1000, "normal");
      return;
    }
    if (wager > balance) {
      onNotify("Insufficient balance", "error", 1000, "normal");
      return;
    }

    const draw = sampleUniqueNumbers(40, 10);
    onResult(-wager);
    setIsDrawing(true);
    setDrawnNumbers(draw);
    setRevealedCount(0);
    setLastMatches(0);
    setLastPayout(0);

    let revealed = 0;
    const timer = window.setInterval(() => {
      revealed += 1;
      setRevealedCount(revealed);
      if (revealed >= draw.length) {
        window.clearInterval(timer);
        const matches = picked.filter((n) => draw.includes(n)).length;
        const multiplier = kenoMultiplier(matches);
        const payout = wager * multiplier;
        setLastMatches(matches);
        setLastPayout(payout);
        if (payout > 0) onResult(payout);
        if (matches >= 7) onNotify(`BIG WIN +${Math.floor(payout - wager)} DBAK`, "success", 2200, "big");
        else if (payout > 0) onNotify(`Matched ${matches} · +${Math.floor(payout - wager)} DBAK`, "success", 1200, "normal");
        else onNotify("No payout this draw", "info", 1000, "normal");
        setIsDrawing(false);
      }
    }, 130);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet amount</p>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.floor(balance))}
            value={Number.isFinite(betAmount) ? betAmount : 0}
            onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
            disabled={isDrawing}
            className="mt-2 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-base text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
          <p className="mt-2 text-[11px] text-[#BFAF91]">
            Picks: <span className="font-mono text-[#F2E3C6]">{picked.length}</span>/10
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3 text-xs text-[#BFAF91]">
          <p className="text-[10px] font-black uppercase tracking-widest">Potential payout preview</p>
          <ul className="mt-2 space-y-1 font-mono">
            <li>3 matches: {betAmount * 1}</li>
            <li>4 matches: {betAmount * 2}</li>
            <li>5 matches: {betAmount * 5}</li>
            <li>6 matches: {betAmount * 10}</li>
            <li>7+ matches: {betAmount * 20}</li>
          </ul>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-10 text-xs" onClick={clearPicks} disabled={isDrawing || picked.length === 0}>
            CLEAR PICKS
          </Button>
          <Button variant="secondary" className="h-10 text-xs" onClick={quickPick} disabled={isDrawing}>
            QUICK PICK
          </Button>
        </div>
        <Button variant="primary" className="mt-3 h-12 w-full text-sm" onClick={play} disabled={isDrawing}>
          {isDrawing ? "DRAWING..." : "PLAY"}
        </Button>
      </aside>

      <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="grid grid-cols-5 gap-2 rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          {Array.from({ length: 40 }, (_, i) => i + 1).map((n) => {
            const revealedDraw = drawnNumbers.slice(0, revealedCount);
            const isPicked = picked.includes(n);
            const isDrawn = revealedDraw.includes(n);
            const isMatch = isPicked && isDrawn;
            return (
              <button
                key={n}
                type="button"
                disabled={isDrawing}
                onClick={() => togglePick(n)}
                className={`h-12 rounded-lg border text-sm font-black transition ${
                  isMatch
                    ? "border-[#C9A45C] bg-[#3A0B10]/40 text-[#F2E3C6] shadow-[0_0_14px_rgba(201,164,92,0.45)]"
                    : isDrawn
                      ? "border-[#2d5a2d] bg-[#1a2d1a] text-[#7ddf8a]"
                      : isPicked
                        ? "border-[#B11226] bg-[#3A0B10]/25 text-[#F2E3C6]"
                        : "border-[#2A1D19] bg-[#15110F] text-[#BFAF91] hover:border-[#B11226]"
                }`}
              >
                {n}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-[#BFAF91]">{isDrawing ? "Drawing numbers..." : "Pick up to 10 numbers from 1 to 40"}</p>
      </section>

      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Last result</p>
          <p className="mt-2 text-sm text-[#F2E3C6]">
            Matches: <span className="font-mono font-black">{lastMatches}</span>
          </p>
          <p className="mt-1 text-sm text-[#F2E3C6]">
            Payout: <span className={`font-mono font-black ${lastPayout > 0 ? "text-[#C9A45C]" : "text-[#BFAF91]"}`}>{lastPayout}</span>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent draws</h3>
          {drawnNumbers.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No draws yet.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {drawnNumbers.slice(0, revealedCount).map((n) => (
                <span
                  key={n}
                  className={`rounded-full border px-2 py-0.5 text-xs font-black ${
                    picked.includes(n)
                      ? "border-[#C9A45C] bg-[#3A0B10]/35 text-[#F2E3C6]"
                      : "border-[#2A1D19] bg-[#15110F] text-[#BFAF91]"
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Matched numbers</h3>
          {matchedNumbers.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No matches</p>
          ) : (
            <p className="mt-2 font-mono text-sm text-[#C9A45C]">{matchedNumbers.join(", ")}</p>
          )}
        </div>
      </aside>
    </div>
  );
}

type BaccaratSide = "player" | "banker" | "tie";
type BaccaratCard = { rank: string; suit: string; value: number; id: string };

function drawBaccaratCard(): BaccaratCard {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"] as const;
  const suits = ["♠", "♥", "♦", "♣"] as const;
  const rank = ranks[Math.floor(Math.random() * ranks.length)]!;
  const suit = suits[Math.floor(Math.random() * suits.length)]!;
  const value = rank === "A" ? 1 : ["10", "J", "Q", "K"].includes(rank) ? 0 : Number(rank);
  return { rank, suit, value, id: crypto.randomUUID() };
}

function baccaratTotal(cards: BaccaratCard[]): number {
  return cards.reduce((sum, c) => sum + c.value, 0) % 10;
}

function BaccaratGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betSide, setBetSide] = useState<BaccaratSide>("player");
  const [betAmount, setBetAmount] = useState(10);
  const [isDealing, setIsDealing] = useState(false);
  const [playerCards, setPlayerCards] = useState<BaccaratCard[]>([]);
  const [bankerCards, setBankerCards] = useState<BaccaratCard[]>([]);
  const [revealedPlayer, setRevealedPlayer] = useState(0);
  const [revealedBanker, setRevealedBanker] = useState(0);
  const [winner, setWinner] = useState<BaccaratSide | null>(null);
  const [history, setHistory] = useState<BaccaratSide[]>([]);

  const playerTotal = baccaratTotal(playerCards.slice(0, revealedPlayer));
  const bankerTotal = baccaratTotal(bankerCards.slice(0, revealedBanker));

  const clearBet = () => {
    if (isDealing) return;
    setBetAmount(10);
    setBetSide("player");
  };

  const settle = (pWinner: BaccaratSide, wager: number) => {
    setWinner(pWinner);
    setHistory((prev) => [pWinner, ...prev].slice(0, 20));
    const multiplier = pWinner === "player" ? 2 : pWinner === "banker" ? 1.95 : 8;
    if (betSide === pWinner) {
      const payout = wager * multiplier;
      onResult(payout);
      if (pWinner === "tie") onNotify(`TIE hit! +${Math.floor(payout - wager)} DBAK`, "success", 1700, "big");
      else onNotify(`You won +${Math.floor(payout - wager)} DBAK`, "success", 1200, "normal");
    } else {
      onNotify("Round lost", "error", 1000, "normal");
    }
    setIsDealing(false);
  };

  const deal = () => {
    if (isDealing) return;
    const wager = Math.floor(betAmount);
    if (wager <= 0) {
      onNotify("Enter a valid bet amount", "error", 1000, "normal");
      return;
    }
    if (wager > balance) {
      onNotify("Insufficient balance", "error", 1000, "normal");
      return;
    }

    onResult(-wager);
    setIsDealing(true);
    setWinner(null);

    const pCards: BaccaratCard[] = [drawBaccaratCard(), drawBaccaratCard()];
    const bCards: BaccaratCard[] = [drawBaccaratCard(), drawBaccaratCard()];

    let pTotal = baccaratTotal(pCards);
    let bTotal = baccaratTotal(bCards);
    const natural = pTotal >= 8 || bTotal >= 8;

    if (!natural && pTotal <= 5) {
      pCards.push(drawBaccaratCard());
      pTotal = baccaratTotal(pCards);
    }
    if (!natural && bTotal <= 5) {
      bCards.push(drawBaccaratCard());
      bTotal = baccaratTotal(bCards);
    }

    setPlayerCards(pCards);
    setBankerCards(bCards);
    setRevealedPlayer(0);
    setRevealedBanker(0);

    const totalReveals = pCards.length + bCards.length;
    let step = 0;
    const timer = window.setInterval(() => {
      step += 1;
      const playerStep = Math.ceil(step / 2);
      const bankerStep = Math.floor(step / 2);
      setRevealedPlayer(Math.min(playerStep, pCards.length));
      setRevealedBanker(Math.min(bankerStep, bCards.length));
      if (step >= totalReveals) {
        window.clearInterval(timer);
        const finalPlayer = baccaratTotal(pCards);
        const finalBanker = baccaratTotal(bCards);
        const pWinner: BaccaratSide = finalPlayer > finalBanker ? "player" : finalBanker > finalPlayer ? "banker" : "tie";
        settle(pWinner, wager);
      }
    }, 220);
  };

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet on</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(["player", "banker", "tie"] as const).map((side) => (
            <button
              key={side}
              type="button"
              disabled={isDealing}
              onClick={() => setBetSide(side)}
              className={`rounded-lg border px-2 py-2 text-xs font-black uppercase transition ${
                betSide === side ? "border-[#C9A45C] bg-[#3A0B10]/30 text-[#F2E3C6]" : "border-[#2A1D19] bg-[#0D0D0D] text-[#BFAF91] hover:border-[#B11226]"
              }`}
            >
              {side}
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet amount</p>
          <input
            type="number"
            min={1}
            max={Math.max(1, Math.floor(balance))}
            value={Number.isFinite(betAmount) ? betAmount : 0}
            onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
            disabled={isDealing}
            className="mt-2 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-base text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-10 text-xs" onClick={clearBet} disabled={isDealing}>
            CLEAR BET
          </Button>
          <Button variant="primary" className="h-10 text-xs" onClick={deal} disabled={isDealing}>
            {isDealing ? "DEALING..." : "DEAL"}
          </Button>
        </div>
      </aside>

      <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-4">
          {(["player", "banker"] as const).map((side) => {
            const cards = side === "player" ? playerCards.slice(0, revealedPlayer) : bankerCards.slice(0, revealedBanker);
            const total = side === "player" ? playerTotal : bankerTotal;
            const isWinner = winner === side;
            return (
              <div key={side} className={`mb-4 rounded-xl border p-3 ${isWinner ? "border-[#C9A45C] bg-[#3A0B10]/25" : "border-[#2A1D19] bg-[#15110F]"}`}>
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-black uppercase tracking-widest text-[#BFAF91]">{side}</p>
                  <p className="font-mono text-[#F2E3C6]">Total: {cards.length ? total : "—"}</p>
                </div>
                <div className="flex min-h-16 gap-2">
                  {cards.length === 0 ? (
                    <span className="text-xs text-[#BFAF91]">Waiting for deal...</span>
                  ) : (
                    cards.map((c, i) => (
                      <motion.div
                        key={c.id}
                        initial={{ opacity: 0, y: -12, rotate: -6 }}
                        animate={{ opacity: 1, y: 0, rotate: 0 }}
                        transition={{ duration: 0.2, delay: i * 0.04 }}
                        className="grid h-16 w-12 place-items-center rounded-md border border-[#C9A45C]/40 bg-[#F2E3C6] text-sm font-black text-[#15110F]"
                      >
                        <span>
                          {c.rank}
                          {c.suit}
                        </span>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            );
          })}

          <div className={`rounded-xl border p-3 text-center ${winner ? "border-[#C9A45C] bg-[#3A0B10]/25" : "border-[#2A1D19] bg-[#15110F]"}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Round result</p>
            <p className="mt-1 text-2xl font-black uppercase text-[#F2E3C6]">{winner ?? "—"}</p>
          </div>
        </div>
      </section>

      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Payouts</p>
          <ul className="mt-2 space-y-1 text-xs font-mono text-[#BFAF91]">
            <li>Player: 2x</li>
            <li>Banker: 1.95x</li>
            <li>Tie: 8x</li>
          </ul>
        </div>
        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent rounds</h3>
          {history.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No rounds yet.</p>
          ) : (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {history.map((h, i) => (
                <span
                  key={`${h}-${i}`}
                  className={`rounded-full border px-2 py-0.5 text-xs font-black ${
                    h === "player" ? "border-[#7d1222] bg-[#3A0B10]/30 text-[#F2E3C6]" : h === "banker" ? "border-[#2A1D19] bg-[#15110F] text-[#F2E3C6]" : "border-[#C9A45C] bg-[#2d2410] text-[#C9A45C]"
                  }`}
                >
                  {h === "player" ? "P" : h === "banker" ? "B" : "T"}
                </span>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function LiveCasinoGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betAmount, setBetAmount] = useState(20);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerCard, setPlayerCard] = useState<number | null>(null);
  const [dealerCard, setDealerCard] = useState<number | null>(null);

  const deal = () => {
    if (isPlaying) return;
    const wager = Math.floor(betAmount);
    if (wager <= 0) return onNotify("Enter a valid bet amount", "error");
    if (wager > balance) return onNotify("Insufficient balance", "error");

    onResult(-wager);
    setIsPlaying(true);
    setPlayerCard(null);
    setDealerCard(null);

    const p = 1 + Math.floor(Math.random() * 13);
    const d = 1 + Math.floor(Math.random() * 13);
    window.setTimeout(() => setPlayerCard(p), 260);
    window.setTimeout(() => setDealerCard(d), 620);
    window.setTimeout(() => {
      if (p > d) {
        onResult(wager * 2);
        onNotify(`Player wins +${wager} DBAK`, "success");
      } else if (p === d) {
        onResult(wager);
        onNotify("Push", "info");
      } else {
        onNotify("Dealer wins", "error");
      }
      setIsPlaying(false);
    }, 900);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Live table wager</p>
        <input
          type="number"
          min={1}
          max={Math.max(1, Math.floor(balance))}
          value={betAmount}
          onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
          disabled={isPlaying}
          className="mt-2 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-base text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
        />
        <Button className="mt-3 w-full" onClick={deal} disabled={isPlaying}>
          {isPlaying ? "DEALING..." : "DEAL LIVE HAND"}
        </Button>
      </aside>
      <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="grid min-h-[320px] place-items-center rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-4 text-center">
              <p className="text-xs font-black uppercase text-[#BFAF91]">Player card</p>
              <p className="mt-2 text-5xl font-black text-[#F2E3C6]">{playerCard ?? "?"}</p>
            </div>
            <div className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-4 text-center">
              <p className="text-xs font-black uppercase text-[#BFAF91]">Dealer card</p>
              <p className="mt-2 text-5xl font-black text-[#F2E3C6]">{dealerCard ?? "?"}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function GameShowsGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const [betAmount, setBetAmount] = useState(15);
  const [pick, setPick] = useState<number | null>(null);
  const [winningDoor, setWinningDoor] = useState<number | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const play = () => {
    if (isSpinning) return;
    if (pick == null) return onNotify("Pick a door first", "error");
    const wager = Math.floor(betAmount);
    if (wager <= 0) return onNotify("Enter a valid bet amount", "error");
    if (wager > balance) return onNotify("Insufficient balance", "error");
    onResult(-wager);
    setIsSpinning(true);
    setWinningDoor(null);
    const winDoor = 1 + Math.floor(Math.random() * 3);
    window.setTimeout(() => {
      setWinningDoor(winDoor);
      if (winDoor === pick) {
        onResult(wager * 3);
        onNotify(`Door ${pick} wins! +${wager * 2} DBAK`, "success", 1500, "normal");
      } else {
        onNotify(`Winning door was ${winDoor}`, "error", 1200, "normal");
      }
      setIsSpinning(false);
    }, 850);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <aside className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Bet amount</p>
        <input
          type="number"
          min={1}
          max={Math.max(1, Math.floor(balance))}
          value={betAmount}
          onChange={(e) => setBetAmount(Math.max(1, Math.floor(Number(e.target.value) || 0)))}
          disabled={isSpinning}
          className="mt-2 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 font-mono text-base text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
        />
        <Button className="mt-3 w-full" onClick={play} disabled={isSpinning}>
          {isSpinning ? "REVEALING..." : "PLAY SHOW"}
        </Button>
      </aside>
      <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4">
        <div className="grid min-h-[320px] place-items-center rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-6">
          <div className="grid w-full max-w-xl grid-cols-3 gap-3">
            {[1, 2, 3].map((door) => {
              const picked = pick === door;
              const won = winningDoor === door;
              return (
                <button
                  key={door}
                  type="button"
                  disabled={isSpinning}
                  onClick={() => setPick(door)}
                  className={`h-32 rounded-xl border text-sm font-black transition ${
                    won
                      ? "border-[#C9A45C] bg-[#3A0B10]/30 text-[#F2E3C6]"
                      : picked
                        ? "border-[#B11226] bg-[#15110F] text-[#F2E3C6]"
                        : "border-[#2A1D19] bg-[#15110F] text-[#BFAF91] hover:border-[#B11226]"
                  }`}
                >
                  DOOR {door}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

const ROULETTE_RED_NUMBERS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const EUROPEAN_WHEEL_ORDER = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26] as const;

function getNumberColor(num: number): RouletteNumberColor {
  if (num === 0) return "green";
  return ROULETTE_RED_NUMBERS.has(num) ? "red" : "black";
}

function getPayoutMultiplier(bet: RouletteBet): number {
  if (bet.type === "straight") return 36;
  if (bet.type === "dozen" || bet.type === "column") return 3;
  return 2;
}

function isWinningBet(bet: RouletteBet, result: number): boolean {
  const color = getNumberColor(result);
  if (bet.type === "straight") return Number(bet.value) === result;
  if (bet.type === "red") return color === "red";
  if (bet.type === "black") return color === "black";
  if (bet.type === "odd") return result !== 0 && result % 2 === 1;
  if (bet.type === "even") return result !== 0 && result % 2 === 0;
  if (bet.type === "low") return result >= 1 && result <= 18;
  if (bet.type === "high") return result >= 19 && result <= 36;
  if (bet.type === "dozen") {
    if (bet.value === 1) return result >= 1 && result <= 12;
    if (bet.value === 2) return result >= 13 && result <= 24;
    return result >= 25 && result <= 36;
  }
  if (bet.type === "column") {
    if (result === 0) return false;
    if (bet.value === 1) return result % 3 === 1;
    if (bet.value === 2) return result % 3 === 2;
    return result % 3 === 0;
  }
  return false;
}

function RouletteGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, duration?: number, priority?: NotificationPriority) => void;
}) {
  const CHIPS = [1, 5, 10, 25, 100, 500] as const;
  const [selectedChip, setSelectedChip] = useState<number>(10);
  const [bets, setBets] = useState<RouletteBet[]>([]);
  const [lastBets, setLastBets] = useState<RouletteBet[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winningNumber, setWinningNumber] = useState<number | null>(null);
  const [lastSpin, setLastSpin] = useState<RouletteLastSpin | null>(null);
  const [wheelRotation, setWheelRotation] = useState(0);
  const [spinRows, setSpinRows] = useState<RouletteSpinRow[]>([]);
  const [recentNumbers, setRecentNumbers] = useState<number[]>([]);
  const hasSettledRef = useRef(false);
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [wheelSize, setWheelSize] = useState(360);

  const totalBet = useMemo(() => bets.reduce((sum, b) => sum + b.amount, 0), [bets]);
  const warningOverBalance = totalBet > balance;

  const upsertBet = (next: Omit<RouletteBet, "amount">) => {
    if (isSpinning) return;
    setBets((prev) => {
      const idx = prev.findIndex((b) => b.id === next.id);
      if (idx === -1) return [...prev, { ...next, amount: selectedChip }];
      const clone = [...prev];
      clone[idx] = { ...clone[idx], amount: clone[idx]!.amount + selectedChip };
      return clone;
    });
  };

  const removeBet = (id: string) => {
    if (isSpinning) return;
    setBets((prev) => prev.filter((b) => b.id !== id));
  };

  const clearBets = () => {
    if (isSpinning) return;
    setBets([]);
  };

  const repeatLastBets = () => {
    if (isSpinning || lastBets.length === 0) return;
    const total = lastBets.reduce((sum, b) => sum + b.amount, 0);
    if (total > balance) {
      onNotify("Insufficient balance for repeat bet", "error", 1100, "normal");
      return;
    }
    setBets(lastBets.map((b) => ({ ...b })));
  };

  const settleSpin = (rolled: number, rolledColor: RouletteNumberColor, wagered: RouletteBet[], spinTotalBet: number) => {
    if (hasSettledRef.current) return;
    hasSettledRef.current = true;

    const totalPayout = wagered.reduce((sum, b) => (isWinningBet(b, rolled) ? sum + b.amount * getPayoutMultiplier(b) : sum), 0);
    const net = totalPayout - spinTotalBet;

    if (totalPayout > 0) onResult(totalPayout);
    if (net >= 500) onNotify(`BIG WIN +${Math.floor(net)} DBAK`, "success", 2200, "big");
    else if (net > 0) onNotify(`+${Math.floor(net)} DBAK`, "success", 1200, "normal");
    else onNotify("Spin settled", "info", 900, "normal");

    setLastSpin({
      winningNumber: rolled,
      color: rolledColor,
      totalBet: spinTotalBet,
      totalPayout,
      net,
    });
    setSpinRows((prev) => [
      {
        id: crypto.randomUUID(),
        result: rolled,
        color: rolledColor,
        totalBet: spinTotalBet,
        payout: totalPayout,
        net,
        at: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 20));
    setRecentNumbers((prev) => [rolled, ...prev].slice(0, 12));
    setLastBets(wagered.map((b) => ({ ...b })));
    setBets([]);
  };

  const spin = () => {
    if (isSpinning) return;
    if (totalBet <= 0) {
      onNotify("Place at least one bet", "error", 1000, "normal");
      return;
    }
    if (totalBet > balance) {
      onNotify("Insufficient balance", "error", 1000, "normal");
      return;
    }

    hasSettledRef.current = false;
    const snapshot = bets.map((b) => ({ ...b }));
    const spinTotalBet = totalBet;
    const rolled = Math.floor(Math.random() * 37);
    setWinningNumber(rolled);

    onResult(-spinTotalBet);
    setIsSpinning(true);
    setWheelRotation((prev) => prev + 540);

    window.setTimeout(() => {
      const rolledColor = getNumberColor(rolled);
      settleSpin(rolled, rolledColor, snapshot, spinTotalBet);
      setIsSpinning(false);
      setWheelRotation(0);

      const resultIndex = EUROPEAN_WHEEL_ORDER.indexOf(rolled as (typeof EUROPEAN_WHEEL_ORDER)[number]);
      const safeResultIndex = resultIndex === -1 ? 0 : resultIndex;
      if (resultIndex === -1) {
        console.error("Roulette winningNumber was not found in wheel order", { winningNumber: rolled });
      }
      const segmentAngle = 360 / EUROPEAN_WHEEL_ORDER.length;
      const ballAngle = safeResultIndex * segmentAngle;
      console.log({
        winningNumber: rolled,
        resultIndex: safeResultIndex,
        ballAngle,
        pocketNumberAtIndex: EUROPEAN_WHEEL_ORDER[safeResultIndex],
      });
    }, 3600);
  };

  const numbersByRows = useMemo(() => {
    const rows: number[][] = [];
    for (let r = 0; r < 12; r++) {
      const base = r * 3;
      rows.push([3 + base, 2 + base, 1 + base]);
    }
    return rows.reverse();
  }, []);

  const getCellBet = (id: string) => bets.find((b) => b.id === id)?.amount ?? 0;
  const resultColor = winningNumber == null ? null : getNumberColor(winningNumber);
  const segmentAngle = 360 / EUROPEAN_WHEEL_ORDER.length;
  const resultIndex = winningNumber == null ? -1 : EUROPEAN_WHEEL_ORDER.indexOf(winningNumber as (typeof EUROPEAN_WHEEL_ORDER)[number]);
  const safeResultIndex = resultIndex === -1 ? 0 : resultIndex;
  const ballAngle = safeResultIndex * segmentAngle;
  const pocketRadius = wheelSize * 0.4;
  const ballRadius = wheelSize * 0.45;

  useEffect(() => {
    const el = wheelRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.contentRect;
      if (!box) return;
      setWheelSize(Math.max(240, Math.min(box.width, box.height)));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (winningNumber != null && resultIndex === -1) {
      console.error("Roulette result index fallback to 0", { winningNumber });
    }
  }, [winningNumber, resultIndex]);

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)_320px] lg:gap-6">
      <div className="order-1 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 lg:order-1">
        <div className="rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Balance</p>
          <p className="font-mono text-xl font-black text-[#F2E3C6]">{formatCurrency(balance)} <span className="text-[#C9A45C]">DBAK</span></p>
        </div>

        <div className="mt-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Chips</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {CHIPS.map((chip) => (
              <button
                key={chip}
                type="button"
                disabled={isSpinning}
                onClick={() => setSelectedChip(chip)}
                className={`rounded-lg border px-2 py-2 text-xs font-black transition ${
                  selectedChip === chip
                    ? "border-[#C9A45C] bg-[#3A0B10]/30 text-[#F2E3C6]"
                    : "border-[#2A1D19] bg-[#0D0D0D] text-[#BFAF91] hover:border-[#B11226]"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-[#BFAF91]">Selected chip: <span className="font-mono text-[#F2E3C6]">{selectedChip}</span></p>
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="uppercase tracking-wider text-[#BFAF91]">Total bet</span>
            <span className={`font-mono font-black ${warningOverBalance ? "text-[#E21B35]" : "text-[#F2E3C6]"}`}>{totalBet}</span>
          </div>
          {warningOverBalance && <p className="mt-1 text-[10px] text-[#E21B35]">Warning: exceeds balance</p>}
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" className="h-10 text-xs" onClick={clearBets} disabled={isSpinning || bets.length === 0}>
            CLEAR BETS
          </Button>
          <Button variant="secondary" className="h-10 text-xs" onClick={repeatLastBets} disabled={isSpinning || lastBets.length === 0}>
            REPEAT LAST
          </Button>
        </div>
        <Button variant="primary" className="mt-3 h-12 w-full text-sm" onClick={spin} disabled={isSpinning}>
          {isSpinning ? "SPINNING..." : "SPIN"}
        </Button>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Current bets</h3>
          {bets.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No active bets</p>
          ) : (
            <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-xs">
              {bets.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 rounded border border-[#1f1613] bg-[#15110F] px-2 py-1">
                  <span className="truncate text-[#F2E3C6]">{b.label}</span>
                  <span className="font-mono text-[#C9A45C]">{b.amount}</span>
                  <button type="button" disabled={isSpinning} onClick={() => removeBet(b.id)} className="text-[10px] font-black text-[#BFAF91] hover:text-[#E21B35]">X</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <p className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Rules / Payouts</p>
          <p className="mt-2 text-[10px] leading-relaxed text-[#BFAF91]">
            European wheel 0-36. Straight 36x return, outside bets 2x, dozen/column 3x. Zero beats outside/dozen/column.
          </p>
        </div>
      </div>

      <section className="order-2 min-w-0 space-y-4 lg:order-2">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 overflow-hidden">
          <div className="flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-[#F2E3C6]/10 bg-[#0D0D0D]">
            <div ref={wheelRef} className="roulette-wheel relative mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-full">
              {/* Layer A: outer red ring */}
              <div className="absolute inset-[7%] rounded-full border-[10px] border-[#B11226] bg-gradient-to-br from-[#0d0a09] via-[#191210] to-[#050505]" />
              <div className="absolute inset-[16%] rounded-full border border-[#C9A45C]/20 bg-[#090808]" />

              {/* Layer B: wheel pockets (European order) */}
              <motion.div
                animate={{ rotate: isSpinning ? wheelRotation : 0 }}
                transition={{ duration: isSpinning ? 3.6 : 0.35, ease: [0.1, 0.75, 0.2, 1] }}
                className="absolute inset-0"
              >
                {EUROPEAN_WHEEL_ORDER.map((n, i) => {
                  const angle = (i / EUROPEAN_WHEEL_ORDER.length) * 360;
                  const clr = getNumberColor(n);
                  const pocket = clr === "red" ? "bg-[#7d1222]" : clr === "black" ? "bg-[#111111]" : "bg-[#2d5a2d]";
                  const isWinningPocket = winningNumber != null && n === winningNumber;
                  return (
                    <div
                      key={n}
                      className="absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-${pocketRadius}px) rotate(90deg)`,
                        transformOrigin: "center center",
                      }}
                    >
                      <div
                        className={`grid h-[28px] w-[18px] place-items-center rounded-[5px] border shadow-[0_0_6px_rgba(0,0,0,0.28)] ${pocket} ${
                          isWinningPocket
                            ? "border-[#C9A45C] shadow-[0_0_14px_rgba(201,164,92,0.9)]"
                            : "border-[rgba(242,227,198,0.15)]"
                        }`}
                      >
                        <span className="text-[7px] font-black leading-none text-[#F2E3C6]">{n}</span>
                      </div>
                    </div>
                  );
                })}
              </motion.div>

              {/* Layer C: ball locked to winning pocket */}
              <div className="absolute inset-0 rounded-full">
                <div
                  className="absolute left-1/2 top-1/2 h-[12px] w-[12px] rounded-full bg-[#F2E3C6] shadow-[0_0_14px_rgba(242,227,198,0.75)]"
                  style={{ transform: `rotate(${ballAngle}deg) translateY(-${ballRadius}px) translate(-50%, -50%)` }}
                />
              </div>

              {/* Layer D: center hub */}
              <div className="absolute left-1/2 top-1/2 grid h-[24%] w-[24%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-[#C9A45C]/50 bg-[#0D0D0D]">
                <div className="text-center">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#BFAF91]">Result</p>
                  <p className={`text-3xl font-black ${resultColor === "red" ? "text-[#E21B35]" : resultColor === "black" ? "text-[#F2E3C6]" : "text-[#C9A45C]"}`}>
                    {winningNumber ?? "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-[#BFAF91]">{isSpinning ? "Spinning..." : "Place bets and spin"}</p>
        </div>

        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-3">
          <div className="overflow-x-auto lg:overflow-x-hidden">
            <div className="mx-auto w-full max-w-[760px] min-w-[680px]">
              <div className="mb-1 grid grid-cols-3 gap-1">
                <button
                  type="button"
                  disabled={isSpinning}
                  onClick={() => upsertBet({ id: "straight-0", type: "straight", label: "0", value: 0 })}
                  className={`relative col-span-3 rounded-lg border border-[#2A1D19] bg-[#2d5a2d] py-2 text-sm font-black text-[#F2E3C6] ${isSpinning ? "opacity-60" : "hover:border-[#C9A45C]"}`}
                >
                  0
                  {getCellBet("straight-0") > 0 && <span className="absolute -right-1 -top-1 rounded bg-[#C9A45C] px-1 text-[10px] font-black text-[#050505]">{getCellBet("straight-0")}</span>}
                </button>
              </div>

              {numbersByRows.map((row) => (
                <div key={row.join("-")} className="mb-1 grid grid-cols-3 gap-1">
                  {row.map((n) => {
                    const c = getNumberColor(n);
                    const bg = c === "red" ? "bg-[#7d1222]" : "bg-[#111111]";
                    const id = `straight-${n}`;
                    const amt = getCellBet(id);
                    return (
                      <button
                        key={n}
                        type="button"
                        disabled={isSpinning}
                        onClick={() => upsertBet({ id, type: "straight", label: String(n), value: n })}
                        className={`relative h-11 rounded border border-[#2A1D19] ${bg} text-sm font-black text-[#F2E3C6] ${isSpinning ? "opacity-60" : "hover:border-[#C9A45C]"}`}
                      >
                        {n}
                        {amt > 0 && <span className="absolute -right-1 -top-1 rounded bg-[#C9A45C] px-1 text-[10px] font-black text-[#050505]">{amt}</span>}
                      </button>
                    );
                  })}
                </div>
              ))}

              <div className="mt-3 grid grid-cols-3 gap-1">
                {[
                  { id: "dozen-1", label: "1st 12", value: 1 },
                  { id: "dozen-2", label: "2nd 12", value: 2 },
                  { id: "dozen-3", label: "3rd 12", value: 3 },
                ].map((item) => (
                  <button key={item.id} type="button" disabled={isSpinning} onClick={() => upsertBet({ id: item.id, type: "dozen", label: item.label, value: item.value })} className="relative h-11 rounded-lg border border-[#2A1D19] bg-[#0D0D0D] text-xs font-black text-[#F2E3C6] hover:border-[#C9A45C]">
                    {item.label}
                    {getCellBet(item.id) > 0 && <span className="absolute -right-1 -top-1 rounded bg-[#C9A45C] px-1 text-[10px] font-black text-[#050505]">{getCellBet(item.id)}</span>}
                  </button>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-3 gap-1">
                {[
                  { id: "column-1", label: "2:1", value: 1 },
                  { id: "column-2", label: "2:1", value: 2 },
                  { id: "column-3", label: "2:1", value: 3 },
                ].map((item) => (
                  <button key={item.id} type="button" disabled={isSpinning} onClick={() => upsertBet({ id: item.id, type: "column", label: `Column ${item.value}`, value: item.value })} className="relative h-11 rounded-lg border border-[#2A1D19] bg-[#0D0D0D] text-xs font-black text-[#F2E3C6] hover:border-[#C9A45C]">
                    {item.label}
                    {getCellBet(item.id) > 0 && <span className="absolute -right-1 -top-1 rounded bg-[#C9A45C] px-1 text-[10px] font-black text-[#050505]">{getCellBet(item.id)}</span>}
                  </button>
                ))}
              </div>

              <div className="mt-2 grid grid-cols-6 gap-1">
                {[
                  ["low", "1-18", "low", "low"],
                  ["even", "Even", "even", "even"],
                  ["red", "Red", "red", "red"],
                  ["black", "Black", "black", "black"],
                  ["odd", "Odd", "odd", "odd"],
                  ["high", "19-36", "high", "high"],
                ].map(([id, label, type, value]) => (
                  <button
                    key={id}
                    type="button"
                    disabled={isSpinning}
                    onClick={() => upsertBet({ id, type: type as RouletteBetType, label, value })}
                    className={`relative h-11 rounded-lg border border-[#2A1D19] text-xs font-black text-[#F2E3C6] hover:border-[#C9A45C] ${
                      id === "red" ? "bg-[#7d1222]" : id === "black" ? "bg-[#111111]" : "bg-[#0D0D0D]"
                    }`}
                  >
                    {label}
                    {getCellBet(id) > 0 && <span className="absolute -right-1 -top-1 rounded bg-[#C9A45C] px-1 text-[10px] font-black text-[#050505]">{getCellBet(id)}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside className="order-4 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-4 lg:order-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent results</h3>
          <Badge variant="demo">EUROPEAN 0-36</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {recentNumbers.length === 0 ? <span className="text-[10px] text-[#BFAF91]">No spins yet.</span> : null}
          {recentNumbers.map((n, i) => {
            const c = getNumberColor(n);
            const cls = c === "red" ? "bg-[#7d1222]" : c === "black" ? "bg-[#111111]" : "bg-[#2d5a2d]";
            return (
              <span key={`${n}-${i}`} className={`${cls} rounded-full border border-[#C9A45C]/25 px-2 py-0.5 text-xs font-black text-[#F2E3C6]`}>
                {n}
              </span>
            );
          })}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3 text-xs">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Last spin</h4>
          {lastSpin ? (
            <div className="mt-2 space-y-1">
              <p>Winning number: <span className="font-black text-[#F2E3C6]">{lastSpin.winningNumber}</span></p>
              <p>Total bet: <span className="font-mono">{lastSpin.totalBet}</span></p>
              <p>Total payout: <span className="font-mono text-[#C9A45C]">{lastSpin.totalPayout}</span></p>
              <p>
                Net:{" "}
                <span className={lastSpin.net >= 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>
                  {lastSpin.net >= 0 ? "+" : ""}
                  {lastSpin.net}
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-2 text-[#BFAF91]">No spin summary yet.</p>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Current bet summary</h4>
          {bets.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No active bets</p>
          ) : (
            <ul className="mt-2 max-h-36 space-y-1 overflow-y-auto text-[11px] font-mono">
              {bets.map((b) => (
                <li key={b.id} className="flex items-center justify-between gap-2 rounded border border-[#1f1613] bg-[#15110F] px-2 py-1 text-[#F2E3C6]">
                  <span className="truncate">{b.label}</span>
                  <span className="text-[#C9A45C]">{b.amount}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-4 rounded-xl border border-[#2A1D19] bg-[#0D0D0D] p-3">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Recent spin table</h4>
          {spinRows.length === 0 ? (
            <p className="mt-2 text-xs text-[#BFAF91]">No spins yet.</p>
          ) : (
            <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-[11px] font-mono">
              {spinRows.slice(0, 12).map((row) => (
                <li key={row.id} className="grid grid-cols-4 gap-1 rounded border border-[#1f1613] bg-[#15110F] px-2 py-1 text-[#F2E3C6]">
                  <span className={row.color === "red" ? "text-[#E21B35]" : row.color === "black" ? "text-[#F2E3C6]" : "text-[#C9A45C]"}>{row.result}</span>
                  <span>{row.totalBet}</span>
                  <span className="text-[#C9A45C]">{row.payout}</span>
                  <span className={row.net >= 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>{row.net >= 0 ? "+" : ""}{row.net}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}

function CrashGame({ balance, onResult }: { balance: number; onResult: (delta: number) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [multiplier, setMultiplier] = useState(1.0);
  const [isCrashed, setIsCrashed] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [cashedOut, setCashedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const cashedOutRef = useRef(false);
  const crashPointRef = useRef(1);
  const multiplierRef = useRef(1);

  useEffect(() => {
    multiplierRef.current = multiplier;
  }, [multiplier]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRound = (amount: number) => {
    if (isPlaying) return;
    if (amount > balance || amount <= 0) return;

    onResult(-amount);
    setBetAmount(amount);
    setIsPlaying(true);
    setIsCrashed(false);
    setMultiplier(1.0);
    multiplierRef.current = 1;
    setCashedOut(false);
    cashedOutRef.current = false;
    crashPointRef.current = 1 + Math.random() * 5;

    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setMultiplier((prev) => {
        const next = prev + 0.01 * (prev / 2);
        multiplierRef.current = next;
        if (next >= crashPointRef.current) {
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = null;
          setIsCrashed(true);
          setIsPlaying(false);
          return next;
        }
        return next;
      });
    }, 50);
  };

  const handleCashout = () => {
    if (!isPlaying || isCrashed || cashedOutRef.current) return;
    cashedOutRef.current = true;
    setCashedOut(true);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setIsPlaying(false);
    const payout = betAmount * multiplierRef.current;
    onResult(payout);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <BetPanel balance={balance} onBet={startRound} isLoading={isPlaying && !cashedOut && !isCrashed} />
        {isPlaying && !cashedOut && !isCrashed && (
          <Button variant="cream" className="w-full mt-4 h-16 border-4 border-[#B11226]" onClick={handleCashout}>
            CASHOUT @ {multiplier.toFixed(2)}x
          </Button>
        )}
      </div>
      <div className="lg:col-span-2 bg-[#15110F] border border-[#2A1D19] rounded-3xl relative overflow-hidden flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute inset-0 opacity-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={Array.from({ length: 20 }, (_, i) => ({ val: i * i }))}>
              <Area type="monotone" dataKey="val" stroke={COLORS.red} fill={COLORS.red} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <motion.div key={isCrashed ? "crash" : "active"} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center z-10">
          {isCrashed ? (
            <div className="text-red-600 font-black text-8xl italic uppercase">Crashed!</div>
          ) : (
            <div className={`font-black text-9xl tracking-tighter ${cashedOut ? "text-[#C9A45C]" : "text-[#F2E3C6]"}`}>
              {multiplier.toFixed(2)}
              <span className="text-4xl">x</span>
            </div>
          )}
          <div className="text-[12px] uppercase tracking-[1em] text-[#BFAF91] mt-4 font-black">Current Multiplier</div>
        </motion.div>

        {cashedOut && (
          <div className="absolute top-8 right-8 bg-[#0D0D0D] border-2 border-[#C9A45C] p-4 rounded-xl text-center">
            <span className="block text-[10px] text-[#C9A45C] font-black">CASHOUT WIN</span>
            <span className="text-2xl font-black text-white">+{(betAmount * multiplier).toFixed(0)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DiceGame({ balance, onResult }: { balance: number; onResult: (delta: number) => void }) {
  const [value, setValue] = useState(50);
  const [rolling, setRolling] = useState(false);
  const [lastResult, setLastResult] = useState<number | null>(null);

  const roll = (amount: number) => {
    if (amount > balance || amount <= 0) return;
    setRolling(true);
    setLastResult(null);

    setTimeout(() => {
      const result = Math.floor(Math.random() * 100) + 1;
      setLastResult(result);
      setRolling(false);

      const won = result > value;
      const mult = 100 / (100 - value);
      const delta = won ? amount * mult - amount : -amount;
      onResult(delta);
    }, 800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="bg-[#15110F] border border-[#2A1D19] p-6 rounded-2xl mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-[10px] font-black text-[#BFAF91]">ROLL OVER</span>
            <span className="text-xl font-black text-white">{value}</span>
          </div>
          <input
            type="range"
            min={2}
            max={98}
            value={value}
            onChange={(e) => setValue(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-[#0D0D0D] rounded-lg appearance-none cursor-pointer accent-[#B11226]"
          />
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="p-3 bg-[#0D0D0D] border border-[#2A1D19] rounded-xl text-center">
              <span className="block text-[8px] uppercase text-[#BFAF91] mb-1">Multiplier</span>
              <span className="text-lg font-black text-white">{(100 / (100 - value)).toFixed(4)}x</span>
            </div>
            <div className="p-3 bg-[#0D0D0D] border border-[#2A1D19] rounded-xl text-center">
              <span className="block text-[8px] uppercase text-[#BFAF91] mb-1">Win Chance</span>
              <span className="text-lg font-black text-white">{100 - value}%</span>
            </div>
          </div>
        </div>
        <BetPanel balance={balance} onBet={roll} isLoading={rolling} />
      </div>
      <div className="lg:col-span-2 bg-[#15110F] border border-[#2A1D19] rounded-3xl p-12 flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-full h-12 bg-[#0D0D0D] rounded-full border border-[#2A1D19] relative mb-12 flex items-center px-4 overflow-hidden">
          <div className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-[#B11226]/50 z-0" />
          <motion.div animate={{ left: `${value}%` }} className="absolute h-full bg-[#B11226]/10 border-l border-r border-[#B11226]/20" style={{ right: 0 }} />
          {lastResult !== null && (
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={`absolute w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm z-10 border-2 ${
                lastResult > value ? "bg-[#C9A45C] border-white text-black" : "bg-[#0D0D0D] border-[#B11226] text-white"
              }`}
              style={{ left: `calc(${lastResult}% - 16px)` }}
            >
              {lastResult}
            </motion.div>
          )}
        </div>

        <div className="flex gap-4">
          <div className={`w-32 h-32 rounded-3xl bg-[#0D0D0D] border-4 ${rolling ? "border-[#B11226] animate-bounce" : "border-[#2A1D19]"} flex items-center justify-center text-5xl font-black text-white`}>
            {rolling ? "?" : lastResult ?? "-"}
          </div>
        </div>
      </div>
    </div>
  );
}

const MINES_OPTIONS = [1, 3, 5, 10] as const;
const GRID_SIZE = 25;

function pickMineIndices(minesCount: number): Set<number> {
  const bag = Array.from({ length: GRID_SIZE }, (_, i) => i);
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return new Set(bag.slice(0, minesCount));
}

function minesMultiplier(safeOpened: number, minesCount: number) {
  return 1 + safeOpened * (minesCount * 0.18);
}

type MinesHistoryEntry = {
  id: string;
  mines: number;
  safe: number;
  mult: number;
  payout: number;
  outcome: "cashout" | "mine";
};

function MinesGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, meta?: { net?: number }) => void;
}) {
  const [minesCount, setMinesCount] = useState<(typeof MINES_OPTIONS)[number]>(3);
  const [roundActive, setRoundActive] = useState(false);
  const [betAmount, setBetAmount] = useState(0);
  const [mines, setMines] = useState<Set<number>>(new Set());
  const [revealed, setRevealed] = useState<boolean[]>(() => Array(GRID_SIZE).fill(false));
  const [safeOpened, setSafeOpened] = useState(0);
  const [hitMineIndex, setHitMineIndex] = useState<number | null>(null);
  const [showAllMines, setShowAllMines] = useState(false);
  const [cashoutGlow, setCashoutGlow] = useState(false);
  const [history, setHistory] = useState<MinesHistoryEntry[]>([]);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentMultiplier = minesMultiplier(safeOpened, minesCount);
  const potentialCashout = roundActive ? betAmount * currentMultiplier : 0;

  const clearResetTimer = () => {
    if (resetTimerRef.current) {
      clearTimeout(resetTimerRef.current);
      resetTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearResetTimer();
  }, []);

  const scheduleBoardReset = () => {
    clearResetTimer();
    resetTimerRef.current = setTimeout(() => {
      setRoundActive(false);
      setBetAmount(0);
      setMines(new Set());
      setRevealed(Array(GRID_SIZE).fill(false));
      setSafeOpened(0);
      setHitMineIndex(null);
      setShowAllMines(false);
      setCashoutGlow(false);
      resetTimerRef.current = null;
    }, 1500);
  };

  const startRound = (amount: number) => {
    if (roundActive) return;
    if (amount > balance || amount <= 0) return;

    onResult(-amount);
    setBetAmount(amount);
    setMines(pickMineIndices(minesCount));
    setRevealed(Array(GRID_SIZE).fill(false));
    setSafeOpened(0);
    setHitMineIndex(null);
    setShowAllMines(false);
    setCashoutGlow(false);
    setRoundActive(true);
  };

  const endRoundWithMine = (index: number, nextRevealed: boolean[]) => {
    const multSnap = minesMultiplier(safeOpened, minesCount);
    setHitMineIndex(index);
    setShowAllMines(true);
    setRoundActive(false);
    setRevealed(nextRevealed);
    setHistory((h) =>
      [
        {
          id: `${Date.now()}-mine`,
          mines: minesCount,
          safe: safeOpened,
          mult: multSnap,
          payout: 0,
          outcome: "mine" as const,
        },
        ...h,
      ].slice(0, 12),
    );
    onNotify("Mine hit — round lost.", "error");
    scheduleBoardReset();
  };

  const handleCashout = () => {
    if (!roundActive || safeOpened < 1) return;
    const mult = minesMultiplier(safeOpened, minesCount);
    const payout = betAmount * mult;
    onResult(payout);
    setShowAllMines(true);
    setRoundActive(false);
    setCashoutGlow(true);
    setHistory((h) =>
      [
        {
          id: `${Date.now()}-out`,
          mines: minesCount,
          safe: safeOpened,
          mult,
          payout,
          outcome: "cashout" as const,
        },
        ...h,
      ].slice(0, 12),
    );
    scheduleBoardReset();
  };

  const handleTileClick = (index: number) => {
    if (!roundActive || revealed[index]) return;

    const isMine = mines.has(index);
    const nextRevealed = [...revealed];
    nextRevealed[index] = true;

    if (isMine) {
      endRoundWithMine(index, nextRevealed);
      return;
    }

    const nextSafe = safeOpened + 1;
    setRevealed(nextRevealed);
    setSafeOpened(nextSafe);
  };

  const clickingEnabled = roundActive && hitMineIndex === null;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-1">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#BFAF91]">Mines on field</p>
          <div className="grid grid-cols-4 gap-2">
            {MINES_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={roundActive}
                onClick={() => setMinesCount(n)}
                className={`rounded-xl border px-2 py-3 text-sm font-black transition ${
                  minesCount === n
                    ? "border-[#B11226] bg-[#2a1016] text-[#F2E3C6] shadow-[0_0_18px_rgba(177,18,38,0.35)]"
                    : "border-[#2A1D19] bg-[#0d0d0d] text-[#BFAF91] hover:border-[#5c3a32]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-[#BFAF91]">More mines = sharper multipliers. Demo RNG only.</p>
        </div>

        <BetPanel balance={balance} onBet={startRound} frozen={roundActive} />

        {roundActive && safeOpened > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            <Button variant="cream" className="h-16 w-full border-4 border-[#C9A45C] shadow-[0_0_28px_rgba(201,164,92,0.35)]" onClick={handleCashout}>
              CASHOUT {potentialCashout.toFixed(0)} DBAK
            </Button>
          </motion.div>
        )}
      </div>

      <div className="space-y-4 lg:col-span-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {roundActive && <Badge variant="red">ACTIVE ROUND</Badge>}
            <span className="rounded-full border border-[#3A0B10] bg-[#120a0c] px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#BFAF91]">
              Demo mode — fake coins only
            </span>
          </div>
          <div className="flex items-center gap-2 text-[#BFAF91]">
            <Flame size={16} className="text-[#B11226]" />
            <span className="text-xs font-bold uppercase tracking-widest">Mines</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Mines", value: minesCount },
            { label: "Safe opened", value: safeOpened },
            { label: "Multiplier", value: `${currentMultiplier.toFixed(2)}x` },
            { label: "Potential", value: `${Math.floor(potentialCashout)} DBAK` },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#2A1D19] bg-[#0d0d0d] px-3 py-3">
              <span className="block text-[8px] font-black uppercase tracking-widest text-[#BFAF91]">{s.label}</span>
              <span className="mt-1 block font-mono text-lg font-black text-[#F2E3C6]">{s.value}</span>
            </div>
          ))}
        </div>

        <motion.div
          animate={hitMineIndex !== null ? { x: [0, -7, 7, -7, 7, 0] } : {}}
          transition={{ duration: 0.45 }}
          className={`rounded-3xl border border-[#2A1D19] bg-[#15110F] p-4 sm:p-6 ${cashoutGlow ? "ring-2 ring-[#C9A45C]/60 shadow-[0_0_40px_rgba(201,164,92,0.35)]" : ""}`}
        >
          <motion.div
            className="grid max-w-xl grid-cols-5 gap-2 sm:gap-3"
            initial={false}
            animate={roundActive && safeOpened === 0 && hitMineIndex === null ? { opacity: [0.85, 1], transition: { duration: 0.4 } } : { opacity: 1 }}
          >
            {Array.from({ length: GRID_SIZE }, (_, index) => {
              const isMine = mines.has(index);
              const isRevealed = revealed[index];
              const showMine = isMine && (isRevealed || showAllMines);
              const showSafe = !isMine && isRevealed;
              const hidden = !showMine && !showSafe;

              return (
                <motion.button
                  key={index}
                  type="button"
                  disabled={!clickingEnabled || isRevealed}
                  onClick={() => handleTileClick(index)}
                  whileHover={clickingEnabled && hidden ? { y: -4, scale: 1.03 } : undefined}
                  whileTap={clickingEnabled && hidden ? { scale: 0.97 } : undefined}
                  className={`relative flex aspect-square items-center justify-center rounded-xl border text-sm font-black transition ${
                    hidden
                      ? "border-[#2A1D19] bg-[#0a0908] hover:border-[#5c3a32]"
                      : showMine
                        ? "border-[#B11226] bg-[#3A0B10] shadow-[0_0_22px_rgba(177,18,38,0.55)]"
                        : "border-[#C9A45C]/50 bg-gradient-to-br from-[#1a1410] to-[#0d0d0d] shadow-[0_0_20px_rgba(201,164,92,0.25)]"
                  } disabled:cursor-default disabled:opacity-90`}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {hidden && (
                      <motion.span
                        key="h"
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        className="text-[10px] uppercase tracking-widest text-[#5c4a40]"
                      >
                        ·
                      </motion.span>
                    )}
                    {showSafe && (
                      <motion.span
                        key="s"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 260, damping: 18 }}
                        className="flex items-center justify-center"
                      >
                        <Gem size={26} className="text-[#F2E3C6] drop-shadow-[0_0_10px_rgba(201,164,92,0.85)]" />
                      </motion.span>
                    )}
                    {showMine && (
                      <motion.span
                        key="m"
                        initial={{ scale: 0.2, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 14 }}
                        className="flex flex-col items-center justify-center gap-0.5"
                      >
                        <Bomb size={22} className="text-[#E21B35]" />
                        <Skull size={14} className="text-[#B11226]" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        <div className="rounded-2xl border border-[#2A1D19] bg-[#0d0d0d] p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#BFAF91]">Recent rounds</span>
            <ShieldCheck size={14} className="text-[#C9A45C]" />
          </div>
          {history.length === 0 ? (
            <p className="text-sm text-[#BFAF91]">No rounds yet. Place a bet to enter the grid.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {history.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1f1613] bg-[#15110F] px-3 py-2 font-mono text-xs text-[#F2E3C6]"
                >
                  <span className={row.outcome === "mine" ? "text-[#E21B35]" : "text-[#C9A45C]"}>{row.outcome === "mine" ? "Mine" : "Cashout"}</span>
                  <span className="text-[#BFAF91]">
                    {row.safe} safe · {row.mines} mines · {row.mult.toFixed(2)}x
                  </span>
                  <span>{row.payout > 0 ? `+${Math.floor(row.payout)}` : "—"}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

type PlinkoRisk = "low" | "medium" | "high";
const PLINKO_ROW_OPTIONS = [8, 10, 12] as const;
const PLINKO_SLOTS = 11;
const PLINKO_BOARD_W = 620;
const PLINKO_BOARD_H = 520;
const PLINKO_RAIL = 28;

const PLINKO_MULTS: Record<PlinkoRisk, readonly number[]> = {
  low: [0.4, 0.7, 1, 1.2, 1.6, 2, 1.6, 1.2, 1, 0.7, 0.4],
  medium: [0.2, 0.5, 0.8, 1.2, 2, 5, 2, 1.2, 0.8, 0.5, 0.2],
  high: [0, 0.2, 0.4, 0.8, 1.5, 12, 1.5, 0.8, 0.4, 0.2, 0],
};

const MAX_ACTIVE_BALLS = 5;

function plinkoPhysicsLayout(rows: number) {
  const pegGap = 44;
  const rowGap = 38;
  const pegRadius = 6;
  const ballRadius = 12;
  const cx = PLINKO_BOARD_W / 2;
  const topY = 48;
  const lastPegY = topY + (rows - 1) * rowGap;
  const slotBarTop = lastPegY + pegRadius + 18;
  const slotBarHeight = 54;
  const floorY = slotBarTop + slotBarHeight + 36;
  return { pegGap, rowGap, pegRadius, ballRadius, cx, topY, lastPegY, slotBarTop, slotBarHeight, floorY };
}

/** Ball center Y must be ≥ this before any win/loss UI — lower third of the multiplier rail. */
function plinkoSlotRowVisualMinY(rows: number): number {
  const { slotBarTop, slotBarHeight } = plinkoPhysicsLayout(rows);
  const slotRailTop = slotBarTop - 10;
  const slotRailH = slotBarHeight + 8;
  const slotRailBottom = slotRailTop + slotRailH;
  return slotRailBottom - 18;
}

function pegCenterX(cx: number, row: number, col: number, pegGap: number) {
  return cx - (row * pegGap) / 2 + col * pegGap;
}

function pegCenterY(topY: number, row: number, rowGap: number) {
  return topY + row * rowGap;
}

function slotMetrics(boardW: number) {
  const railW = boardW - PLINKO_RAIL * 2;
  const slotW = railW / PLINKO_SLOTS;
  return { railW, slotW };
}

function slotCenterX(idx: number, boardW: number) {
  const { slotW } = slotMetrics(boardW);
  return PLINKO_RAIL + (idx + 0.5) * slotW;
}

function xToSlotIndex(x: number, boardW: number): number {
  const { slotW } = slotMetrics(boardW);
  const rel = x - PLINKO_RAIL;
  const idx = Math.floor(rel / slotW);
  return Math.min(PLINKO_SLOTS - 1, Math.max(0, idx));
}

function buildPlinkoStatics(rows: number): Matter.Body[] {
  const L = plinkoPhysicsLayout(rows);
  const { pegGap, rowGap, pegRadius, cx, topY, slotBarTop, slotBarHeight, floorY } = L;
  const bodies: Matter.Body[] = [];
  const wallW = 16;
  bodies.push(
    Matter.Bodies.rectangle(wallW / 2, PLINKO_BOARD_H / 2 + 8, wallW, PLINKO_BOARD_H + 40, {
      isStatic: true,
      label: "wall_side",
      friction: 0.04,
      restitution: 0.25,
    }),
  );
  bodies.push(
    Matter.Bodies.rectangle(PLINKO_BOARD_W - wallW / 2, PLINKO_BOARD_H / 2 + 8, wallW, PLINKO_BOARD_H + 40, {
      isStatic: true,
      label: "wall_side",
      friction: 0.04,
      restitution: 0.25,
    }),
  );

  const funnelH = 120;
  const funnelY = slotBarTop - 32;
  const funnelW = 10;
  const ang = 0.14;
  bodies.push(
    Matter.Bodies.rectangle(PLINKO_RAIL + 24, funnelY, funnelW, funnelH, {
      isStatic: true,
      angle: ang,
      label: "funnel",
      friction: 0.02,
      restitution: 0.3,
    }),
  );
  bodies.push(
    Matter.Bodies.rectangle(PLINKO_BOARD_W - PLINKO_RAIL - 24, funnelY, funnelW, funnelH, {
      isStatic: true,
      angle: -ang,
      label: "funnel",
      friction: 0.02,
      restitution: 0.3,
    }),
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c <= r; c++) {
      const px = pegCenterX(cx, r, c, pegGap);
      const py = pegCenterY(topY, r, rowGap);
      bodies.push(
        Matter.Bodies.circle(px, py, pegRadius, {
          isStatic: true,
          friction: 0.02,
          restitution: 0.88,
          label: `peg_${r}_${c}`,
        }),
      );
    }
  }

  const { slotW } = slotMetrics(PLINKO_BOARD_W);
  const slotRailTop = slotBarTop - 10;
  const slotRailH = slotBarHeight + 8;
  const slotRailBottom = slotRailTop + slotRailH;
  const sensorH = 26;
  const sensorCy = slotRailBottom - sensorH / 2 - 10;
  for (let i = 0; i < PLINKO_SLOTS; i++) {
    const x = slotCenterX(i, PLINKO_BOARD_W);
    const sensor = Matter.Bodies.rectangle(x, sensorCy, slotW * 0.92, sensorH, {
      isStatic: true,
      isSensor: true,
      label: "slotSensor",
    });
    sensor.plugin = { slotIndex: i };
    bodies.push(sensor);
  }

  bodies.push(
    Matter.Bodies.rectangle(PLINKO_BOARD_W / 2, floorY, PLINKO_BOARD_W - 24, 22, {
      isStatic: true,
      label: "floor",
      friction: 0.45,
      restitution: 0.12,
    }),
  );

  bodies.push(
    Matter.Bodies.rectangle(cx, topY - 36, PLINKO_BOARD_W - 80, 12, {
      isStatic: true,
      label: "ceiling",
    }),
  );

  return bodies;
}

type PlinkoHistoryEntry = {
  id: string;
  ballId: number;
  risk: PlinkoRisk;
  rows: number;
  mult: number;
  payout: number;
  bet: number;
  net: number;
};

type PlinkoPendingReveal = {
  slotIndex: number;
  fromFallback: boolean;
  mult: number;
  payout: number;
  net: number;
  slotRowMinY: number;
};

type PlinkoActiveBall = {
  id: number;
  betAmount: number;
  body: Matter.Body;
  hasLanded: boolean;
  spawnTime: number;
  riskSnap: PlinkoRisk;
  rowsSnap: number;
  fallbackId: number | null;
  revealSafetyId: number | null;
  pendingReveal: PlinkoPendingReveal | null;
  payoutApplied: boolean;
};

function PlinkoGame({
  balance,
  onResult,
  onNotify,
}: {
  balance: number;
  onResult: (delta: number) => void;
  onNotify: (msg: string, type?: NotificationType, meta?: { net?: number }) => void;
}) {
  const [risk, setRisk] = useState<PlinkoRisk>("medium");
  const [rows, setRows] = useState<(typeof PLINKO_ROW_OPTIONS)[number]>(10);
  const [ballsUI, setBallsUI] = useState<{ id: number; x: number; y: number; angle: number; glow: number }[]>([]);
  const [activeBallCount, setActiveBallCount] = useState(0);
  const [totalActiveStake, setTotalActiveStake] = useState(0);
  const [activePegKey, setActivePegKey] = useState<string | null>(null);
  const [landingIdx, setLandingIdx] = useState<number | null>(null);
  const [slotPulseKey, setSlotPulseKey] = useState(0);
  const [lastMult, setLastMult] = useState<number | null>(null);
  const [lastPayout, setLastPayout] = useState(0);
  const [history, setHistory] = useState<PlinkoHistoryEntry[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const pegClearRef = useRef<number | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [boardScale, setBoardScale] = useState(1);

  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const activeBallsRef = useRef<Map<number, PlinkoActiveBall>>(new Map());
  const ballIdRef = useRef(0);
  const finishBallRef = useRef<(ballId: number, slotIndex: number, fromFallback: boolean) => void>(() => {});
  const onResultRef = useRef(onResult);
  const onNotifyRef = useRef(onNotify);

  useEffect(() => {
    onResultRef.current = onResult;
    onNotifyRef.current = onNotify;
  }, [onResult, onNotify]);

  const mults = PLINKO_MULTS[risk];
  const layout = useMemo(() => plinkoPhysicsLayout(rows), [rows]);
  const { pegGap, rowGap, pegRadius, ballRadius, cx, topY, slotBarTop, slotBarHeight } = layout;

  const dust = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        x: 8 + ((i * 37) % 84),
        y: 10 + ((i * 23) % 70),
        d: 2.5 + (i % 3),
        delay: i * 0.12,
      })),
    [],
  );

  const clearAllTimeouts = () => {
    timeoutsRef.current.forEach((id) => clearTimeout(id));
    timeoutsRef.current = [];
    if (pegClearRef.current) {
      clearTimeout(pegClearRef.current);
      pegClearRef.current = null;
    }
  };

  const schedule = (fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    timeoutsRef.current.push(id);
    return id;
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth || PLINKO_BOARD_W;
      setBoardScale(Math.min(1, w / PLINKO_BOARD_W));
    });
    ro.observe(el);
    setBoardScale(Math.min(1, el.clientWidth / PLINKO_BOARD_W));
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const engine = Matter.Engine.create({
      positionIterations: 10,
      velocityIterations: 8,
      constraintIterations: 3,
    });
    engine.gravity.y = 1.12;
    engine.gravity.scale = 0.001;
    engineRef.current = engine;

    const statics = buildPlinkoStatics(rows);
    Matter.World.add(engine.world, statics);

    const runner = Matter.Runner.create();
    runnerRef.current = runner;
    Matter.Runner.run(runner, engine);

    const ballsMapForCleanup = activeBallsRef.current;

    const syncStakeAndCount = () => {
      let stake = 0;
      for (const e of activeBallsRef.current.values()) stake += e.betAmount;
      setTotalActiveStake(stake);
      setActiveBallCount(activeBallsRef.current.size);
    };

    const applyBallPayout = (ballId: number) => {
      const entry = activeBallsRef.current.get(ballId);
      if (!entry || entry.payoutApplied || !entry.pendingReveal) return;
      if (entry.revealSafetyId !== null) {
        clearTimeout(entry.revealSafetyId);
        entry.revealSafetyId = null;
      }

      const p = entry.pendingReveal;
      entry.pendingReveal = null;
      entry.payoutApplied = true;

      if (p.fromFallback) {
        console.warn("Fallback landing used", { ballId, slotIndex: p.slotIndex, x: entry.body.position.x });
      }
      console.log("BALL LANDED IN SLOT", p.slotIndex, p.mult, "ball", ballId);

      if (p.payout > 0) onResultRef.current(p.payout);
      setLastMult(p.mult);
      setLastPayout(p.payout);
      setLandingIdx(p.slotIndex);
      setSlotPulseKey((k) => k + 1);

      const net = p.net;
      const netAbs = Math.abs(net);
      if (netAbs >= 100) {
        if (p.mult === 0) {
          onNotifyRef.current(`#${ballId} -${entry.betAmount} DBAK`, "error", { net });
        } else if (net >= 500) {
          onNotifyRef.current(`BIG WIN +${Math.floor(p.payout)} DBAK`, "success", { net });
        } else {
          const line =
            net >= 0 ? `#${ballId} +${Math.floor(net)} DBAK` : `#${ballId} ${Math.floor(net)} DBAK`;
          onNotifyRef.current(line, net < 0 ? "error" : "success", { net });
        }
      }

      setHistory((h) =>
        [
          {
            id: `${Date.now()}-${ballId}`,
            ballId,
            risk: entry.riskSnap,
            rows: entry.rowsSnap,
            mult: p.mult,
            payout: p.payout,
            bet: entry.betAmount,
            net: p.net,
          },
          ...h,
        ].slice(0, 12),
      );

      schedule(() => {
        setLandingIdx(null);
      }, 720);

      schedule(() => {
        const e = activeBallsRef.current.get(ballId);
        if (!e) return;
        try {
          Matter.World.remove(engine.world, e.body);
        } catch {
          /* noop */
        }
        activeBallsRef.current.delete(ballId);
        syncStakeAndCount();
        setBallsUI(
          Array.from(activeBallsRef.current.values()).map((ev) => ({
            id: ev.id,
            x: ev.body.position.x,
            y: ev.body.position.y,
            angle: ev.body.angle,
            glow: 0.52 + (ev.id % 5) * 0.07,
          })),
        );
      }, 800);
    };

    const finishBall = (ballId: number, slotIndex: number, fromFallback: boolean) => {
      const entry = activeBallsRef.current.get(ballId);
      if (!entry || entry.hasLanded) return;
      if (slotIndex < 0 || slotIndex >= PLINKO_SLOTS) return;

      entry.hasLanded = true;
      if (entry.fallbackId !== null) {
        clearTimeout(entry.fallbackId);
        entry.fallbackId = null;
      }

      Matter.Body.setVelocity(entry.body, {
        x: entry.body.velocity.x * 0.35,
        y: entry.body.velocity.y * 0.2,
      });
      Matter.Body.setAngularVelocity(entry.body, entry.body.angularVelocity * 0.4);

      const mult = PLINKO_MULTS[entry.riskSnap][slotIndex];
      const payout = entry.betAmount * mult;
      const net = payout - entry.betAmount;
      const slotRowMinY = plinkoSlotRowVisualMinY(entry.rowsSnap);

      entry.pendingReveal = {
        slotIndex,
        fromFallback,
        mult,
        payout,
        net,
        slotRowMinY,
      };

      if (entry.revealSafetyId !== null) {
        clearTimeout(entry.revealSafetyId);
        entry.revealSafetyId = null;
      }
      entry.revealSafetyId = window.setTimeout(() => {
        entry.revealSafetyId = null;
        applyBallPayout(ballId);
      }, 2600);

      if (entry.body.position.y >= slotRowMinY) {
        applyBallPayout(ballId);
      }
    };

    finishBallRef.current = finishBall;

    const afterUpdate = () => {
      const list: { id: number; x: number; y: number; angle: number; glow: number }[] = [];
      for (const e of activeBallsRef.current.values()) {
        list.push({
          id: e.id,
          x: e.body.position.x,
          y: e.body.position.y,
          angle: e.body.angle,
          glow: 0.52 + (e.id % 5) * 0.07,
        });
        const pending = e.pendingReveal;
        if (pending && !e.payoutApplied && e.body.position.y >= pending.slotRowMinY) {
          applyBallPayout(e.id);
        }
      }
      setBallsUI(list);
    };
    Matter.Events.on(engine, "afterUpdate", afterUpdate);

    const readBallId = (body: Matter.Body): number | null => {
      const plug = body.plugin as { ballId?: unknown } | undefined;
      if (plug && typeof plug.ballId === "number") return plug.ballId;
      const m = /^plinko-ball-(\d+)$/.exec(body.label);
      return m ? parseInt(m[1], 10) : null;
    };

    const onCollision = (e: Matter.IEventCollision<Matter.Engine>) => {
      const pairs = e.pairs;
      for (let i = 0; i < pairs.length; i++) {
        const { bodyA, bodyB } = pairs[i];
        let ballBody: Matter.Body | null = null;
        let other: Matter.Body | null = null;
        if (bodyA.label.startsWith("plinko-ball-")) {
          ballBody = bodyA;
          other = bodyB;
        } else if (bodyB.label.startsWith("plinko-ball-")) {
          ballBody = bodyB;
          other = bodyA;
        }
        if (!ballBody || !other) continue;

        if (other.label.startsWith("peg_")) {
          const key = other.label.slice(4);
          setActivePegKey(key);
          if (pegClearRef.current) clearTimeout(pegClearRef.current);
          pegClearRef.current = window.setTimeout(() => {
            setActivePegKey(null);
            pegClearRef.current = null;
          }, 150);
          continue;
        }

        if (other.label !== "slotSensor") continue;
        const raw =
          other.plugin && typeof (other.plugin as { slotIndex?: unknown }).slotIndex === "number"
            ? (other.plugin as { slotIndex: number }).slotIndex
            : -1;
        if (raw < 0 || raw >= PLINKO_SLOTS) continue;

        const bid = readBallId(ballBody);
        if (bid === null) continue;
        finishBall(bid, raw, false);
        break;
      }
    };
    Matter.Events.on(engine, "collisionStart", onCollision);

    return () => {
      Matter.Events.off(engine, "afterUpdate", afterUpdate);
      Matter.Events.off(engine, "collisionStart", onCollision);
      const snapshot = new Map(ballsMapForCleanup);
      for (const e of snapshot.values()) {
        if (e.fallbackId !== null) clearTimeout(e.fallbackId);
        if (e.revealSafetyId !== null) clearTimeout(e.revealSafetyId);
        try {
          Matter.World.remove(engine.world, e.body);
        } catch {
          /* noop */
        }
      }
      ballsMapForCleanup.clear();
      setBallsUI([]);
      setActiveBallCount(0);
      setTotalActiveStake(0);
      Matter.Runner.stop(runner);
      Matter.World.clear(engine.world, false);
      Matter.Engine.clear(engine);
      engineRef.current = null;
      runnerRef.current = null;
    };
  }, [rows]);

  const startDrop = (amount: number) => {
    if (activeBallsRef.current.size >= MAX_ACTIVE_BALLS) return;
    if (amount > balance || amount <= 0) return;
    const engine = engineRef.current;
    if (!engine) return;

    onResult(-amount);
    const id = ++ballIdRef.current;
    const spawnY = topY - 22;
    const ox = (Math.random() - 0.5) * 28;
    const spawnX = Math.min(PLINKO_BOARD_W - PLINKO_RAIL - 24, Math.max(PLINKO_RAIL + 24, cx + ox));

    const ball = Matter.Bodies.circle(spawnX, spawnY, ballRadius, {
      restitution: 0.74,
      friction: 0.02,
      frictionAir: 0.01,
      density: 0.001,
      label: `plinko-ball-${id}`,
    });
    ball.plugin = { ballId: id, betAmount: amount };

    const entry: PlinkoActiveBall = {
      id,
      betAmount: amount,
      body: ball,
      hasLanded: false,
      spawnTime: Date.now(),
      riskSnap: risk,
      rowsSnap: rows,
      fallbackId: window.setTimeout(() => {
        const e = activeBallsRef.current.get(id);
        if (!e || e.hasLanded) return;
        const idx = xToSlotIndex(e.body.position.x, PLINKO_BOARD_W);
        console.warn("Fallback landing used", id);
        finishBallRef.current(id, idx, true);
      }, 8000),
      revealSafetyId: null,
      pendingReveal: null,
      payoutApplied: false,
    };

    activeBallsRef.current.set(id, entry);
    Matter.World.add(engine.world, ball);

    let stake = 0;
    for (const e of activeBallsRef.current.values()) stake += e.betAmount;
    setTotalActiveStake(stake);
    setActiveBallCount(activeBallsRef.current.size);
    setBallsUI(
      Array.from(activeBallsRef.current.values()).map((ev) => ({
        id: ev.id,
        x: ev.body.position.x,
        y: ev.body.position.y,
        angle: ev.body.angle,
        glow: 0.52 + (ev.id % 5) * 0.07,
      })),
    );

    const fx = (Math.random() - 0.5) * 0.00055 * ball.mass;
    Matter.Body.applyForce(ball, ball.position, { x: fx, y: 0.00002 * ball.mass });
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div className="w-full shrink-0 space-y-4 lg:max-w-[300px]">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-5">
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#BFAF91]">Risk</p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as const).map((r) => (
              <button
                key={r}
                type="button"
                disabled={activeBallCount > 0}
                onClick={() => setRisk(r)}
                className={`rounded-xl border px-2 py-2.5 text-[10px] font-black uppercase tracking-wide transition ${
                  risk === r
                    ? "border-[#B11226] bg-[#2a1016] text-[#F2E3C6] shadow-[0_0_16px_rgba(177,18,38,0.3)]"
                    : "border-[#2A1D19] bg-[#0d0d0d] text-[#BFAF91] hover:border-[#5c3a32]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#BFAF91]">Rows</p>
          <div className="grid grid-cols-3 gap-2">
            {PLINKO_ROW_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={activeBallCount > 0}
                onClick={() => setRows(n)}
                className={`rounded-xl border px-2 py-2.5 text-sm font-black transition ${
                  rows === n ? "border-[#B11226] bg-[#2a1016] text-[#F2E3C6]" : "border-[#2A1D19] bg-[#0d0d0d] text-[#BFAF91] hover:border-[#5c3a32]"
                } disabled:cursor-not-allowed disabled:opacity-40`}
              >
                {n}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[9px] leading-relaxed text-[#BFAF91]">Client-side fake coin simulation only.</p>
        </div>
        <BetPanel
          balance={balance}
          onBet={startDrop}
          betButtonLabel={
            activeBallCount >= MAX_ACTIVE_BALLS
              ? `MAX ${MAX_ACTIVE_BALLS} BALLS`
              : activeBallCount > 0
                ? "DROP ANOTHER"
                : undefined
          }
          betButtonExtraDisabled={activeBallCount >= MAX_ACTIVE_BALLS}
        />
      </div>

      <div className="relative min-w-0 flex-1 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {activeBallCount > 0 && <Badge variant="red">Live drop · {activeBallCount}</Badge>}
            <Badge variant="outline">DEMO PHYSICS ENGINE</Badge>
            <span className="rounded-full border border-[#3A0B10] bg-[#120a0c] px-2.5 py-1 text-[8px] font-bold uppercase tracking-widest text-[#BFAF91]">
              Demo mode — fake coins only
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Active balls", value: `${activeBallCount} / ${MAX_ACTIVE_BALLS}` },
            { label: "Total stake", value: totalActiveStake > 0 ? `${totalActiveStake} DBAK` : "—" },
            { label: "Risk", value: risk },
            { label: "Rows", value: rows },
            {
              label: "Last mult",
              value: lastMult !== null ? `${lastMult.toFixed(2)}x` : "—",
            },
            { label: "Last payout", value: lastMult !== null ? `${Math.floor(lastPayout)} DBAK` : "—" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-[#2A1D19] bg-[#0d0d0d] px-3 py-2">
              <span className="block text-[8px] font-black uppercase tracking-widest text-[#BFAF91]">{s.label}</span>
              <span className="mt-0.5 block font-mono text-xs font-black capitalize text-[#F2E3C6] sm:text-sm">{s.value}</span>
            </div>
          ))}
        </div>

        <div
          ref={wrapRef}
          className="relative w-full max-w-full overflow-hidden rounded-2xl border-2 border-[#5c3a32] shadow-[0_0_0_1px_rgba(177,18,38,0.25),inset_0_1px_0_rgba(242,227,198,0.06)]"
          style={{
            background: "radial-gradient(120% 90% at 50% 0%, #1a120f 0%, #080605 45%, #050505 100%)",
            boxShadow: "0 0 40px rgba(177,18,38,0.18), inset 0 0 80px rgba(0,0,0,0.5)",
          }}
        >
          <div className="pointer-events-none absolute left-3 top-2 z-[40] max-w-[70%] text-[9px] font-black uppercase tracking-[0.2em] text-[#BFAF91]/80">
            Demo physics engine
          </div>
          <div className="pointer-events-none absolute bottom-2 right-3 z-[40] text-[8px] text-[#5c4a40]">
            Matter.js rigid body — demo only
          </div>
          {dust.map((d) => (
            <motion.span
              key={d.id}
              className="pointer-events-none absolute rounded-full bg-[#C9A45C]/20"
              style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.d, height: d.d }}
              animate={{ opacity: [0.15, 0.45, 0.15], y: [0, 6, 0] }}
              transition={{ duration: 4 + d.id * 0.1, repeat: Infinity, delay: d.delay }}
            />
          ))}
          <div
            className="plinko-inner mx-auto max-w-full"
            style={{
              width: PLINKO_BOARD_W,
              height: PLINKO_BOARD_H,
              transform: `scale(${boardScale})`,
              transformOrigin: "top center",
            }}
          >
            <div className="relative" style={{ width: PLINKO_BOARD_W, height: PLINKO_BOARD_H }}>
              <div
                className="pointer-events-none absolute inset-0 z-[1] rounded-xl"
                style={{
                  boxShadow: "inset 0 0 60px rgba(177,18,38,0.12)",
                }}
              />

              {Array.from({ length: rows }, (_, r) =>
                Array.from({ length: r + 1 }, (_, c) => {
                  const px = pegCenterX(cx, r, c, pegGap);
                  const py = pegCenterY(topY, r, rowGap);
                  const hit = activePegKey === `${r}_${c}`;
                  const d = pegRadius * 2;
                  return (
                    <div
                      key={`p-${r}-${c}`}
                      className="absolute z-[2] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#3d2a22]/80 transition-[transform,box-shadow,background] duration-100"
                      style={{
                        left: px,
                        top: py,
                        width: d,
                        height: d,
                        background: hit
                          ? "radial-gradient(circle at 30% 30%, #fff6dc, #C9A45C)"
                          : "radial-gradient(circle at 30% 30%, #bfaf91, #4a3a32)",
                        boxShadow: hit ? "0 0 16px rgba(201,164,92,0.95)" : "0 0 6px rgba(242,227,198,0.12)",
                        transform: hit ? "scale(1.2)" : "scale(1)",
                      }}
                    />
                  );
                }),
              ).flat()}

              <div
                className="absolute left-[28px] right-[28px] z-[4] rounded-lg border border-[#2A1D19] bg-[#0a0807]/95"
                style={{ top: slotBarTop - 10, height: slotBarHeight + 8 }}
              >
                <div className="absolute inset-x-0 top-1 h-1 rounded-full bg-gradient-to-r from-transparent via-[#B11226]/35 to-transparent" />
                <div className="absolute inset-y-2 left-0 flex min-w-0 w-full">
                  {mults.map((m, idx) => {
                    const land = landingIdx === idx;
                    const isLoss = m === 0;
                    const isJackpot = m >= 5;
                    return (
                      <div
                        key={idx}
                        className="relative flex flex-1 items-center justify-center border-r border-[#2A1D19] last:border-r-0"
                      >
                        <motion.div
                          key={`slotcell-${idx}-${landingIdx === idx ? slotPulseKey : 0}`}
                          className={`flex w-[92%] flex-col items-center justify-center rounded-md border py-1.5 text-[9px] font-black sm:text-[10px] ${
                            isLoss
                              ? "border-[#5a1018] bg-[#2a0a0e] text-[#E21B35] shadow-[inset_0_0_12px_rgba(90,16,24,0.5)]"
                              : isJackpot
                                ? "border-[#8a7038] bg-gradient-to-b from-[#2a2210] to-[#120d08] text-[#F2E3C6] shadow-[0_0_14px_rgba(201,164,92,0.25)]"
                                : "border-[#2A1D19] bg-[#14100e] text-[#BFAF91]"
                          }`}
                          animate={
                            land
                              ? {
                                  scale: [1, 1.1, 1],
                                  boxShadow: [
                                    isLoss
                                      ? "0 0 0 transparent"
                                      : isJackpot
                                        ? "0 0 0 transparent"
                                        : "0 0 0 transparent",
                                    isLoss
                                      ? "0 0 28px rgba(226,27,53,0.85)"
                                      : isJackpot
                                        ? "0 0 32px rgba(201,164,92,0.9)"
                                        : "0 0 18px rgba(201,164,92,0.45)",
                                    "0 0 0 transparent",
                                  ],
                                }
                              : {}
                          }
                          transition={{ duration: 0.45, repeat: land ? 1 : 0 }}
                        >
                          <span className={isJackpot ? "text-[#C9A45C]" : ""}>{m}x</span>
                        </motion.div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {ballsUI.map((b) => (
                <div
                  key={b.id}
                  className="pointer-events-none absolute z-[25] flex h-[24px] w-[24px] items-center justify-center rounded-full border-2 border-[#ff4d5c]"
                  style={{
                    left: b.x,
                    top: b.y,
                    transform: `translate(-50%, -50%) rotate(${b.angle}rad)`,
                    background: "radial-gradient(circle at 30% 25%, #ffb3b8, #B11226 55%, #3A0B10)",
                    boxShadow: `0 0 16px rgba(226,27,53,${b.glow}), 0 0 32px rgba(177,18,38,${0.28 + b.glow * 0.15})`,
                  }}
                >
                  <span className="text-[7px] font-black leading-none text-[#F2E3C6]/90">{b.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#2A1D19] bg-[#0d0d0d] p-3">
          <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-[#BFAF91]">Recent drops</span>
          {history.length === 0 ? (
            <p className="text-sm text-[#BFAF91]">No drops yet.</p>
          ) : (
            <ul className="space-y-1.5 text-[11px]">
              {history.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#1f1613] bg-[#15110F] px-2 py-1.5 font-mono text-[#F2E3C6]"
                >
                  <span className="text-[#BFAF91]">
                    #{row.ballId} · {row.risk} · {row.rows}r
                  </span>
                  <span className={row.mult === 0 ? "text-[#E21B35]" : "text-[#C9A45C]"}>{row.mult.toFixed(2)}x</span>
                  <span>{Math.floor(row.payout)}</span>
                  <span className={row.net >= 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>
                    net {row.net >= 0 ? "+" : ""}
                    {Math.floor(row.net)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Homepage({ onPlay }: { onPlay: (view: string) => void }) {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div className="space-y-24 pb-24">
      <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <motion.div style={{ y }} className="absolute inset-0 z-0 flex items-center justify-center opacity-10 select-none pointer-events-none">
          <h1 className="text-[25vw] font-black text-[#F2E3C6] leading-none font-display">MADBAK</h1>
        </motion.div>

        <div className="relative z-10 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge variant="red">NOW ENTERING THE HOUSE</Badge>
            <h2 className="text-6xl md:text-8xl font-black text-[#F2E3C6] tracking-tighter mt-6 mb-8 uppercase italic font-display">
              WELCOME TO HOUSE OF BET
            </h2>
            <p className="text-[#BFAF91] text-lg max-w-2xl mx-auto mb-12 uppercase tracking-wide font-medium">
              A next-generation betting and casino platform built for speed, strategy, and high-stakes entertainment. Enter a world of live odds, instant games, and premium play.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => onPlay("casino")} className="w-full sm:w-auto">
                Enter Casino Floor
              </Button>
              <Button size="lg" variant="secondary" onClick={() => onPlay("sports")} className="w-full sm:w-auto">
                Sportsbook
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-2xl font-black text-white uppercase italic font-display">Originals</h3>
            <p className="text-[10px] text-[#BFAF91] uppercase tracking-[0.3em]">Exclusive Madbak House Mechanics</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onPlay("casino")}>
            View All
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {GAMES.slice(0, 5).map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlay} />
          ))}
        </div>
      </section>

      <section className="bg-[#0D0D0D] py-12 border-y border-[#2A1D19]">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Live Demo Activity</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] text-[#BFAF91] uppercase tracking-widest border-b border-[#2A1D19]">
                  <th className="py-4 font-bold">Game</th>
                  <th className="py-4 font-bold">User</th>
                  <th className="py-4 font-bold">Bet</th>
                  <th className="py-4 font-bold">Multiplier</th>
                  <th className="py-4 font-bold">Payout</th>
                </tr>
              </thead>
              <tbody className="text-sm font-bold text-white">
                {MOCK_BETS.map((bet, idx) => (
                  <tr key={idx} className="border-b border-[#15110F] hover:bg-[#15110F]/50 transition-colors">
                    <td className="py-4 flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-[#15110F] flex items-center justify-center">
                        <Zap size={12} className="text-[#B11226]" />
                      </div>
                      {bet.game}
                    </td>
                    <td className="py-4 text-[#BFAF91]">{bet.user}</td>
                    <td className="py-4 font-mono">{bet.amount} DBAK</td>
                    <td className="py-4 text-[#C9A45C]">{bet.multiplier}</td>
                    <td className="py-4 font-mono">{bet.payout > 0 ? `+${bet.payout}` : "0"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8">
        <div className="bg-gradient-to-br from-[#15110F] to-[#050505] rounded-[3rem] p-8 md:p-16 border border-[#2A1D19] relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Crown size={300} color={COLORS.red} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <Badge variant="red">ELITE MEMBERSHIP</Badge>
            <h2 className="text-4xl md:text-6xl font-black text-white mt-4 mb-6 uppercase tracking-tighter italic font-display">
              MADBAK <span className="text-[#C9A45C]">ROYAL</span> CLUB
            </h2>
            <p className="text-[#BFAF91] mb-12">
              Level up your demo experience. Earn virtual rakeback, unlock custom badges, and climb the leaderboard. Only for the most dedicated house members.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div>
                <h5 className="text-[#C9A45C] font-black text-lg">CRIMSON</h5>
                <p className="text-[10px] text-[#BFAF91] uppercase">2,500 XP Needed</p>
              </div>
              <div>
                <h5 className="text-[#C9A45C] font-black text-lg">OBSIDIAN</h5>
                <p className="text-[10px] text-[#BFAF91] uppercase">10,000 XP Needed</p>
              </div>
              <div>
                <h5 className="text-[#C9A45C] font-black text-lg">ELITE</h5>
                <p className="text-[10px] text-[#BFAF91] uppercase">Invitation Only</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function KycRegulatedGate({ onGoVerify }: { onGoVerify: () => void }) {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16 md:px-8">
      <div className="rounded-2xl border border-[#C9A45C]/40 bg-[#15110F] p-10 text-center">
        <ShieldCheck className="mx-auto mb-4 text-[#C9A45C]" size={48} />
        <h2 className="font-display text-3xl font-black uppercase italic text-white">Identity verification required</h2>
        <p className="mt-4 text-sm text-[#BFAF91]">
          This demo simulates regulated areas. Complete demo KYC (approved tier) to unlock this module. No real-money features
          exist in this build.
        </p>
        <Button className="mt-8" onClick={onGoVerify}>
          Go to verification
        </Button>
      </div>
    </div>
  );
}

export function MadbakHouseApp() {
  const user = useCurrentUser();
  const adjustBalance = useAuthStore((s) => s.adjustBalance);
  const logout = useAuthStore((s) => s.logout);
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  const [view, setView] = useState("home");
  const [sportsMatchFocusId, setSportsMatchFocusId] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState<"login" | "signup">("login");
  const [authMountKey, setAuthMountKey] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const toastTimersRef = useRef<Map<number, number>>(new Map());
  const notificationSeqRef = useRef(0);

  const clearToastTimer = (id: number) => {
    const t = toastTimersRef.current.get(id);
    if (t !== undefined) {
      clearTimeout(t);
      toastTimersRef.current.delete(id);
    }
  };

  const dismissNotification = (id: number) => {
    clearToastTimer(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const addNotification = (
    msg: string,
    type: NotificationType = "success",
    duration = 1200,
    priority: NotificationPriority = "normal",
  ) => {
    const id = ++notificationSeqRef.current;
    const resolvedDuration = priority === "big" ? Math.max(duration, 2200) : duration;
    setNotifications((prev) => {
      const next = [...prev, { id, msg, type, duration: resolvedDuration, priority }];
      if (next.length > 3) {
        next.slice(0, next.length - 3).forEach((d) => clearToastTimer(d.id));
      }
      return next.slice(-3);
    });
    const tid = window.setTimeout(() => {
      toastTimersRef.current.delete(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, resolvedDuration);
    toastTimersRef.current.set(id, tid);
  };

  const routePlinkoOrNotify = (msg: string, type: NotificationType = "success", meta?: { net?: number }) => {
    if (view === "game-plinko" && meta?.net !== undefined) {
      const a = Math.abs(meta.net);
      if (a < 100) return;
      if (meta.net >= 500) {
        addNotification(msg, type, 2200, "big");
        return;
      }
      addNotification(msg, type, 1200, "normal");
      return;
    }
    addNotification(msg, type, 1200, "normal");
  };

  const handleGameResult = (payout: number) => {
    if (!user) return;
    const slug = view.startsWith("game-") ? view.slice(5) : "lobby";
    adjustBalance(payout, { game: slug });
    if (payout > 0) {
      const pr: NotificationPriority = payout >= 500 ? "big" : "normal";
      const dur = pr === "big" ? 2200 : 1200;
      addNotification(`+${Math.floor(payout)} DBAK`, "success", dur, pr);
    } else if (payout < 0) {
      addNotification(`-${Math.floor(Math.abs(payout))} DBAK`, "error", 1200, "normal");
    }
  };

  const guardedSetView = (v: string) => {
    if (v === "admin" && user?.role !== "admin") {
      addNotification("Admin access only.", "error", 1200, "normal");
      return;
    }
    const loginWall =
      v.startsWith("game-") ||
      v === "wallet" ||
      v === "profile" ||
      v === "verify" ||
      v === "security" ||
      v === "rewards";
    if (loginWall && !user) {
      setAuthTab("login");
      setAuthMountKey((k) => k + 1);
      setAuthOpen(true);
      addNotification("Login required", "info", 1200, "normal");
      return;
    }
    setView(v);
  };

  useEffect(() => {
    void initializeAuth();
    return useAuthStore.persist.onFinishHydration(() => {
      void initializeAuth();
      useAuthStore.getState().setHasHydrated(true);
    });
  }, [initializeAuth]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  const balance = user?.balance ?? 0;

  const requestAuth = (tab: "login" | "signup") => {
    setAuthTab(tab);
    setAuthMountKey((k) => k + 1);
    setAuthOpen(true);
  };

  const renderView = () => {
    switch (view) {
      case "home":
        return <Homepage onPlay={guardedSetView} />;
      case "casino":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8 pb-24">
            <div className="mb-12">
              <h1 className="text-4xl font-black text-white italic uppercase mb-2 font-display">Casino Lobby</h1>
              <p className="text-[#BFAF91] uppercase tracking-widest text-xs">All Demo Original & Licensed Games</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {GAMES.map((game) => (
                <GameCard key={game.id} game={game} onPlay={guardedSetView} />
              ))}
            </div>
          </div>
        );
      case "game-crash":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8">
            <div className="flex items-center gap-4 mb-8">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] hover:text-white transition-colors">
                <LayoutGrid size={24} />
              </button>
              <h1 className="text-3xl font-black text-white uppercase italic font-display">Crash</h1>
              <Badge variant="red">99% RTP</Badge>
            </div>
            <CrashGame balance={balance} onResult={handleGameResult} />
          </div>
        );
      case "game-dice":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8">
            <div className="flex items-center gap-4 mb-8">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] hover:text-white transition-colors">
                <LayoutGrid size={24} />
              </button>
              <h1 className="text-3xl font-black text-white uppercase italic font-display">Dice</h1>
              <Badge variant="red">98.5% RTP</Badge>
            </div>
            <DiceGame balance={balance} onResult={handleGameResult} />
          </div>
        );
      case "game-mines":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8 pb-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Mines</h1>
              <Badge variant="red">97% RTP</Badge>
            </div>
            <MinesGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success") => addNotification(msg, type)}
            />
          </div>
        );
      case "game-plinko":
        return (
          <div className="container mx-auto px-4 md:px-8 pb-8 pt-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Plinko</h1>
              <Badge variant="red">Demo physics</Badge>
            </div>
            <PlinkoGame balance={balance} onResult={handleGameResult} onNotify={routePlinkoOrNotify} />
          </div>
        );
      case "game-blackjack":
        return (
          <div className="container mx-auto max-w-6xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Blackjack</h1>
              <Badge variant="red">Demo 21</Badge>
            </div>
            <BlackjackGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-roulette":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Roulette</h1>
              <Badge variant="red">European demo</Badge>
            </div>
            <RouletteGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-slots":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Slots</h1>
              <Badge variant="red">5x3 demo</Badge>
            </div>
            <SlotsGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-jackpot-slots":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Jackpot Slots</h1>
              <Badge variant="red">High variance mode</Badge>
            </div>
            <SlotsGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-classic-slots":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Classic Slots</h1>
              <Badge variant="red">Retro mode</Badge>
            </div>
            <SlotsGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-coinflip":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Coinflip</h1>
              <Badge variant="red">Heads / Tails</Badge>
            </div>
            <CoinflipGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-keno":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Keno</h1>
              <Badge variant="red">1 to 40 · pick up to 10</Badge>
            </div>
            <KenoGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-baccarat":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Baccarat</h1>
              <Badge variant="red">Player · Banker · Tie</Badge>
            </div>
            <BaccaratGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "live-casino":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Live Casino</h1>
              <Badge variant="red">Dealer duel</Badge>
            </div>
            <LiveCasinoGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "game-shows":
        return (
          <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
            <div className="mb-8 flex flex-wrap items-center gap-4">
              <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                <LayoutGrid size={24} />
              </button>
              <h1 className="font-display text-3xl font-black uppercase italic text-white">Game Shows</h1>
              <Badge variant="red">Pick a door</Badge>
            </div>
            <GameShowsGame
              balance={balance}
              onResult={handleGameResult}
              onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
            />
          </div>
        );
      case "terms":
        return (
          <div className="container mx-auto max-w-3xl px-4 py-10 md:px-8">
            <h1 className="font-display text-4xl font-black uppercase italic text-white">Terms (demo)</h1>
            <p className="mt-4 text-sm leading-relaxed text-[#BFAF91]">
              This portfolio build ships without legal terms of service for real wagering. Any future production deployment
              would require counsel-approved documents, jurisdiction disclosures, and licensed operator agreements.
            </p>
            <Button className="mt-8" variant="secondary" onClick={() => setView("home")}>
              Back home
            </Button>
          </div>
        );
      case "wallet":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8 max-w-4xl">
            <div className="bg-[#15110F] border border-[#2A1D19] rounded-3xl p-12 text-center">
              <div className="w-20 h-20 bg-[#C9A45C]/10 rounded-full flex items-center justify-center text-[#C9A45C] mx-auto mb-8">
                <Wallet size={40} />
              </div>
              <h1 className="text-4xl font-black text-white mb-2 uppercase font-display">Your Demo Wallet</h1>
              <p className="text-[#BFAF91] mb-12 uppercase tracking-widest text-xs">Madbak Portfolio Currency Only</p>

              <div className="bg-[#0D0D0D] p-8 rounded-2xl border border-[#2A1D19] mb-8">
                <span className="text-[10px] text-[#BFAF91] uppercase tracking-[0.5em] block mb-4">Total Balance</span>
                <div className="text-6xl font-black text-[#F2E3C6] font-mono tracking-tighter">
                  {formatCurrency(balance)} <span className="text-2xl text-[#C9A45C]">DBAK</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-6 bg-[#0D0D0D] border border-[#2A1D19] rounded-2xl opacity-40 cursor-not-allowed">
                  <span className="block text-[#BFAF91] text-[10px] uppercase mb-2">Crypto Deposit</span>
                  <span className="text-white font-bold">DISABLED</span>
                </div>
                <div className="p-6 bg-[#0D0D0D] border border-[#2A1D19] rounded-2xl opacity-40 cursor-not-allowed">
                  <span className="block text-[#BFAF91] text-[10px] uppercase mb-2">Withdrawal</span>
                  <span className="text-white font-bold">DISABLED</span>
                </div>
              </div>
              <div className="mt-8 rounded-2xl border border-[#2A1D19] bg-[#0D0D0D] p-5 text-left">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Transaction history</h3>
                {user?.gameHistory.length ? (
                  <ul className="mt-3 max-h-60 space-y-1 overflow-y-auto text-[11px] font-mono">
                    {user.gameHistory.slice(0, 30).map((g) => (
                      <li key={g.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-[#1f1613] bg-[#15110F] px-2 py-1.5 text-[#F2E3C6]">
                        <span className="uppercase text-[#BFAF91]">{g.type.replace("_", " ")}</span>
                        <span className={g.delta >= 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>
                          {g.delta >= 0 ? "+" : ""}
                          {Math.floor(g.delta)}
                        </span>
                        <span className="text-[10px] text-[#BFAF91]">{g.reason}</span>
                        <span className="text-[10px] text-[#BFAF91]/70">{new Date(g.createdAt).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm text-[#BFAF91]">No transactions yet.</p>
                )}
              </div>
              <Button variant="secondary" className="mt-6 w-full" onClick={() => setView("support")}>
                Contact support about balance
              </Button>

              <p className="mt-8 text-[10px] text-[#B11226] font-bold uppercase tracking-widest bg-[#3A0B10]/20 p-4 rounded-lg">
                NOTICE: This balance is for demonstration purposes only. It has no real-world value and cannot be traded, withdrawn, or exchanged for any fiat or cryptocurrency.
              </p>
            </div>
          </div>
        );
      case "support":
        return (
          <div className="container mx-auto max-w-3xl px-4 py-8 md:px-8">
            <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
              <h1 className="font-display text-4xl font-black uppercase italic text-white">Support</h1>
              <p className="mt-3 text-sm text-[#BFAF91]">Messages are sent directly to the MADBAK team.</p>
              <p className="mt-1 text-[10px] uppercase tracking-widest text-[#BFAF91]/80">Fake coins only · No real money enabled</p>
              <div className="mt-6">
                <SupportForm onSuccess={(msg) => addNotification(msg, "success", 1400, "normal")} />
              </div>
            </div>
          </div>
        );
      case "profile":
        if (!user) return null;
        return (
          <MadbakProfileView
            user={user}
            onGoSecurity={() => setView("security")}
            onGoVerify={() => setView("verify")}
          />
        );
      case "verify":
        if (!user) return null;
        return <MadbakKycView user={user} onNotify={(msg, type = "success") => addNotification(msg, type)} />;
      case "security":
        if (!user) return null;
        return <MadbakSecurityView user={user} onNotify={(msg, type = "success") => addNotification(msg, type)} />;
      case "admin":
        if (!user || user.role !== "admin") return <KycRegulatedGate onGoVerify={() => guardedSetView("verify")} />;
        return <MadbakAdminDashboard onNotify={(msg, type = "success") => addNotification(msg, type)} />;
      case "rewards":
        if (!user) return null;
        return (
          <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 md:px-8">
            <div>
              <h1 className="font-display text-4xl font-black uppercase italic text-white">Rewards</h1>
              <p className="mt-2 text-xs text-[#BFAF91]">Demo rakeback simulation — no cash value.</p>
            </div>
            {!user.emailVerified ? (
              <div className="rounded-xl border border-[#B11226]/40 bg-[#3A0B10]/25 p-4 text-sm text-[#F2E3C6]">
                Verify your email to claim rewards. Open the account menu or sign-in modal to complete verification.
              </div>
            ) : null}
            <div className="grid gap-4 md:grid-cols-3">
              {["Daily drop", "Streak bonus", "VIP boost"].map((title) => (
                <div key={title} className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
                  <h3 className="text-lg font-black text-white">{title}</h3>
                  <p className="mt-2 text-xs text-[#BFAF91]">+250 DBAK (demo)</p>
                  <Button
                    variant="primary"
                    className="mt-4 w-full"
                    disabled={!user.emailVerified}
                    onClick={() => {
                      if (!user.emailVerified) {
                        addNotification("Verify your email to claim.", "error", 1200, "normal");
                        return;
                      }
                      adjustBalance(250, { game: "rewards" });
                      addNotification(`Claimed ${title}`, "success");
                    }}
                  >
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </div>
        );
      case "sports":
        return (
          <SportsbookPage
            isLoggedIn={!!user}
            balance={balance}
            onRequestAuth={() => requestAuth("login")}
            onNotify={(msg, type = "success") => addNotification(msg, type)}
            onDebitStake={(stake) => {
              if (!user) return;
              adjustBalance(-stake, { game: "sportsbook" });
            }}
            onCreditPayout={(amount) => {
              if (!user) return;
              adjustBalance(amount, { game: "sportsbook" });
            }}
            focusedMatchId={sportsMatchFocusId}
            onClearMatchFocus={() => setSportsMatchFocusId(null)}
          />
        );
      case "leaderboard":
        if (!user) {
          return (
            <div className="container mx-auto max-w-lg px-4 py-16 text-center md:px-8">
              <h2 className="font-display text-2xl font-black uppercase italic text-white">Sign in required</h2>
              <p className="mt-3 text-sm text-[#BFAF91]">Leaderboard comparisons use your demo profile once you sign in.</p>
              <Button className="mt-6" onClick={() => requestAuth("login")}>
                Login / Sign up
              </Button>
            </div>
          );
        }
        if (getVerificationLevel(user, true) < 3) {
          return <KycRegulatedGate onGoVerify={() => setView("verify")} />;
        }
        return (
          <div className="container mx-auto px-4 py-12 md:px-8">
            <h1 className="font-display text-4xl font-black uppercase italic text-white">Leaderboard</h1>
            <p className="mt-4 text-sm text-[#BFAF91]">Demo rankings — connect analytics in production.</p>
            <div className="mt-8 rounded-xl border border-[#2A1D19] bg-[#15110F] p-6 text-[#BFAF91] text-sm">
              Top players: HiddenTiger, Shadow_King, Madbak_Elite…
            </div>
          </div>
        );
      case "responsible-play":
        return (
          <div className="container mx-auto px-4 md:px-8 pt-8 max-w-4xl">
            <div className="bg-[#15110F] border border-[#2A1D19] rounded-3xl p-12">
              <h1 className="text-4xl font-black text-white mb-6 uppercase italic font-display">Responsible Demo Play</h1>
              <div className="prose prose-invert max-w-none text-[#BFAF91] space-y-6">
                <p className="text-xl text-white font-bold italic">Madbak House is a designer&apos;s portfolio project, not a gambling platform.</p>
                <p>
                  Every interaction on this site uses virtual &quot;DBAK&quot; coins which are strictly intended for UI/UX demonstration. There is no mechanism to use real money, nor will there ever be.
                </p>
                <h3 className="text-[#B11226] uppercase font-black tracking-widest mt-12 mb-4">Portfolio Disclosures</h3>
                <ul className="space-y-4 list-none p-0">
                  <li className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#B11226] mt-1.5 shrink-0" />
                    <span>The Random Number Generation (RNG) is client-side simulated and not verified for real-money gaming standards.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#B11226] mt-1.5 shrink-0" />
                    <span>The platform is designed to showcase modern front-end engineering, motion design, and product architecture.</span>
                  </li>
                  <li className="flex gap-4 items-start">
                    <div className="w-2 h-2 rounded-full bg-[#B11226] mt-1.5 shrink-0" />
                    <span>We do not collect user data for marketing or payment processing.</span>
                  </li>
                </ul>
              </div>
              <Button className="mt-12" onClick={() => setView("home")}>
                I Understand, Return Home
              </Button>
            </div>
          </div>
        );
      default:
        if (view.startsWith("game-")) {
          return (
            <div className="container mx-auto max-w-7xl px-4 pb-8 pt-8 md:px-8">
              <div className="mb-8 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => setView("casino")} className="text-[#BFAF91] transition-colors hover:text-white">
                  <LayoutGrid size={24} />
                </button>
                <h1 className="font-display text-3xl font-black uppercase italic text-white">Arcade Fallback</h1>
                <Badge variant="red">Playable mode</Badge>
              </div>
              <CoinflipGame
                balance={balance}
                onResult={handleGameResult}
                onNotify={(msg, type = "success", duration = 1200, priority = "normal") => addNotification(msg, type, duration, priority)}
              />
            </div>
          );
        }
        return (
          <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <AlertTriangle size={64} className="mb-4 text-[#B11226]" />
            <h2 className="font-display text-4xl font-black uppercase italic text-white">Unknown view</h2>
            <p className="mb-8 mt-2 text-[#BFAF91]">Route not found. Return to lobby.</p>
            <Button onClick={() => setView("home")}>Back to Lobby</Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2E3C6] antialiased">
      <Sidebar currentView={view} setView={guardedSetView} showAdmin={user?.role === "admin"} />
      <TopNav
        balance={balance}
        setView={guardedSetView}
        user={user}
        onOpenAuth={requestAuth}
        onSportsMatchFocus={setSportsMatchFocusId}
        onLogout={() => {
          void logout();
          setView("home");
        }}
      />

      <AuthModal
        key={authMountKey}
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        initialTab={authTab === "signup" ? "signup" : "login"}
      />

      <main className="min-h-screen overflow-x-hidden pb-24 pt-28 transition-all duration-300 md:ml-64 md:pb-0 md:pt-20">
        <div className="border-b border-[#2A1D19] bg-[#0a0807] px-4 py-2 text-center text-[9px] font-bold uppercase tracking-widest text-[#BFAF91]/85">
          Demo platform only · Fake DBAK coins · No deposits or withdrawals · KYC flow is a local simulation unless wired to a
          licensed provider · No real-money gambling
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={view} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <div
        className="pointer-events-none fixed bottom-[24px] right-[24px] z-[100] flex max-w-[260px] flex-col items-end gap-1.5 max-md:bottom-[80px] max-md:right-3 max-md:left-auto"
        aria-live="polite"
      >
        <AnimatePresence mode="popLayout">
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              layout
              initial={{ opacity: 0, x: 24, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 24, scale: 0.95 }}
              transition={{ duration: 0.18 }}
              className={`pointer-events-auto flex max-w-[260px] items-start gap-1.5 rounded-lg border px-2 py-1.5 shadow-lg ${
                n.priority === "big"
                  ? n.type === "error"
                    ? "border-[#B11226] bg-[#2a1016] text-[#F2E3C6]"
                    : "border-[#C9A45C] bg-gradient-to-br from-[#1f1810] to-[#120d0a] text-[#F2E3C6] shadow-[0_0_20px_rgba(201,164,92,0.2)]"
                  : n.type === "error"
                    ? "border-[#5a1018] bg-[#1a0a0e] text-[#E8C4C8]"
                    : n.type === "info"
                      ? "border-[#2A1D19] bg-[#12100e] text-[#BFAF91]"
                      : "border-[#2A1D19] bg-[#15110F] text-[#C9A45C]"
              }`}
            >
              <span className="mt-0.5 shrink-0 opacity-80">
                {n.type === "error" ? <AlertTriangle size={12} /> : n.type === "info" ? <Flame size={12} /> : <Zap size={12} />}
              </span>
              <p
                className={`min-w-0 flex-1 font-mono font-bold leading-snug tracking-tight ${
                  n.priority === "big" ? "text-[11px]" : "text-[10px]"
                }`}
              >
                {n.msg}
              </p>
              <button
                type="button"
                onClick={() => dismissNotification(n.id)}
                className="-mr-0.5 -mt-0.5 shrink-0 rounded p-0.5 text-[#BFAF91] transition hover:bg-white/5 hover:text-[#F2E3C6]"
                aria-label="Dismiss"
              >
                <X size={12} strokeWidth={2.5} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0D0D0D]/90 backdrop-blur-xl border-t border-[#2A1D19] z-50 flex items-center justify-around px-4">
        <button type="button" onClick={() => guardedSetView("home")} className={`p-2 ${view === "home" ? "text-[#B11226]" : "text-[#BFAF91]"}`}>
          <LayoutGrid />
        </button>
        <button type="button" onClick={() => guardedSetView("casino")} className={`p-2 ${view === "casino" ? "text-[#B11226]" : "text-[#BFAF91]"}`}>
          <Gamepad2 />
        </button>
        <button type="button" onClick={() => guardedSetView("wallet")} className={`p-2 ${view === "wallet" ? "text-[#B11226]" : "text-[#BFAF91]"}`}>
          <Wallet />
        </button>
        <button type="button" onClick={() => guardedSetView("profile")} className={`p-2 ${view === "profile" ? "text-[#B11226]" : "text-[#BFAF91]"}`}>
          <User />
        </button>
      </div>
    </div>
  );
}
