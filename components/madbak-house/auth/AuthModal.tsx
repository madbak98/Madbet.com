"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { AuthModalTab } from "@/lib/auth/types";
import { DEMO_APPLE_EMAIL, DEMO_GOOGLE_EMAIL } from "@/lib/auth/types";
import { DEMO_COUNTRIES } from "@/lib/auth/validators";
import { isValidEmail, isAtLeast18 } from "@/lib/auth/validators";
import { evaluatePasswordStrength, passwordMeetsPolicy } from "@/lib/auth/password-mock";
import { useAuthStore } from "@/store/useAuthStore";
import { PasswordStrengthMeter } from "./PasswordStrengthMeter";

type Step = "auth" | "verify-email";

function initialAuthStep(): Step {
  const sid = useAuthStore.getState().sessionUserId;
  const u = sid ? useAuthStore.getState().getUser(sid) : undefined;
  if (u && !u.emailVerified) return "verify-email";
  return "auth";
}

function initialVerifyUserId(): string | null {
  const sid = useAuthStore.getState().sessionUserId;
  const u = sid ? useAuthStore.getState().getUser(sid) : undefined;
  if (u && !u.emailVerified) return sid;
  return null;
}

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
  const [step, setStep] = useState<Step>(initialAuthStep);
  const [verifyUserId, setVerifyUserId] = useState<string | null>(initialVerifyUserId);
  const [codeInput, setCodeInput] = useState("");

  const signUp = useAuthStore((s) => s.signUp);
  const login = useAuthStore((s) => s.login);
  const demoSocialAuth = useAuthStore((s) => s.demoSocialAuth);
  const confirmEmailCode = useAuthStore((s) => s.confirmEmailCode);
  const resendEmailCode = useAuthStore((s) => s.resendEmailCode);
  const emailCodes = useAuthStore((s) => s.emailCodes);
  const sessionUserId = useAuthStore((s) => s.sessionUserId);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [remember, setRemember] = useState(true);

  const [suUser, setSuUser] = useState("");
  const [suEmail, setSuEmail] = useState("");
  const [suPass, setSuPass] = useState("");
  const [suPass2, setSuPass2] = useState("");
  const [suDob, setSuDob] = useState("");
  const [suCountry, setSuCountry] = useState("");
  const [suTerms, setSuTerms] = useState(false);
  const [suAge, setSuAge] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  /** Local demo only — real Google / Apple use hosted OAuth (NextAuth, Clerk, Supabase, Firebase). Never DIY OAuth in production. */
  const [oauthFlow, setOauthFlow] = useState<null | "google" | "apple">(null);
  const [oauthAgeOk, setOauthAgeOk] = useState(false);

  const strength = evaluatePasswordStrength(suPass);

  const closeOAuth = () => {
    setOauthFlow(null);
    setOauthAgeOk(false);
    setErr(null);
  };

  const confirmDemoOAuth = () => {
    if (!oauthFlow) return;
    if (!oauthAgeOk) {
      setErr("Confirm you are 18+ and accept the Terms to continue.");
      return;
    }
    const r = demoSocialAuth(oauthFlow);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    closeOAuth();
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!isValidEmail(loginEmail)) {
      setErr("Enter a valid email.");
      return;
    }
    const r = login(loginEmail, loginPassword, remember);
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    const sid = useAuthStore.getState().sessionUserId;
    const u = sid ? useAuthStore.getState().getUser(sid) : undefined;
    if (u && !u.emailVerified) {
      setVerifyUserId(u.id);
      setStep("verify-email");
      return;
    }
    onClose();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
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
    const r = signUp({
      username: suUser,
      email: suEmail,
      password: suPass,
      dateOfBirth: suDob,
      country: suCountry,
    });
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    setVerifyUserId(r.userId);
    setStep("verify-email");
    setCodeInput("");
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    const uid = verifyUserId ?? sessionUserId;
    if (!uid) {
      setErr("Session missing. Try signing in again.");
      return;
    }
    const r = confirmEmailCode(uid, codeInput.trim());
    if (!r.ok) {
      setErr(r.error);
      return;
    }
    onClose();
  };

  const demoCode = verifyUserId ? emailCodes[verifyUserId] : sessionUserId ? emailCodes[sessionUserId] : undefined;

  return (
    <AnimatePresence>
      {open ? (
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (oauthFlow) closeOAuth();
          else onClose();
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
              if (oauthFlow) closeOAuth();
              else onClose();
            }}
            className="absolute right-3 top-3 z-[5] rounded-lg p-2 text-[#BFAF91] hover:bg-white/5 hover:text-[#F2E3C6]"
            aria-label="Close"
          >
            <X size={18} />
          </button>

          <div className="p-6 pt-10">
            {step === "verify-email" ? (
              <div className="space-y-4">
                <h2 id="auth-modal-title" className="font-display text-2xl font-black uppercase italic text-[#F2E3C6]">
                  Verify email
                </h2>
                <p className="text-xs text-[#BFAF91] leading-relaxed">
                  Demo only: no real email is sent. In production this step would use a licensed email provider and server-
                  side verification. Enter the 6-digit code stored locally for this session.
                </p>
                {demoCode && (
                  <p className="rounded-lg border border-[#B11226]/40 bg-[#3A0B10]/30 px-3 py-2 text-[11px] font-mono text-[#F2E3C6]">
                    Demo code: <span className="text-[#C9A45C] font-black tracking-widest">{demoCode}</span>
                  </p>
                )}
                <form onSubmit={handleVerify} className="space-y-3">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">6-digit code</label>
                  <input
                    value={codeInput}
                    onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-3 font-mono text-lg tracking-[0.4em] text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                    placeholder="000000"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                  {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const uid = verifyUserId ?? sessionUserId;
                      if (uid) resendEmailCode(uid);
                    }}
                    className="w-full text-[11px] font-bold uppercase tracking-widest text-[#BFAF91] hover:text-[#C9A45C]"
                  >
                    Resend demo code
                  </button>
                </form>
              </div>
            ) : (
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
                        closeOAuth();
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
                      closeOAuth();
                    }}
                    className={`rounded-md px-2 py-2 text-[10px] font-black uppercase tracking-widest ${
                      tab === "forgot" ? "bg-[#B11226] text-[#F2E3C6]" : "text-[#BFAF91]"
                    }`}
                  >
                    ?
                  </button>
                </div>

                {tab === "forgot" && (
                  <div className="space-y-4 text-sm text-[#BFAF91]">
                    <p>
                      This build has no real password reset. In production, password recovery would run on a secure API with
                      rate limiting and email magic links.
                    </p>
                    <button
                      type="button"
                      onClick={() => setTab("login")}
                      className="text-[#C9A45C] font-bold uppercase text-xs tracking-widest hover:underline"
                    >
                      Back to login
                    </button>
                  </div>
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
                    <label className="flex items-center gap-2 text-[11px] text-[#BFAF91]">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-[#B11226]" />
                      Remember me (demo: session still persists locally)
                    </label>
                    {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                    >
                      Login
                    </button>
                    <AuthDivider label="Or continue with" />
                    <button
                      type="button"
                      onClick={() => {
                        setErr(null);
                        setOauthFlow("google");
                        setOauthAgeOk(false);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A1D19] bg-[#F2E3C6] py-3 text-sm font-black text-[#050505] shadow-sm transition hover:bg-white"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-[#4285F4]">G</span>
                      Continue with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErr(null);
                        setOauthFlow("apple");
                        setOauthAgeOk(false);
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
                      <input type="checkbox" checked={suTerms} onChange={(e) => setSuTerms(e.target.checked)} className="mt-0.5 accent-[#B11226]" />I accept the demo terms (no real-money play).
                    </label>
                    <label className="flex items-start gap-2 text-[11px] text-[#BFAF91]">
                      <input type="checkbox" checked={suAge} onChange={(e) => setSuAge(e.target.checked)} className="mt-0.5 accent-[#B11226]" />I confirm I am 18 or older.
                    </label>
                    {err && <p className="text-[11px] font-bold text-[#E21B35]">{err}</p>}
                    <button
                      type="submit"
                      className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                    >
                      Create account
                    </button>
                    <AuthDivider label="Or sign up with" />
                    <button
                      type="button"
                      onClick={() => {
                        setErr(null);
                        setOauthFlow("google");
                        setOauthAgeOk(false);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#2A1D19] bg-[#F2E3C6] py-3 text-sm font-black text-[#050505] shadow-sm transition hover:bg-white"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white font-black text-[#4285F4]">G</span>
                      Sign up with Google
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setErr(null);
                        setOauthFlow("apple");
                        setOauthAgeOk(false);
                      }}
                      className="flex w-full items-center justify-center gap-3 rounded-xl border border-[#BFAF91]/35 bg-[#050505] py-3 text-sm font-black text-[#F2E3C6] transition hover:border-[#B11226]"
                    >
                      <AppleGlyph className="h-9 w-9 shrink-0 text-[#F2E3C6]" />
                      Sign up with Apple
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          <AnimatePresence>
            {oauthFlow && step === "auth" && (
              <motion.div
                key="oauth-demo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-[15] flex items-center justify-center rounded-2xl bg-[#050505]/92 p-5 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.98 }}
                  transition={{ type: "spring", damping: 24, stiffness: 320 }}
                  className="w-full max-w-sm rounded-xl border border-[#2A1D19] bg-[#15110F] p-5 shadow-xl"
                >
                  <h3 className="font-display text-xl font-black uppercase italic text-[#F2E3C6]">
                    {oauthFlow === "google" ? "Demo Google login" : "Demo Apple login"}
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-[#BFAF91]">
                    No real OAuth tokens are exchanged. This simulates a successful provider sign-in stored only in your browser.
                  </p>
                  <label className="mt-4 flex cursor-pointer items-start gap-2 text-[11px] text-[#BFAF91]">
                    <input
                      type="checkbox"
                      checked={oauthAgeOk}
                      onChange={(e) => {
                        setOauthAgeOk(e.target.checked);
                        setErr(null);
                      }}
                      className="mt-0.5 accent-[#B11226]"
                    />
                    I confirm I am 18+ and accept the Terms.
                  </label>
                  {err && <p className="mt-2 text-[11px] font-bold text-[#E21B35]">{err}</p>}
                  <button
                    type="button"
                    onClick={confirmDemoOAuth}
                    className="mt-4 w-full rounded-xl bg-[#B11226] py-3 text-xs font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35]"
                  >
                    {oauthFlow === "google" ? `Continue as ${DEMO_GOOGLE_EMAIL}` : `Continue as ${DEMO_APPLE_EMAIL}`}
                  </button>
                  <button
                    type="button"
                    onClick={closeOAuth}
                    className="mt-2 w-full py-2 text-[10px] font-bold uppercase tracking-widest text-[#BFAF91] hover:text-[#F2E3C6]"
                  >
                    Back
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
