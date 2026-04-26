"use client";

import Link from "next/link";
import { SportsbookPage } from "@/components/sports/SportsbookPage";
import { useCasinoStore } from "@/store/useCasinoStore";
import { Badge } from "@/components/ui/Badge";

/**
 * Standalone /sports route — uses legacy demo wallet store (DC).
 * Primary MADBAK HOUSE experience lives at `/` with auth-backed DBAK.
 */
export default function SportsPage() {
  const balance = useCasinoStore((s) => s.balance);
  const addTransaction = useCasinoStore((s) => s.addTransaction);

  return (
    <div className="min-h-screen bg-[#050505] text-[#f2e3c6]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2a1d19] px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/" className="text-sm font-semibold text-[#c9a45c] hover:text-[#f2e3c6]">
            ← Madbak House (main app)
          </Link>
          <Badge>DEMO</Badge>
        </div>
        <span className="font-mono text-xs text-[#bfaf91]">Balance: {balance.toLocaleString()} DC</span>
      </header>
      <SportsbookPage
        isLoggedIn
        balance={balance}
        onRequestAuth={() => {
          window.location.href = "/";
        }}
        onNotify={() => {}}
        onDebitStake={(stake) => addTransaction({ type: "sports_demo", amount: -stake, note: "Sports demo stake" })}
        onCreditPayout={(amount) => addTransaction({ type: "sports_demo", amount, note: "Sports demo payout" })}
      />
    </div>
  );
}
