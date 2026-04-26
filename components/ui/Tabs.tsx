"use client";
import clsx from "clsx";
export function Tabs({options,value,onChange}:{options:string[];value:string;onChange:(v:string)=>void}){return <div className="flex flex-wrap gap-2">{options.map((o)=><button key={o} onClick={()=>onChange(o)} className={clsx("rounded-lg border px-3 py-1 text-sm",value===o?"border-[#b11226] bg-[#2b1216]":"border-[#3b2621] bg-[#120d0b]")}>{o}</button>)}</div>;}
