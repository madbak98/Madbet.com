"use client";

import Link from "next/link";
import { useState, useCallback } from "react";
import { MadbakAdminDashboard } from "@/components/madbak-house/admin/MadbakAdminDashboard";

export default function AdminPage() {
  const [toast, setToast] = useState<string | null>(null);
  const onNotify = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-[#F2E3C6]">
      <div className="border-b border-[#2A1D19] bg-[#0a0807] px-4 py-2 text-center text-[9px] font-bold uppercase tracking-widest text-[#BFAF91]/85">
        Demo admin — same user store as MADBAK HOUSE shell at /. Sign in as seeded admin on the home app to use in-context
        admin.
      </div>
      {toast ? (
        <p className="border-b border-[#2A1D19] bg-[#15110F] py-2 text-center text-xs font-bold text-[#C9A45C]">{toast}</p>
      ) : null}
      <MadbakAdminDashboard onNotify={onNotify} />
      <p className="px-4 py-6 text-center text-sm text-[#BFAF91]">
        <Link href="/" className="font-bold text-[#B11226] hover:underline">
          Open full MADBAK HOUSE experience
        </Link>
      </p>
    </div>
  );
}
