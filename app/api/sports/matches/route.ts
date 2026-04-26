import { NextResponse } from "next/server";
import { MOCK_MATCHES } from "@/lib/sports/mockSports";

/**
 * Demo route — returns normalized mock fixtures.
 *
 * Production: replace this body with a server-side fetch to your provider
 * (The Odds API, API-Football, Sportradar, etc.). Never expose SPORTS_API_KEY
 * to the browser; keep secrets in server env only.
 */
export async function GET() {
  return NextResponse.json({
    mode: process.env.NEXT_PUBLIC_SPORTS_MODE ?? "mock",
    matches: MOCK_MATCHES,
    generatedAt: new Date().toISOString(),
  });
}
