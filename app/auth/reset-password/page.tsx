"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { passwordMeetsPolicy } from "@/lib/auth/password-mock";

export default function ResetPasswordPage() {
  const router = useRouter();
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordMeetsPolicy(password)) {
      setError("Password must be 8+ chars with upper, lower, and a number.");
      return;
    }
    setBusy(true);
    const r = await resetPassword(password);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setOk("Password reset successful. Redirecting...");
    setTimeout(() => router.replace("/"), 900);
  };

  return (
    <main className="min-h-screen bg-[#050505] text-[#F2E3C6] flex items-center justify-center p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6 space-y-4">
        <h1 className="font-display text-2xl font-black uppercase italic">Reset password</h1>
        <label className="block text-[10px] font-black uppercase text-[#BFAF91]">
          New password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>
        <label className="block text-[10px] font-black uppercase text-[#BFAF91]">
          Confirm new password
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-xl border border-[#2A1D19] bg-[#050505] px-4 py-2.5 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          />
        </label>
        {error && <p className="text-[11px] font-bold text-[#E21B35]">{error}</p>}
        {ok && <p className="text-[11px] font-bold text-[#7ddf8a]">{ok}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[#B11226] py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] hover:bg-[#E21B35] disabled:opacity-60"
        >
          Update password
        </button>
      </form>
    </main>
  );
}
