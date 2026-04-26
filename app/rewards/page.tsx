"use client";
import { useState } from "react";
import { useCasinoStore } from "@/store/useCasinoStore";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
const levels=["Bronze","Crimson","Obsidian","Royal Cream","Madbak Elite"];
export default function RewardsPage(){const addTransaction=useCasinoStore((s)=>s.addTransaction);const [progress]=useState(62);return <div className="space-y-4"><h1 className="display-title text-4xl">VIP Rewards</h1><Card><div className="text-sm text-[#bfaf91]">VIP Progress</div><div className="mt-2 h-3 rounded-full bg-[#261714]"><div className="h-3 rounded-full bg-[#b11226]" style={{width:`${progress}%`}}/></div></Card><div className="grid gap-3 md:grid-cols-5">{levels.map((l)=><Card key={l}><div className="font-semibold">{l}</div><div className="text-xs text-[#bfaf91]">Demo rakeback + frame</div></Card>)}</div><div className="grid gap-4 md:grid-cols-3"><Button onClick={()=>addTransaction({type:"bonus",amount:150,note:"Daily demo bonus"})}>Claim Daily Bonus</Button><Button onClick={()=>addTransaction({type:"bonus",amount:600,note:"Weekly demo bonus"})}>Claim Weekly Bonus</Button><Button onClick={()=>addTransaction({type:"rakeback",amount:320,note:"Rakeback simulation"})}>Claim Rakeback</Button></div></div>;}
