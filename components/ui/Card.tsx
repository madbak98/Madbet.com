import { HTMLAttributes } from "react";
import clsx from "clsx";
export function Card({className,...props}:HTMLAttributes<HTMLDivElement>){return <div className={clsx("panel rounded-2xl p-4",className)} {...props}/>;}
