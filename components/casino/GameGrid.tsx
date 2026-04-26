import { GameItem } from "@/lib/games";
import { GameCard } from "@/components/casino/GameCard";
export function GameGrid({items}:{items:GameItem[]}){return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map((g)=><GameCard key={g.slug} game={g}/>)}</div>;}
