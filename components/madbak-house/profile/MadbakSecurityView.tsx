"use client";

import { useState } from "react";
import type { MadbakUser } from "@/lib/auth/types";
import { passwordMeetsPolicy } from "@/lib/auth/password-mock";
import { PasswordStrengthMeter } from "@/components/madbak-house/auth/PasswordStrengthMeter";
import { evaluatePasswordStrength } from "@/lib/auth/password-mock";
import { useAuthStore } from "@/store/useAuthStore";

export function MadbakSecurityView({ user, onNotify }: { user: MadbakUser; onNotify: (msg: string, type?: "success" | "error") => void }) {
  const changePasswordDemo = useAuthStore((s) => s.changePasswordDemo);
  const setTwoFactorDemo = useAuthStore((s) => s.setTwoFactorDemo);

  const [cur, setCur] = useState("");
  const [nw, setNw] = useState("");
  const [nw2, setNw2] = useState("");
  const [pwErr, setPwErr] = useState<string | null>(null);

  const strength = evaluatePasswordStrength(nw);

  const submitPw = (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr(null);
    if (nw !== nw2) {
      setPwErr("New passwords do not match.");
      return;
    }
    if (!passwordMeetsPolicy(nw)) {
      setPwErr("New password must meet policy (8+ chars, upper, lower, number).");
      return;
    }
    const r = changePasswordDemo(cur, nw);
    if (!r.ok) {
      setPwErr(r.error);
      return;
    }
    setCur("");
    setNw("");
    setNw2("");
    onNotify("Password updated (demo hash only).", "success");
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 pb-16 md:px-8">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Security</h1>
        <p className="mt-2 text-xs text-[#BFAF91]">
          Demo controls only. Production would use server-side bcrypt/argon2, WebAuthn or TOTP, and device management APIs.
        </p>
      </div>

      <form onSubmit={submitPw} className="space-y-4 rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#C9A45C]">Change password (demo)</h2>
        <label className="block text-[10px] font-black uppercase text-[#BFAF91]">
          Current password
          <input
            type="password"
            value={cur}
            onChange={(e) => setCur(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>
        <label className="block text-[10px] font-black uppercase text-[#BFAF91]">
          New password
          <input
            type="password"
            value={nw}
            onChange={(e) => setNw(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>
        <PasswordStrengthMeter label={strength.label} score={strength.score} />
        <label className="block text-[10px] font-black uppercase text-[#BFAF91]">
          Confirm new password
          <input
            type="password"
            value={nw2}
            onChange={(e) => setNw2(e.target.value)}
            className="mt-1 w-full rounded-lg border border-[#2A1D19] bg-[#050505] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>
        {pwErr && <p className="text-[11px] font-bold text-[#E21B35]">{pwErr}</p>}
        <button
          type="submit"
          className="rounded-xl bg-[#B11226] px-6 py-2.5 text-xs font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
        >
          Update password
        </button>
      </form>

      <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest text-[#C9A45C]">Two-factor authentication (demo)</h2>
            <p className="mt-1 text-[11px] text-[#BFAF91]">Toggle is local UI only — no OTP is generated.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={user.twoFactorDemoEnabled}
            onClick={() => setTwoFactorDemo(!user.twoFactorDemoEnabled)}
            className={`relative h-8 w-14 rounded-full transition ${user.twoFactorDemoEnabled ? "bg-[#B11226]" : "bg-[#2A1D19]"}`}
          >
            <span
              className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-[#F2E3C6] transition ${user.twoFactorDemoEnabled ? "translate-x-6" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#C9A45C]">Active sessions (mock)</h2>
        <ul className="mt-3 space-y-2 text-[11px]">
          {user.activeSessionsMock.map((s) => (
            <li key={s.id} className="flex flex-wrap justify-between gap-2 rounded border border-[#1f1613] bg-[#0D0D0D] px-3 py-2 text-[#BFAF91]">
              <span className="text-[#F2E3C6]">{s.device}</span>
              {s.current && <span className="text-[#7ddf8a]">This session</span>}
              <span>{s.location}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
        <h2 className="text-sm font-black uppercase tracking-widest text-[#C9A45C]">Login history (mock)</h2>
        <ul className="mt-3 space-y-2 text-[11px]">
          {user.loginHistoryMock.length === 0 ? (
            <li className="text-[#BFAF91]">No entries.</li>
          ) : (
            user.loginHistoryMock.map((s) => (
              <li key={s.id} className="flex flex-wrap justify-between gap-2 rounded border border-[#1f1613] bg-[#0D0D0D] px-3 py-2 text-[#BFAF91]">
                <span className="text-[#F2E3C6]">{new Date(s.at).toLocaleString()}</span>
                <span>{s.device}</span>
                <span>{s.ip}</span>
                <span className={s.success ? "text-[#7ddf8a]" : "text-[#E21B35]"}>{s.success ? "OK" : "Fail"}</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
