"use client";

import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { ResultToast } from "@/components/games/ResultToast";

export default function CoinflipGamePage() {
  const placeBet = useCasinoStore((s) => s.placeBet);
  const [result, setResult] = useState<string | null>(null);

  const play = (bet: number) => {
    const win = Math.random() > 0.5;
    const payout = win ? bet * 2 : 0;
    placeBet("Coinflip", bet, payout, win);
    setResult(win ? "Crown wins" : "Skull wins");
  };

  return (
    <GameLayout title="Coinflip" subtitle="Pick red skull or cream crown." controls={<BetPanel onPlay={play} />}>
      <div>
        <p className="text-7xl">🪙</p>
        <p className="mt-3 text-[#bfaf91]">Fast play 2x loop with cinematic coin motion.</p>
      </div>
      <ResultToast text={result} />
    </GameLayout>
  );
}
