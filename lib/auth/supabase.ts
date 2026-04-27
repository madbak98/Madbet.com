"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let hasLoggedEnv = false;
let hasWarnedMissing = false;

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
      })
    : null;

function logEnvDebug() {
  if (hasLoggedEnv) return;
  hasLoggedEnv = true;
  console.log("Supabase URL:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log("Supabase ANON:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  console.log("Supabase PUBLISHABLE:", !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
}

export function isSupabaseConfigured(): boolean {
  logEnvDebug();
  return Boolean(supabaseUrl && supabaseKey);
}

export function getSupabaseBrowserClient(): SupabaseClient | null {
  logEnvDebug();
  if (!supabase) {
    if (!hasWarnedMissing) {
      hasWarnedMissing = true;
      console.warn(
        "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to enable auth.",
      );
    }
    console.error("Supabase URL exists:", !!supabaseUrl);
    console.error("Supabase key exists:", !!supabaseKey);
  }
  return supabase;
}
