"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
const nav=[["Casino","/casino"],["Sports","/sports"],["Originals","/casino"],["Promotions","/rewards"],["VIP Club","/rewards"],["Leaderboard","/leaderboard"],["Support","/support"],["Responsible Play","/responsible-play"]] as const;
export function Sidebar(){const path=usePathname();return <aside className="panel hidden w-64 shrink-0 rounded-r-3xl border-l-0 p-5 lg:block"><Link href="/" className="display-title mb-8 block text-3xl">MADBAK HOUSE</Link><nav className="space-y-2">{nav.map(([label,href])=><Link key={label} href={href} className={clsx("block rounded-xl border px-3 py-2 text-sm",path.startsWith(href)?"border-[#b11226] bg-[#2a1116]":"border-transparent text-[#bfaf91] hover:border-[#3f2823]")}>{label}</Link>)}</nav></aside>;}
