"use client";
import { useCasinoStore } from "@/store/useCasinoStore";
import { formatCoins } from "@/lib/format";
export function BalanceDisplay(){const balance=useCasinoStore((s)=>s.balance);return <div className="rounded-lg border border-[#533029] px-3 py-2 text-sm">Balance: {formatCoins(balance)} · DEMO</div>;}
