"use client";

import type { MadbakUser } from "@/lib/auth/types";
import { getVerificationLevel, verificationLevelLabel } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/madbak-format";

function accountAge(createdAt: string): string {
  const ms = Date.now() - new Date(createdAt).getTime();
  const days = Math.floor(ms / 86400000);
  if (days < 1) return "< 1 day";
  if (days < 30) return `${days} day${days === 1 ? "" : "s"}`;
  const mo = Math.floor(days / 30);
  return `${mo} month${mo === 1 ? "" : "s"}`;
}

export function MadbakProfileView({
  user,
  onGoSecurity,
  onGoVerify,
}: {
  user: MadbakUser;
  onGoSecurity: () => void;
  onGoVerify: () => void;
}) {
  const level = getVerificationLevel(user, true);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-16 md:px-8">
      <h1 className="font-display text-4xl font-black uppercase italic text-white">Profile</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6 md:col-span-2">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full border-2 border-[#B11226] bg-[#0D0D0D] text-2xl font-black text-[#F2E3C6]">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-2xl font-black text-[#F2E3C6]">{user.username}</div>
              <div className="text-sm text-[#BFAF91]">{user.email}</div>
              <div className="mt-2 inline-block rounded border border-[#C9A45C]/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-[#C9A45C]">
                VIP {user.vipLevel}
              </div>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Demo balance</p>
          <p className="mt-2 font-mono text-3xl font-black text-[#F2E3C6]">
            {formatCurrency(user.balance)} <span className="text-lg text-[#C9A45C]">DBAK</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Account</h3>
          <ul className="mt-3 space-y-2 text-sm text-[#F2E3C6]">
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">Account age</span>
              <span className="font-mono">{accountAge(user.createdAt)}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">Sign-in</span>
              <span className="uppercase">
                {user.authProvider === "google" ? "Google" : user.authProvider === "apple" ? "Apple" : "Email"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">Email</span>
              <span>{user.emailVerified ? "Verified" : "Pending"}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">Account status</span>
              <span className="text-right text-[11px] uppercase text-[#BFAF91]">{user.verificationStatus.replace("_", " ")}</span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">Verification level</span>
              <span>
                L{level} — {verificationLevelLabel(level)}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-[#BFAF91]">KYC status</span>
              <span className="uppercase">{user.kycStatus.replace("_", " ")}</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-5">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Shortcuts</h3>
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              onClick={onGoVerify}
              className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-[#BFAF91] hover:border-[#B11226] hover:text-[#F2E3C6]"
            >
              Verify account / KYC
            </button>
            <button
              type="button"
              onClick={onGoSecurity}
              className="rounded-lg border border-[#2A1D19] bg-[#0D0D0D] px-4 py-2 text-left text-xs font-bold uppercase tracking-wide text-[#BFAF91] hover:border-[#B11226] hover:text-[#F2E3C6]"
            >
              Security settings
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#2A1D19] bg-[#15110F] p-5">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Game history (demo)</h3>
        {user.gameHistory.length === 0 ? (
          <p className="mt-3 text-sm text-[#BFAF91]">No rounds recorded yet.</p>
        ) : (
          <ul className="mt-3 max-h-64 space-y-1.5 overflow-y-auto text-[11px] font-mono">
            {user.gameHistory.map((g) => (
              <li key={g.id} className="flex flex-wrap justify-between gap-2 rounded border border-[#1f1613] bg-[#0D0D0D] px-2 py-1.5 text-[#F2E3C6]">
                <span className="text-[#BFAF91]">{g.type.replace("_", " ")} · {g.game}</span>
                <span className={g.delta >= 0 ? "text-[#C9A45C]" : "text-[#E21B35]"}>
                  {g.delta >= 0 ? "+" : ""}
                  {Math.floor(g.delta)}
                </span>
                <span className="text-[#BFAF91]/80">{g.reason}</span>
                <span className="text-[#BFAF91]/70">Bal {Math.floor(g.balanceAfter)}</span>
                <span className="text-[#BFAF91]/70">{new Date(g.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <p className="text-[10px] uppercase leading-relaxed text-[#BFAF91]/80">
        Madbak House is a demo portfolio surface. Coins are fake. KYC is simulated unless wired to a licensed provider. No
        real-money gambling is enabled.
      </p>
    </div>
  );
}
