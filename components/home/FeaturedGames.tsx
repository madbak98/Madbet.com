"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { games } from "@/lib/games";
export function FeaturedGames(){return <section className="space-y-4"><h2 className="display-title text-3xl">Featured Games</h2><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{games.filter((g)=>g.slug!=="sports").map((g)=><motion.div whileHover={{y:-4}} key={g.slug} className="panel rounded-2xl p-4 transition hover:shadow-[0_0_24px_rgba(177,18,38,0.25)]"><div className="text-lg font-semibold">{g.name}</div><div className="mt-2 text-sm text-[#bfaf91]">{g.players} live players · RTP {g.rtp}%</div><Link href={`/game/${g.slug}`} className="mt-4 inline-block rounded-lg border border-[#b11226] px-3 py-2 text-sm">Play Demo</Link></motion.div>)}</div></section>;}
