"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function AuthCallbackPage() {
  const router = useRouter();
  const initializeAuth = useAuthStore((s) => s.initializeAuth);

  useEffect(() => {
    let alive = true;
    (async () => {
      await initializeAuth();
      if (alive) router.replace("/");
    })();
    return () => {
      alive = false;
    };
  }, [initializeAuth, router]);

  return (
    <main className="min-h-screen bg-[#050505] text-[#F2E3C6] flex items-center justify-center">
      <p className="text-sm uppercase tracking-widest text-[#BFAF91]">Finalizing sign in...</p>
    </main>
  );
}
