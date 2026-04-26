"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function RouletteGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const number=randInt(0,36);const win=number%2===0&&number!==0;const payout=win?bet*2:0;placeBet("Roulette",bet,payout,win);setResult(`Ball: ${number} · ${win?"Win":"Loss"}`);};
  return <GameLayout title="Roulette" subtitle="European wheel with classic outside bets." controls={<BetPanel onPlay={play} />}><div><p className="text-6xl">🎡</p><p className="mt-3 text-[#bfaf91]">Red/black, odd/even, ranges, and straight number demo logic.</p></div><ResultToast text={result} /></GameLayout>;
}
