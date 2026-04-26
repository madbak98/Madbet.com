import Link from "next/link";
import { mockSports } from "@/lib/mockSports";
import { Card } from "@/components/ui/Card";
export function SportsPreview(){return <section className="space-y-4"><div className="flex items-end justify-between"><h2 className="display-title text-3xl">Sports Demo</h2><Link href="/sports" className="text-sm text-[#c9a45c]">Open predictions floor</Link></div><div className="grid gap-4 md:grid-cols-2">{mockSports.map((m)=><Card key={m.id}><div className="text-sm text-[#bfaf91]">{m.sport} · {m.status}</div><div className="mt-2 font-semibold">{m.match}</div><div className="mt-3 text-sm">Odds: {m.odds.join(" / ")}</div></Card>)}</div></section>;}
