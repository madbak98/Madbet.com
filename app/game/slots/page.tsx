"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function SlotsGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const win=Math.random()>0.62;const payout=win?bet*randInt(2,15):0;placeBet("Slots",bet,payout,win);setResult(win?`Line hit · +${payout}`:"No line");};
  return <GameLayout title="Slots" subtitle="Spin five reels with cinematic symbols." controls={<BetPanel onPlay={play} />}><div><p className="text-5xl">💀 👑 🍒 7️⃣ 🪙</p><p className="mt-3 text-[#bfaf91]">Rare jackpot burst and line highlights in demo mode.</p></div><ResultToast text={result} /></GameLayout>;
}
