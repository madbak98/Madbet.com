"use client";
import { useState } from "react";
import { GameLayout } from "@/components/games/GameLayout";
import { BetPanel } from "@/components/games/BetPanel";
import { useCasinoStore } from "@/store/useCasinoStore";
import { randInt } from "@/lib/rng";
import { ResultToast } from "@/components/games/ResultToast";
export default function BaccaratGamePage(){
  const placeBet=useCasinoStore((s)=>s.placeBet);
  const [result,setResult]=useState<string|null>(null);
  const play=(bet:number)=>{const player=randInt(0,9);const banker=randInt(0,9);const tie=player===banker;const win=player>banker;const payout=tie?bet*8:win?bet*2:0;placeBet("Baccarat",bet,payout,payout>0);setResult(`P:${player} B:${banker}`);};
  return <GameLayout title="Baccarat" subtitle="Player, banker, tie premium table." controls={<BetPanel onPlay={play} />}><div><p className="text-5xl">🂱 🂾</p><p className="mt-3 text-[#bfaf91]">Premium table mood with simple demo result logic.</p></div><ResultToast text={result} /></GameLayout>;
}
