"use client";
import { motion } from "framer-motion";
const updates=["ghost_71 won 320 coins on Crash","velvet_ace cashed out at 3.21x","skullline hit Roulette Red","creamvault opened Mines x4"];
export function LiveFeed(){return <section className="panel overflow-hidden rounded-2xl p-4"><h3 className="mb-3 text-lg">Live Casino Floor</h3><motion.div animate={{x:[0,-600]}} transition={{duration:18,repeat:Infinity,ease:"linear"}} className="flex gap-8 whitespace-nowrap text-sm text-[#bfaf91]">{[...updates,...updates,...updates].map((u,i)=><span key={u+i}>{u}</span>)}</motion.div></section>;}
