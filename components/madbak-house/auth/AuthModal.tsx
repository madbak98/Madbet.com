"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { AuthModalTab } from "@/lib/auth/types";
import { DEMO_COUNTRIES } from "@/lib/auth/validators";
import { isValidEmail, isAtLeast18 } from "@/lib/auth/validators";
import { evaluatePasswordStrength, passwordMeetsPolicy } from "@/lib/auth/password-mock";
import { useAuthStore } from "@/store/useAuthStore";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

export function AuthModal({
  open,
  onClose,
  initialTab = "login",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: AuthModalTab;
}) {
  const [tab, setTab] = useState<AuthModalTab>(initialTab);
  const signUp = useAuthStore((s) => s.signUp);
  const login = useAuthStore((s) => s.login);
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth);
  const forgotPassword = useAuthStore((s) => s.forgotPassword);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [suUser, setSuUser] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suPass2, setSuPass2] = useState("");
  const [suDob, setSuDob] = useState("");
  const [suCountry, setSuCountry] = useState("");
  const [suTerms, setSuTerms] = useState(false);
  const [suAge, setSuAge] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const strength = evaluatePasswordStrength(suPass);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    if (!isValidEmail(loginEmail)) {
      setErr("Enter a valid email.");
      return;
    }
    setBusy(true);
    const r = await login(loginEmail, loginPassword);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    onClose();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    if (!suTerms) {
      setErr("You must accept the terms.");
      return;
    }
    if (!suAge) {
      setErr("Confirm you are 18 or older.");
      return;
    }
    if (!isAtLeast18(suDob)) {
      setErr("You must be 18 or older.");
      return;
    }
    if (suPass !== suPass2) {
      setErr("Passwords do not match.");
      return;
    }
    if (!passwordMeetsPolicy(suPass)) {
      setErr("Password must be 8+ chars with upper, lower, and a number.");
      return;
    }
    setBusy(true);
    const r = await signUp({
      username: suUser,
      email: suEmail,
      password: suPass,
      dateOfBirth: suDob,
      country: suCountry,
    });
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    setOkMsg(r.message ?? "Check your email to verify account.");
    setTab("login");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setOkMsg(null);
    if (!isValidEmail(forgotEmail)) {
      setErr("Enter a valid email.");
      return;
    }
    setBusy(true);
    const r = await forgotPassword(forgotEmail);
    setBusy(false);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    setOkMsg("If this email exists, a reset link has been sent.");
  };

  return (
    <AnimatePresence>
      {open ? (
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          onClose();
        }}
      >
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.98 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="relative w-full max-w-md rounded-2xl border border-[#2A1D19] bg-[#15110F] shadow-2xl shadow-black/60"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => {
              onClose();
            }}
            className="absolute right-3 top-3 z-[5] rounded-lg p-2 text-[#BFAF91] hover:bg-white/5 hover:text-[#F2E3C6]"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-6 pt-10">
            <>
                <h2 id="auth-modal-title" className="font-display text-2xl font-black uppercase italic text-[#F2E3C6] mb-6">
                  {tab === "login" && "Welcome back"}
                  {tab === "signup" && "Join the house"}
                  {tab === "forgot" && "Recover access"}
                </h2>

                <div className="mb-6 flex gap-2 rounded-lg bg-[#0D0D0D] p-1">
                  {(["login", "signup"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTab(t);
                        setErr(null);
                        setOkMsg(null);
                      }}
                      className={`flex-1 rounded-md py-2 text-[10px] font-black uppercase tracking-widest ${
                        tab === t ? "bg-[#B11226] text-[#F2E3C6]" : "text-[#BFAF91] hover:text-[#F2E3C6]"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setTab("forgot");
                      setErr(null);
                      setOkMsg(null);
                    }}
                    className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-widest ${
                      tab === "forgot" ? "bg-[#B11226] text-[#F2E3C6]" : "text-[#BFAF91]"
                    }`}
                  >
                    ?
                  </button>
                </div>

                {tab === "forgot" && (
                  <form onSubmit={handleForgot} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#BFAF91]">Email</label>
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                        autoComplete="email"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35] disabled:opacity-60"
                    >
                      Send reset link
                    </button>
                    <button type="button" onClick={() => setTab("login")} className="text-[#C9A45C] font-bold uppercase text-xs tracking-widest hover:underline">
                      Back to login
                    </button>
                  </form>
                )}

                {tab === "login" && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#BFAF91]">Email</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                        autoComplete="email"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#BFAF91]">Password</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                        autoComplete="current-password"
                      />
                    </div>
                    <button type="button" onClick={() => setTab("forgot")} className="text-[11px] font-bold text-[#C9A45C] hover:underline">
                      Forgot password?
                    </button>
                    {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}
                    {okMsg && <p className="text-[11px] font-bold text-[#7ddf8a]">{okMsg}</p>}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                    >
                      Login
                    </button>
                    <AuthDivider label="Or continue with" />
                    <button
                      type="button"
                      onClick={async () => {
                        setErr(null);
                        const r = await signInWithOAuth("google");
                        if (!r.ok) setErr(r.error);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A1D19] bg-[#F2E3C6] py-3 text-sm font-black text-[#050505] shadow-sm transition hover:bg-white"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-[#4285F4]">G</span>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setErr(null);
                        const r = await signInWithOAuth("apple");
                        if (!r.ok) setErr(r.error);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#BFAF91]/35 bg-[#050505] py-3 text-sm font-black text-[#F2E3C6] transition hover:border-[#B11226]"
                    >
                      <AppleGlyph className="h-9 w-9 shrink-0 text-[#F2E3C6]" />
                      Continue with Apple
                    </button>
                  </form>
                )}

                {tab === "signup" && (
                  <form onSubmit={handleSignup} className="max-h-[60vh] space-y-3 overflow-y-auto pr-1 custom-scrollbar">
                    <Field label="Username" value={suUser} onChange={setSuUser} autoComplete="username" />
                    <Field label="Email" type="email" value={suEmail} onChange={setSuEmail} autoComplete="email" />
                    <div>
                      <Field label="Password" type="password" value={suPass} onChange={setSuPass} autoComplete="new-password" />
                      <div className="mt-2">
                        <PasswordStrengthMeter label={strength.label} score={strength.score} />
                      </div>
                    </div>
                    <Field label="Confirm password" type="password" value={suPass2} onChange={setSuPass2} autoComplete="new-password" />
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#BFAF91]">Date of birth</label>
                      <input
                        type="date"
                        value={suDob}
                        onChange={(e) => setSuDob(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase text-[#BFAF91]">Country</label>
                      <select
                        value={suCountry}
                        onChange={(e) => setSuCountry(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                      >
                        <option value="">Select country</option>
                        {DEMO_COUNTRIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <label className="flex items-start gap-2 text-[11px] text-[#BFAF91]">
                      <input type="checkbox" checked={suTerms} onChange={(e) => setSuTerms(e.target.checked)} className="mt-0.5 accent-[#B11226]" />I accept the Terms of Service.
                    </label>
                    <label className="flex items-start gap-2 text-[11px] text-[#BFAF91]">
                      <input type="checkbox" checked={suAge} onChange={(e) => setSuAge(e.target.checked)} className="mt-0.5 accent-[#B11226]" />I confirm I am 18 or older.
                    </label>
                    {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}
                    {okMsg && <p className="text-[11px] font-bold text-[#7ddf8a]">{okMsg}</p>}
                    <button
                      type="submit"
                      disabled={busy}
                      className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                    >
                      Create account
                    </button>
                    <AuthDivider label="Or sign up with" />
                    <button
                      type="button"
                      onClick={async () => {
                        setErr(null);
                        const r = await signInWithOAuth("google");
                        if (!r.ok) setErr(r.error);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A1D19] bg-[#F2E3C6] py-3 text-sm font-black text-[#050505] shadow-sm transition hover:bg-white"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-[#4285F4]">G</span>
                      Sign up with Google
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        setErr(null);
                        const r = await signInWithOAuth("apple");
                        if (!r.ok) setErr(r.error);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#BFAF91]/35 bg-[#050505] py-3 text-sm font-black text-[#F2E3C6] transition hover:border-[#B11226]"
                    >
                      <AppleGlyph className="h-9 w-9 shrink-0 text-[#F2E3C6]" />
                      Sign up with Apple
                    </button>
                  </form>
                )}
            </>
          </div>
        </motion.div>
      </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function AuthDivider({ label }: { label: string }) {
  return (
    <div className="relative my-5 flex items-center gap-3">
      <div className="h-px flex-1 bg-[#2A1D19]" />
      <span className="shrink-0 text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">{label}</span>
      <div className="h-px flex-1 bg-[#2A1D19]" />
    </div>
  );
}

function AppleGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M16.36 1.43c.35.41.56.98.5 1.55-.05.57-.35 1.1-.78 1.45-.43.35-.98.5-1.52.4-.35-.41-.56-.98-.5-1.55.05-.57.35-1.1.78-1.45.43-.35.98-.5 1.52-.4zm2.5 4.55c-1.1-.06-2.28.65-2.9.65-.65 0-1.65-.62-2.75-.6-1.42.02-2.73.82-3.45 2.08-1.47 2.55-.38 6.33 1.05 8.4.7 1.02 1.55 2.16 2.65 2.12 1.05-.04 1.45-.68 2.72-.68 1.27 0 1.63.68 2.75.65 1.14-.02 1.86-1.03 2.55-2.05.8-1.17 1.13-2.32 1.15-2.38-.02-.02-2.2-.85-2.22-3.35-.02-2.15 1.72-3.18 1.8-3.23-1-.48-1.42-1.32-2.85-1.35z" />
    </svg>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label className="text-[10px] font-black uppercase text-[#BFAF91]">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
        autoComplete={autoComplete}
      />
    </div>
  );
}
