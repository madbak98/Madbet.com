"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useCasinoStore } from "@/store/useCasinoStore";
import { Card } from "@/components/ui/Card";
import Link from "next/link";

export default function WalletPage() {
  const { balance, transactions } = useCasinoStore();
  const chartData = transactions.slice(0, 20).map((t, i) => ({ i, amount: t.amount }));

  return (
    <div className="space-y-4">
      <h1 className="display-title text-4xl">Demo Wallet</h1>
      <Card>
        <div className="text-sm text-[#bfaf91]">Balance Overview</div>
        <div className="mt-1 text-3xl font-semibold">{balance.toLocaleString()} DC</div>
        <p className="mt-2 text-xs text-[#bfaf91]">Fake coins only. Deposits/withdrawals are disabled.</p>
        <Link href="/support" className="mt-3 inline-flex text-xs font-semibold text-[#c9a45c] hover:text-[#f2e3c6]">
          Balance issue? Contact support
        </Link>
      </Card>
      <Card className="h-56"><ResponsiveContainer width="100%" height="100%"><LineChart data={chartData}><XAxis dataKey="i" stroke="#bfaf91" /><YAxis stroke="#bfaf91" /><Tooltip /><Line type="monotone" dataKey="amount" stroke="#b11226" /></LineChart></ResponsiveContainer></Card>
      <Card><h3>Transaction History</h3><div className="mt-2 space-y-2 text-sm text-[#bfaf91]">{transactions.slice(0, 15).map((t) => <div key={t.id}>{t.type}: {t.amount > 0 ? "+" : ""}{t.amount} · {new Date(t.createdAt).toLocaleString()}</div>)}</div></Card>
    </div>
  );
}
