"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function BlackjackGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const player=randInt(14,22);const dealer=randInt(15,23);const win=player<=21&&(dealer>21||player>dealer);const payout=win?bet*2:0;placeBet("Blackjack",bet,payout,win);setResult(`You ${player} · Dealer ${dealer}`);};
  return <GameLayout title="Blackjack" subtitle="Player vs dealer with hit and stand flow." controls={<BetPanel onPlay={play} />}><div><p className="text-5xl">🂡 🂫</p><p className="mt-3 text-[#bfaf91]">Basic blackjack hand resolution in fake-coin mode.</p></div><ResultToast text={result} /></GameLayout>;
}
