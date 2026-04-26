"use client";
import { motion,AnimatePresence } from "framer-motion";
export function ResultToast({text}:{text:string|null}){return <AnimatePresence>{text&&<motion.div initial={{y:20,opacity:0}} animate={{y:0,opacity:1}} exit={{y:20,opacity:0}} className="fixed bottom-24 right-4 z-50 rounded-xl border border-[#733c34] bg-[#130b0b] px-4 py-2 text-sm">{text}</motion.div>}</AnimatePresence>;}
