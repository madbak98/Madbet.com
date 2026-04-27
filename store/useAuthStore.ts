"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthChangeEvent, User as SupabaseUser } from "@supabase/supabase-js";
import {
  type AccountVerificationStatus,
  type AuthProvider,
  type GameHistoryEntry,
  type KycFormData,
  type MadbakUser,
  INITIAL_DEMO_BALANCE,
} from "@/lib/auth/types";
import { isAtLeast18, isValidEmail } from "@/lib/auth/validators";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/auth/supabase";

const STORAGE_KEY = "madbak-house-auth";

function randomId(): string {
  return crypto.randomUUID();
}

function defaultSessions() {
  return [
    { id: randomId(), device: "Current session", location: "Provider auth", lastActive: new Date().toISOString(), current: true },
  ];
}

function normalizeStoredUser(u: MadbakUser): MadbakUser {
  const authProvider = u.authProvider ?? "email";
  const verificationStatus: AccountVerificationStatus =
    u.verificationStatus ??
    (u.emailVerified ? (u.kycStatus === "approved" ? "approved" : "email_verified") : "email_unverified");
  const gameHistory = (u.gameHistory ?? []).map((g) => ({
    ...g,
    type: g.type ?? "manual",
    reason: g.reason ?? `${g.game ?? "wallet"} balance update`,
  }));
  return { ...u, authProvider, verificationStatus, gameHistory };
}

function providerFromUser(user: SupabaseUser): AuthProvider {
  const p = user.app_metadata?.provider ?? user.identities?.[0]?.provider ?? "email";
  return p === "google" || p === "apple" ? p : "email";
}

function usernameFromUser(user: SupabaseUser): string {
  const md = user.user_metadata ?? {};
  return (
    (typeof md.username === "string" && md.username) ||
    (typeof md.full_name === "string" && md.full_name) ||
    (typeof md.name === "string" && md.name) ||
    (typeof md.preferred_username === "string" && md.preferred_username) ||
    (user.email ? user.email.split("@")[0] : "") ||
    "madbak_player"
  );
}

function avatarFromUser(user: SupabaseUser): string | null {
  const md = user.user_metadata ?? {};
  if (typeof md.avatar_url === "string" && md.avatar_url) return md.avatar_url;
  if (typeof md.picture === "string" && md.picture) return md.picture;
  return null;
}

type SignUpInput = {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  country: string;
};

type AuthResult = { ok: true; message?: string } | { ok: false; error: string };
const AUTH_UNAVAILABLE: AuthResult = { ok: false, error: "Sign in is temporarily unavailable." };

type AuthState = {
  users: MadbakUser[];
  sessionUserId: string | null;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  getUser: (id: string) => MadbakUser | undefined;
  getUserByEmail: (email: string) => MadbakUser | undefined;

  initializeAuth: () => Promise<void>;
  signUp: (input: SignUpInput) => Promise<AuthResult>;
  login: (email: string, password: string) => Promise<AuthResult>;
  signInWithOAuth: (provider: "google" | "apple") => Promise<AuthResult>;
  forgotPassword: (email: string) => Promise<AuthResult>;
  resetPassword: (nextPassword: string) => Promise<AuthResult>;
  logout: () => Promise<void>;

  submitKyc: (userId: string, data: Omit<KycFormData, "submittedAt">) => { ok: true } | { ok: false; error: string };
  setKycStatus: (userId: string, status: MadbakUser["kycStatus"]) => void;
  adjustBalance: (delta: number, meta?: { game?: string; type?: GameHistoryEntry["type"]; reason?: string }) => void;
  changePasswordDemo: (_currentPassword: string, newPassword: string) => Promise<AuthResult>;
  setTwoFactorDemo: (enabled: boolean) => void;
  adminApproveKyc: (userId: string) => void;
  adminRejectKyc: (userId: string) => void;
  adminAdjustBalance: (userId: string, delta: number, reason: string) => void;
  adminSetBanned: (userId: string, banned: boolean) => void;
  ensureSeedAdmin: () => void;
};

let authSubUnsubscribe: (() => void) | null = null;

