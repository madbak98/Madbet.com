"use client";

import { useEffect, useState } from "react";
import { useCasinoStore } from "@/store/useCasinoStore";
import { Card } from "@/components/ui/Card";

export default function ResponsiblePlayPage() {
  const sessionStarted = useCasinoStore((s) => s.sessionStartedAt);
  const [minutes, setMinutes] = useState(0);

  useEffect(() => {
    const update = () => setMinutes(Math.floor((Date.now() - new Date(sessionStarted).getTime()) / 60000));
    update();
    const timer = setInterval(update, 15000);
    return () => clearInterval(timer);
  }, [sessionStarted]);

  return (
    <div className="space-y-4">
      <h1 className="display-title text-4xl">Responsible Play</h1>
      <Card>This is a demo-only portfolio product. No real money, no legal gambling service, no deposits, and no withdrawals.</Card>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>Session timer: {minutes} min</Card>
        <Card>Spending limit (demo): 5,000 DC</Card>
        <Card>Cool-down mode: Off · Self-exclusion: Demo toggle</Card>
      </div>
    </div>
  );
}
