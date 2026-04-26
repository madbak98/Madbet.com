"use client";

import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { ResultToast } from "@/components/games/ResultToast";

export default function CrashGamePage() {
  const placeBet = useCasinoStore((s) => s.placeBet);
  const [result, setResult] = useState<string | null>(null);
  const [multiplier, setMultiplier] = useState(1);

  const play = (bet: number) => {
    const multi = Number((Math.random() * 6 + 1).toFixed(2));
    const win = multi > 2;
    const payout = win ? bet * multi * 0.6 : 0;
    setMultiplier(multi);
    placeBet("Crash", bet, payout, win);
    setResult(`${win ? "Cashed" : "Crashed"} at ${multi.toFixed(2)}x`);
  };

  return (
    <GameLayout title="Crash" subtitle="Cash out before the multiplier breaks." controls={<BetPanel onPlay={play} />}>
      <div>
        <p className="text-7xl font-black text-[#e21b35]">{multiplier.toFixed(2)}x</p>
        <p className="mt-3 text-[#bfaf91]">Live chart and crash glitches are demo simulated.</p>
      </div>
      <ResultToast text={result} />
    </GameLayout>
  );
}
