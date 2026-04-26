"use client";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
export function AnimatedNumber({value}:{value:number}){const mv=useMotionValue(value);const rounded=useTransform(()=>Math.round(mv.get()).toLocaleString());useEffect(()=>{const c=animate(mv,value,{duration:.5});return ()=>c.stop();},[mv,value]);return <motion.span>{rounded}</motion.span>;}
