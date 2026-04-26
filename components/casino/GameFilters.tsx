"use client";
import { Tabs } from "@/components/ui/Tabs";
export function GameFilters({value,onChange}:{value:string;onChange:(v:string)=>void}){return <Tabs value={value} onChange={onChange} options={["All","Originals","Table Games","Card Games","Fast Games","Sports Demo"]}/>;}
