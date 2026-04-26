"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function KenoGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const matches=randInt(0,10);const payout=matches>=5?bet*matches*0.5:0;const win=payout>0;placeBet("Keno",bet,payout,win);setResult(`${matches} matches`);};
  return <GameLayout title="Keno" subtitle="Select numbers and match the draw." controls={<BetPanel onPlay={play} />}><div><p className="text-5xl">01 07 12 22 31</p><p className="mt-3 text-[#bfaf91]">Animated number reveal with demo payout curve.</p></div><ResultToast text={result} /></GameLayout>;
}