async function syncSessionUser(event?: AuthChangeEvent) {
  const store = useAuthStore.getState();
  if (!isSupabaseConfigured()) {
    void store.logout();
    return;
  }
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const sessionUser = data.session?.user;
  if (!sessionUser) {
    useAuthStore.setState({ sessionUserId: null });
    return;
  }
  const provider = providerFromUser(sessionUser);
  const email = (sessionUser.email ?? "").trim().toLowerCase();
  const now = new Date().toISOString();
  const avatarUrl = avatarFromUser(sessionUser);
  useAuthStore.setState((s) => {
    const existing = s.users.find((u) => u.id === sessionUser.id) ?? s.users.find((u) => u.email === email);
    const merged: MadbakUser = {
      id: sessionUser.id,
      username: usernameFromUser(sessionUser),
      email,
      avatarUrl,
      passwordHashMock: "",
      dateOfBirth: (sessionUser.user_metadata?.dateOfBirth as string) || existing?.dateOfBirth || "1990-01-01",
      country: (sessionUser.user_metadata?.country as string) || existing?.country || "Unknown",
      createdAt: existing?.createdAt || now,
      emailVerified: Boolean(sessionUser.email_confirmed_at) || provider !== "email",
      verificationStatus: existing?.kycStatus === "approved" ? "approved" : Boolean(sessionUser.email_confirmed_at) || provider !== "email" ? "email_verified" : "email_unverified",
      authProvider: provider,
      kycStatus: existing?.kycStatus ?? "none",
      kycData: existing?.kycData ?? null,
      balance: existing?.balance ?? INITIAL_DEMO_BALANCE,
      role: existing?.role ?? "user",
      vipLevel: existing?.vipLevel ?? "Crimson",
      banned: existing?.banned ?? false,
      twoFactorDemoEnabled: existing?.twoFactorDemoEnabled ?? false,
      gameHistory: existing?.gameHistory ?? [],
      activeSessionsMock: existing?.activeSessionsMock ?? defaultSessions(),
      loginHistoryMock:
        event === "SIGNED_IN"
          ? [{ id: randomId(), at: now, device: "Supabase auth", ip: "provider-session", success: true }, ...(existing?.loginHistoryMock ?? [])].slice(0, 40)
          : existing?.loginHistoryMock ?? [],
    };
    const withoutOld = s.users.filter((u) => u.id !== merged.id && u.email !== merged.email);
    return { users: [...withoutOld, normalizeStoredUser(merged)], sessionUserId: merged.id };
  });
  const current = useAuthStore.getState().getUser(sessionUser.id);
  if (current) {
    await supabase.from("profiles").upsert(
      {
        id: current.id,
        email: current.email,
        username: current.username,
        avatar_url: current.avatarUrl ?? null,
        auth_provider: current.authProvider,
        created_at: current.createdAt,
        balance: current.balance,
        role: current.role,
        kyc_status: current.kycStatus,
      },
      { onConflict: "id" },
    );
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      sessionUserId: null,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
      getUser: (id) => get().users.find((u) => u.id === id),
      getUserByEmail: (email) => get().users.find((u) => u.email === email.trim().toLowerCase()),

      initializeAuth: async () => {
        if (!isSupabaseConfigured()) return;
        await syncSessionUser();
        if (authSubUnsubscribe) return;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return;
        const { data } = supabase.auth.onAuthStateChange(async (event) => {
          await syncSessionUser(event);
        });
        authSubUnsubscribe = () => data.subscription.unsubscribe();
      },

      signUp: async (input) => {
        if (!isSupabaseConfigured()) return AUTH_UNAVAILABLE;
        if (!input.username.trim()) return { ok: false, error: "Username is required." };
        if (!isValidEmail(input.email)) return { ok: false, error: "Enter a valid email address." };
        if (!isAtLeast18(input.dateOfBirth)) return { ok: false, error: "You must be 18 or older." };
        if (!input.country.trim()) return { ok: false, error: "Country is required." };

        const supabase = getSupabaseBrowserClient();
        if (!supabase) return AUTH_UNAVAILABLE;
        const { error } = await supabase.auth.signUp({
          email: input.email.trim().toLowerCase(),
          password: input.password,
        });
        if (error) return { ok: false, error: error.message };
        await syncSessionUser();
        return { ok: true, message: "Check your email to verify account." };
      },

      login: async (email, password) => {
        if (!isSupabaseConfigured()) return AUTH_UNAVAILABLE;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return AUTH_UNAVAILABLE;
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) return { ok: false, error: error.message };
        await syncSessionUser("SIGNED_IN");
        return { ok: true };
      },

      signInWithOAuth: async (provider) => {
        if (!isSupabaseConfigured()) return AUTH_UNAVAILABLE;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return AUTH_UNAVAILABLE;
        const redirectTo = typeof window !== "undefined" ? window.location.origin : undefined;
        const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo } });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      forgotPassword: async (email) => {
        if (!isSupabaseConfigured()) return AUTH_UNAVAILABLE;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return AUTH_UNAVAILABLE;
        const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined;
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), { redirectTo });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      resetPassword: async (nextPassword) => {
        if (!isSupabaseConfigured()) return AUTH_UNAVAILABLE;
        const supabase = getSupabaseBrowserClient();
        if (!supabase) return AUTH_UNAVAILABLE;
        const { error } = await supabase.auth.updateUser({ password: nextPassword });
        if (error) return { ok: false, error: error.message };
        return { ok: true };
      },

      logout: async () => {
        if (isSupabaseConfigured()) {
          const supabase = getSupabaseBrowserClient();
          if (supabase) {
            await supabase.auth.signOut();
          }
        }
        set({ sessionUserId: null });
      },

      submitKyc: (userId, data) => {
        const existing = get().getUser(userId);
        if (!existing) return { ok: false, error: "User not found." };
        if (existing.kycStatus === "pending_review") return { ok: false, error: "Verification is already under review." };
        if (existing.kycStatus === "approved") return { ok: false, error: "Identity is already approved." };
        if (!data.fullLegalName.trim()) return { ok: false, error: "Legal name is required." };
        if (!data.idNumber.trim()) return { ok: false, error: "ID number is required." };
        if (!data.mockIdFrontSet || !data.mockSelfieSet) return { ok: false, error: "Mark both demo upload placeholders as set." };
        const submittedAt = new Date().toISOString();
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, kycStatus: "pending_review", verificationStatus: "pending_review", kycData: { ...data, submittedAt } } : u)),
        }));
        return { ok: true };
      },

      setKycStatus: (userId, status) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const vs: AccountVerificationStatus =
              status === "approved" ? "approved" : status === "rejected" ? "rejected" : status === "pending_review" ? "pending_review" : u.verificationStatus;
            return { ...u, kycStatus: status, verificationStatus: vs };
          }),
        })),

      adjustBalance: (delta, meta) => {
        const uid = get().sessionUserId;
        if (!uid) return;
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== uid) return u;
            const nextBal = Math.max(0, u.balance + delta);
            const row: GameHistoryEntry = {
              id: randomId(),
              game: meta?.game ?? "wallet",
              type: meta?.type ?? "game_result",
              delta,
              reason: meta?.reason ?? (meta?.game ? `${meta.game} balance update` : "Balance update"),
              balanceAfter: nextBal,
              createdAt: new Date().toISOString(),
            };
            return { ...u, balance: nextBal, gameHistory: [row, ...u.gameHistory].slice(0, 120) };
          }),
        }));
      },

      changePasswordDemo: async (_currentPassword, newPassword) => {
        return get().resetPassword(newPassword);
      },

      setTwoFactorDemo: (enabled) => {
        const uid = get().sessionUserId;
        if (!uid) return;
        set((s) => ({ users: s.users.map((u) => (u.id === uid ? { ...u, twoFactorDemoEnabled: enabled } : u)) }));
      },

      adminApproveKyc: (userId) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId && u.kycStatus === "pending_review" ? { ...u, kycStatus: "approved", verificationStatus: "approved" } : u)) })),
      adminRejectKyc: (userId) =>
        set((s) => ({ users: s.users.map((u) => (u.id === userId && u.kycStatus === "pending_review" ? { ...u, kycStatus: "rejected", verificationStatus: "rejected" } : u)) })),

      adminAdjustBalance: (userId, delta, reason) =>
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const nextBal = Math.max(0, u.balance + delta);
            const row: GameHistoryEntry = { id: randomId(), game: "admin", type: "admin_adjustment", delta, reason: reason.trim() || "Admin balance adjustment", balanceAfter: nextBal, createdAt: new Date().toISOString() };
            return { ...u, balance: nextBal, gameHistory: [row, ...u.gameHistory].slice(0, 120) };
          }),
        })),

      adminSetBanned: (userId, banned) => {
        set((s) => ({ users: s.users.map((u) => (u.id === userId ? { ...u, banned } : u)) }));
        if (get().sessionUserId === userId && banned) set({ sessionUserId: null });
      },

      ensureSeedAdmin: () => {},
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ users: s.users, sessionUserId: s.sessionUserId }),
    },
  ),
);

export function useCurrentUser(): MadbakUser | null {
  return useAuthStore((s) => (s.sessionUserId ? s.getUser(s.sessionUserId) ?? null : null));
}
