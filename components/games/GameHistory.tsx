"use client";
import { useCasinoStore } from "@/store/useCasinoStore";
export function GameHistory(){const history=useCasinoStore((s)=>s.betHistory.slice(0,8));return <div className="panel rounded-xl p-3"><h4 className="mb-2 text-sm">Recent Rounds</h4><div className="space-y-1 text-xs text-[#bfaf91]">{history.map((h)=><div key={h.id}>{h.game}: {h.win?"Win":"Loss"} ({h.bet} → {h.payout})</div>)}{history.length===0&&<div>No rounds yet.</div>}</div></div>;}
