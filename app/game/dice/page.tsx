"use client";

import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";

export default function DiceGamePage() {
  const placeBet = useCasinoStore((s) => s.placeBet);
  const [result, setResult] = useState<string | null>(null);
  const [rollFace, setRollFace] = useState(1);

  const play = (bet: number) => {
    const roll = randInt(1, 100);
    const win = roll > 50;
    const payout = win ? bet * 1.95 : 0;
    setRollFace(randInt(1, 6));
    placeBet("Dice", bet, payout, win);
    setResult(`Roll ${roll} · ${win ? "Win" : "Loss"}`);
  };

  return (
    <GameLayout title="Dice" subtitle="Choose chance, roll, and test variance." controls={<BetPanel onPlay={play} />}>
      <div>
        <p className="text-6xl font-black">D{rollFace}</p>
        <p className="mt-3 text-[#bfaf91]">Over/Under logic simulated with dynamic mock odds.</p>
      </div>
      <ResultToast text={result} />
    </GameLayout>
  );
}
