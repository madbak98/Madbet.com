"use client";
import { ReactNode } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { MobileNav } from "@/components/layout/MobileNav";
export function AppShell({children}:{children:ReactNode}){return <div className="min-h-screen bg-[#050505] text-[#f2e3c6]"><div className="flex min-h-screen"><Sidebar/><div className="flex min-w-0 flex-1 flex-col"><TopNav/><main className="flex-1 px-4 pb-24 pt-6 lg:px-8">{children}</main></div></div><MobileNav/></div>;}
