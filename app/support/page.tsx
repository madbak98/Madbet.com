"use client";

import { AppShell } from "@/components/layout/AppShell";
import { SupportForm } from "@/components/support/SupportForm";

export default function SupportPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
          <h1 className="display-title text-4xl">Support</h1>
          <p className="mt-2 text-sm text-[#BFAF91]">Messages are sent directly to the MADBAK team.</p>
          <p className="mt-1 text-xs uppercase tracking-widest text-[#BFAF91]/80">Fake coins only · No real-money features enabled</p>
        </section>

        <section className="rounded-2xl border border-[#2A1D19] bg-[#15110F] p-6">
          <SupportForm />
        </section>
      </div>
    </AppShell>
  );
}
