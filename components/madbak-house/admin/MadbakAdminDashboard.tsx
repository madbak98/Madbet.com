"use client";

import { useMemo, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD } from "@/lib/auth/types";
import { formatCurrency } from "@/lib/madbak-format";

export function MadbakAdminDashboard({ onNotify }: { onNotify: (msg: string, type?: "success" | "error") => void }) {
  const users = useAuthStore((s) => s.users);
  const adminApproveKyc = useAuthStore((s) => s.adminApproveKyc);
  const adminRejectKyc = useAuthStore((s) => s.adminRejectKyc);
  const adminAdjustBalance = useAuthStore((s) => s.adminAdjustBalance);
  const adminSetBanned = useAuthStore((s) => s.adminSetBanned);
  const [deltaByUser, setDeltaByUser] = useState<Record<string, string>>({});
  const [reasonByUser, setReasonByUser] = useState<Record<string, string>>({});

  const sorted = useMemo(() => [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [users]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-16 md:px-8">
      <div>
        <h1 className="font-display text-4xl font-black uppercase italic text-white">Admin — demo users</h1>
        <p className="mt-2 max-w-2xl text-xs text-[#BFAF91]">
          Seeded demo admin: <span className="font-mono text-[#C9A45C]">{DEMO_ADMIN_EMAIL}</span> / password{" "}
          <span className="font-mono text-[#C9A45C]">{DEMO_ADMIN_PASSWORD}</span>. All data is local-only.
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#2A1D19] bg-[#15110F]">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead className="border-b border-[#2A1D19] text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Balance</th>
              <th className="p-3">Email ✓</th>
              <th className="p-3">Auth</th>
              <th className="p-3">KYC</th>
              <th className="p-3">Role</th>
              <th className="p-3">Created</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody className="text-[#F2E3C6]">
            {sorted.map((u) => (
              <tr key={u.id} className="border-b border-[#1a1512] hover:bg-[#0D0D0D]/80">
                <td className="p-3 font-bold">{u.username}</td>
                <td className="p-3 font-mono text-[11px] text-[#BFAF91]">{u.email}</td>
                <td className="p-3 font-mono">{formatCurrency(u.balance)}</td>
                <td className="p-3">{u.emailVerified ? "Yes" : "No"}</td>
                <td className="p-3 uppercase text-[#BFAF91]">{u.authProvider ?? "email"}</td>
                <td className="p-3 uppercase text-[#BFAF91]">{u.kycStatus.replace("_", " ")}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3 text-[#BFAF91]">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      disabled={u.kycStatus !== "pending_review"}
                      onClick={() => {
                        adminApproveKyc(u.id);
                        onNotify(`Approved KYC for ${u.username}`, "success");
                      }}
                      className="rounded border border-[#2d5a2d] px-2 py-1 text-[10px] font-bold uppercase text-[#7ddf8a] disabled:opacity-30"
                    >
                      Approve KYC
                    </button>
                    <button
                      type="button"
                      disabled={u.kycStatus !== "pending_review"}
                      onClick={() => {
                        adminRejectKyc(u.id);
                        onNotify(`Rejected KYC for ${u.username}`, "success");
                      }}
                      className="rounded border border-[#5a1018] px-2 py-1 text-[10px] font-bold uppercase text-[#E21B35] disabled:opacity-30"
                    >
                      Reject KYC
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const raw = Number(deltaByUser[u.id] ?? 0);
                        if (!Number.isFinite(raw) || raw === 0) {
                          onNotify("Enter a non-zero balance adjustment.", "error");
                          return;
                        }
                        const reason = (reasonByUser[u.id] ?? "").trim() || "Admin balance adjustment";
                        adminAdjustBalance(u.id, raw, reason);
                        onNotify(`Adjusted ${u.username}: ${raw >= 0 ? "+" : ""}${Math.floor(raw)} DBAK`, "success");
                        setDeltaByUser((prev) => ({ ...prev, [u.id]: "" }));
                      }}
                      className="rounded border border-[#2A1D19] px-2 py-1 text-[10px] font-bold uppercase text-[#C9A45C]"
                    >
                      Apply $
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        adminSetBanned(u.id, !u.banned);
                        onNotify(u.banned ? `Unbanned ${u.username}` : `Banned ${u.username}`, "success");
                      }}
                      className="rounded border border-[#2A1D19] px-2 py-1 text-[10px] font-bold uppercase text-[#BFAF91]"
                    >
                      {u.banned ? "Unban" : "Ban"}
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-[120px_1fr]">
                    <input
                      type="number"
                      placeholder="+ / - amount"
                      value={deltaByUser[u.id] ?? ""}
                      onChange={(e) => setDeltaByUser((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      className="rounded border border-[#2A1D19] bg-[#0D0D0D] px-2 py-1 text-[10px] font-mono text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Reason (required in production)"
                      value={reasonByUser[u.id] ?? ""}
                      onChange={(e) => setReasonByUser((prev) => ({ ...prev, [u.id]: e.target.value }))}
                      className="rounded border border-[#2A1D19] bg-[#0D0D0D] px-2 py-1 text-[10px] text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
