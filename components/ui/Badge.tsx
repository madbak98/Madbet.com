import { HTMLAttributes } from "react";
import clsx from "clsx";
export function Badge({className,...props}:HTMLAttributes<HTMLSpanElement>){return <span className={clsx("inline-flex items-center rounded-full border border-[#693933] bg-[#220f12] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f2e3c6]",className)} {...props}/>;}
