"use client";
import { ReactNode } from "react";
export function Modal({open,children}:{open:boolean;children:ReactNode}){if(!open)return null;return <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="panel red-glow w-full max-w-md rounded-2xl p-6">{children}</div></div>;}
