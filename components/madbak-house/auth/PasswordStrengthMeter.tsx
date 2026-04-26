"use client";

import type { PasswordStrength } from "@/lib/auth/password-mock";

const LABELS: Record<PasswordStrength, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

const BAR: Record<PasswordStrength, string> = {
  weak: "w-[25%] bg-[#5a1018]",
  fair: "w-[45%] bg-[#8b4513]",
  good: "w-[70%] bg-[#C9A45C]",
  strong: "w-full bg-[#2d7a3e]",
};

export function PasswordStrengthMeter({ label, score }: { label: PasswordStrength; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#BFAF91]">
        <span>Password strength</span>
        <span className="text-[#F2E3C6]">{LABELS[label]}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[#0D0D0D] border border-[#2A1D19] overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-300 ${BAR[label]}`} />
      </div>
      <p className="text-[10px] text-[#BFAF91]/80">
        Min 8 chars, uppercase, lowercase, and number required. Score {score}/6.
      </p>
    </div>
  );
}
