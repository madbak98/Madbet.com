import { ButtonHTMLAttributes } from "react";
import clsx from "clsx";
export function Button({className,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={clsx("rounded-xl border border-[#5d2b27] bg-[#190f0f] px-4 py-2 text-sm font-semibold text-[#f2e3c6] transition hover:-translate-y-0.5 hover:border-[#b11226] hover:shadow-[0_0_20px_rgba(177,18,38,0.3)] disabled:opacity-40",className)} {...props}/>;}
