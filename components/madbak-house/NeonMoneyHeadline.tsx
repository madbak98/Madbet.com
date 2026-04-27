"use client";

import { useEffect, useRef } from "react";

/**
 * Hero background neon — randomizes flicker cadence for imperfect “broken tube” feel.
 */
export function NeonMoneyHeadline({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const jitter = () => {
      const s = 2 + Math.random() * 2;
      el.style.setProperty("--neon-flicker-dur", `${s}s`);
    };

    jitter();
    const id = window.setInterval(jitter, 2000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <h1 ref={ref} className={`neon-text font-display ${className}`.trim()}>
      MAKE MONEY! <span className="neon-smile">:)</span>
    </h1>
  );
}
