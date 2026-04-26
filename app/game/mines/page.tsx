"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function MinesGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const safePicks=randInt(1,4);const win=Math.random()>0.4;const payout=win?bet*(1+safePicks*0.6):0;placeBet("Mines",bet,payout,win);setResult(win?`Safe chain x${safePicks}`:"Hit a mine");};
  return <GameLayout title="Mines" subtitle="Pick safe tiles and cash out before blast." controls={<BetPanel onPlay={play} />}><div><p className="text-5xl">💎 💣</p><p className="mt-3 text-[#bfaf91]">5x5 risk grid with rising multipliers.</p></div><ResultToast text={result} /></GameLayout>;
}
