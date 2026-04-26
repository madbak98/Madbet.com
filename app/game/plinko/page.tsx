"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function PlinkoGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const bucket=[0,0.5,1,2,5,9][randInt(0,5)];const payout=bet*bucket;const win=payout>bet;placeBet("Plinko",bet,payout,win);setResult(`Bucket ${bucket}x`);};
  return <GameLayout title="Plinko" subtitle="Drop balls through pegs by risk tier." controls={<BetPanel onPlay={play} />}><div><p className="text-6xl">🔻</p><p className="mt-3 text-[#bfaf91]">Ball path and buckets are simulated for smooth motion.</p></div><ResultToast text={result} /></GameLayout>;
}
