import { ReactNode } from "react";
import { BalanceDisplay } from "@/components/games/BalanceDisplay";
import { GameHistory } from "@/components/games/GameHistory";
export function GameLayout({title,subtitle,controls,children}:{title:string;subtitle:string;controls:ReactNode;children:ReactNode}){return <div className="space-y-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="display-title text-4xl">{title}</h1><p className="text-sm text-[#bfaf91]">{subtitle}</p></div><BalanceDisplay/></div><div className="grid gap-4 xl:grid-cols-[320px_1fr]"><div className="space-y-4">{controls}<GameHistory/></div><div className="panel rounded-2xl p-6">{children}</div></div></div>;}
