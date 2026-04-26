"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  type MadbakUser,
  type AuthProvider,
  type AccountVerificationStatus,
  type KycFormData,
  type GameHistoryEntry,
  type MockSessionRow,
  type MockLoginHistoryRow,
  INITIAL_DEMO_BALANCE,
  DEMO_ADMIN_EMAIL,
  DEMO_ADMIN_PASSWORD,
  DEMO_GOOGLE_EMAIL,
  DEMO_APPLE_EMAIL,
} from "@/lib/auth/types";
import { mockPasswordHash, verifyMockPassword } from "@/lib/auth/password-mock";
import { isValidEmail, isAtLeast18 } from "@/lib/auth/validators";

const STORAGE_KEY = "madbak-house-auth-demo";

function randomId(): string {
  return crypto.randomUUID();
}

function sixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function defaultSessions(): MockSessionRow[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomId(),
      device: "Chrome · macOS",
      location: "Demo region",
      lastActive: now,
      current: true,
    },
    {
      id: randomId(),
      device: "Safari · iOS",
      location: "Demo region",
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      current: false,
    },
  ];
}

function defaultLoginHistory(): MockLoginHistoryRow[] {
  return [
    {
      id: randomId(),
      at: new Date(Date.now() - 3600000).toISOString(),
      device: "Chrome · macOS",
      ip: "203.0.113.0 (demo)",
      success: true,
    },
  ];
}

/** Migrates persisted users from before authProvider / verificationStatus existed. */
function normalizeStoredUser(u: MadbakUser): MadbakUser {
  const raw = u as MadbakUser & { authProvider?: AuthProvider; verificationStatus?: AccountVerificationStatus };
  const authProvider: AuthProvider = raw.authProvider ?? "email";
  let verificationStatus: AccountVerificationStatus | undefined = raw.verificationStatus;
  if (!verificationStatus) {
    if (!u.emailVerified) verificationStatus = "email_unverified";
    else if (u.kycStatus === "pending_review") verificationStatus = "pending_review";
    else if (u.kycStatus === "approved") verificationStatus = "approved";
    else if (u.kycStatus === "rejected") verificationStatus = "rejected";
    else verificationStatus = "email_verified";
  }
  const gameHistory = (u.gameHistory ?? []).map((g) => ({
    ...g,
    type: g.type ?? "manual",
    reason: g.reason ?? `${g.game ?? "wallet"} balance update`,
  }));
  return { ...u, authProvider, verificationStatus, gameHistory };
}

function seedAdminUser(): MadbakUser {
  const now = new Date().toISOString();
  return {
    id: "seed-admin",
    username: "house_admin",
    email: DEMO_ADMIN_EMAIL.toLowerCase(),
    passwordHashMock: mockPasswordHash(DEMO_ADMIN_PASSWORD),
    dateOfBirth: "1990-01-01",
    country: "United States",
    createdAt: now,
    emailVerified: true,
    verificationStatus: "approved",
    authProvider: "email",
    kycStatus: "approved",
    kycData: {
      fullLegalName: "Demo Administrator",
      dateOfBirth: "1990-01-01",
      nationality: "US",
      countryOfResidence: "United States",
      idType: "passport",
      idNumber: "DEMO-ADMIN-ID",
      address: "1 Portfolio Blvd",
      mockIdFrontSet: true,
      mockSelfieSet: true,
      submittedAt: now,
    },
    balance: INITIAL_DEMO_BALANCE,
    role: "admin",
    vipLevel: "Obsidian",
    banned: false,
    twoFactorDemoEnabled: false,
    gameHistory: [],
    activeSessionsMock: defaultSessions(),
    loginHistoryMock: defaultLoginHistory(),
  };
}

type SignUpInput = {
  username: string;
  email: string;
  password: string;
  dateOfBirth: string;
  country: string;
};

type AuthState = {
  users: MadbakUser[];
  sessionUserId: string | null;
  /** userId -> expected 6-digit code (demo only; production uses server + email provider) */
  emailCodes: Record<string, string>;

  /** Hydration flag for client-only UI */
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;

  getUser: (id: string) => MadbakUser | undefined;
  getUserByEmail: (email: string) => MadbakUser | undefined;

  signUp: (input: SignUpInput) => { ok: true; userId: string } | { ok: false; error: string };
  login: (email: string, password: string, rememberMe: boolean) => { ok: true } | { ok: false; error: string };
  logout: () => void;

  setEmailVerificationCode: (userId: string, code: string) => void;
  confirmEmailCode: (userId: string, code: string) => { ok: true } | { ok: false; error: string };
  resendEmailCode: (userId: string) => string;

  submitKyc: (userId: string, data: Omit<KycFormData, "submittedAt">) => { ok: true } | { ok: false; error: string };
  setKycStatus: (userId: string, status: MadbakUser["kycStatus"]) => void;

  adjustBalance: (delta: number, meta?: { game?: string; type?: GameHistoryEntry["type"]; reason?: string }) => void;

  changePasswordDemo: (currentPassword: string, newPassword: string) => { ok: true } | { ok: false; error: string };
  setTwoFactorDemo: (enabled: boolean) => void;

  adminApproveKyc: (userId: string) => void;
  adminRejectKyc: (userId: string) => void;
  adminAdjustBalance: (userId: string, delta: number, reason: string) => void;
  adminSetBanned: (userId: string, banned: boolean) => void;

  ensureSeedAdmin: () => void;

  /**
   * Demo-only: simulates Google / Apple sign-in without real OAuth.
   * Production: use NextAuth.js / Auth.js, Clerk, Supabase Auth, or Firebase Auth with official SDKs;
   * Apple Sign In requires Apple Developer Program setup (Services ID, key, domain verification).
   * Never implement OAuth token exchange manually in production.
   */
  demoSocialAuth: (provider: "google" | "apple") => { ok: true } | { ok: false; error: string };
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      sessionUserId: null,
      emailCodes: {},
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      getUser: (id) => get().users.find((u) => u.id === id),
      getUserByEmail: (email) => get().users.find((u) => u.email === email.trim().toLowerCase()),

      ensureSeedAdmin: () => {
        set((s) => {
          let users = s.users.map(normalizeStoredUser);
          if (!users.some((u) => u.role === "admin")) {
            users = [...users, seedAdminUser()];
          }
          return { users };
        });
      },

      signUp: (input) => {
        const email = input.email.trim().toLowerCase();
        if (!input.username.trim()) return { ok: false, error: "Username is required." };
        if (!isValidEmail(input.email)) return { ok: false, error: "Enter a valid email address." };
        if (!isAtLeast18(input.dateOfBirth)) return { ok: false, error: "You must be 18 or older." };
        if (!input.country.trim()) return { ok: false, error: "Country is required." };
        if (get().getUserByEmail(email)) return { ok: false, error: "An account with this email already exists." };

        const id = randomId();
        const now = new Date().toISOString();
        const user: MadbakUser = {
          id,
          username: input.username.trim(),
          email,
          passwordHashMock: mockPasswordHash(input.password),
          dateOfBirth: input.dateOfBirth,
          country: input.country.trim(),
          createdAt: now,
          emailVerified: false,
          verificationStatus: "email_unverified",
          authProvider: "email",
          kycStatus: "none",
          kycData: null,
          balance: INITIAL_DEMO_BALANCE,
          role: "user",
          vipLevel: "Crimson",
          banned: false,
          twoFactorDemoEnabled: false,
          gameHistory: [],
          activeSessionsMock: defaultSessions(),
          loginHistoryMock: [],
        };

        const code = sixDigitCode();
        set((s) => ({
          users: [...s.users, user],
          sessionUserId: id,
          emailCodes: { ...s.emailCodes, [id]: code },
        }));

        return { ok: true, userId: id };
      },

      login: (email, password, rememberMe) => {
        void rememberMe;
        const u = get().getUserByEmail(email);
        if (!u) return { ok: false, error: "Invalid email or password." };
        if (u.banned) return { ok: false, error: "This demo account is suspended." };
        if (!verifyMockPassword(password, u.passwordHashMock)) return { ok: false, error: "Invalid email or password." };

        const now = new Date().toISOString();
        set((s) => ({
          sessionUserId: u.id,
          users: s.users.map((x) =>
            x.id === u.id
              ? {
                  ...x,
                  loginHistoryMock: [
                    {
                      id: randomId(),
                      at: now,
                      device: "This device (demo)",
                      ip: "198.51.100.0 (demo)",
                      success: true,
                    },
                    ...x.loginHistoryMock,
                  ].slice(0, 40),
                }
              : x,
          ),
        }));
        return { ok: true };
      },

      logout: () => set({ sessionUserId: null }),

      setEmailVerificationCode: (userId, code) =>
        set((s) => ({
          emailCodes: { ...s.emailCodes, [userId]: code },
        })),

      confirmEmailCode: (userId, code) => {
        const expected = get().emailCodes[userId];
        if (!expected || code.trim() !== expected) return { ok: false, error: "Invalid or expired code." };
        set((s) => {
          const nextCodes = { ...s.emailCodes };
          delete nextCodes[userId];
          return {
            emailCodes: nextCodes,
            users: s.users.map((u) =>
              u.id === userId ? { ...u, emailVerified: true, verificationStatus: "email_verified" as const } : u,
            ),
          };
        });
        return { ok: true };
      },

      resendEmailCode: (userId) => {
        const code = sixDigitCode();
        get().setEmailVerificationCode(userId, code);
        return code;
      },

      submitKyc: (userId, data) => {
        const existing = get().getUser(userId);
        if (!existing) return { ok: false, error: "User not found." };
        if (existing.kycStatus === "pending_review") {
          return { ok: false, error: "Verification is already under review." };
        }
        if (existing.kycStatus === "approved") {
          return { ok: false, error: "Identity is already approved." };
        }
        if (!data.fullLegalName.trim()) return { ok: false, error: "Legal name is required." };
        if (!data.idNumber.trim()) return { ok: false, error: "ID number is required." };
        if (!data.mockIdFrontSet || !data.mockSelfieSet) {
          return { ok: false, error: "Mark both demo upload placeholders as set (no real upload in this build)." };
        }
        const submittedAt = new Date().toISOString();
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  kycStatus: "pending_review",
                  verificationStatus: "pending_review",
                  kycData: { ...data, submittedAt },
                }
              : u,
          ),
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
            const game = meta?.game ?? "wallet";
            const type = meta?.type ?? "game_result";
            const reason = meta?.reason ?? (meta?.game ? `${meta.game} balance update` : "Balance update");
            const gh: GameHistoryEntry[] = [
              {
                id: randomId(),
                game,
                type,
                delta,
                reason,
                balanceAfter: nextBal,
                createdAt: new Date().toISOString(),
              },
              ...u.gameHistory,
            ].slice(0, 120);
            return { ...u, balance: nextBal, gameHistory: gh };
          }),
        }));
      },

      changePasswordDemo: (currentPassword, newPassword) => {
        const uid = get().sessionUserId;
        if (!uid) return { ok: false, error: "Not signed in." };
        const u = get().getUser(uid);
        if (!u) return { ok: false, error: "Not signed in." };
        if (u.authProvider !== "email") {
          return { ok: false, error: "Password change applies to email accounts. Use your provider to manage access in production." };
        }
        if (!verifyMockPassword(currentPassword, u.passwordHashMock)) {
          return { ok: false, error: "Current password is incorrect." };
        }
        set((s) => ({
          users: s.users.map((x) =>
            x.id === uid ? { ...x, passwordHashMock: mockPasswordHash(newPassword) } : x,
          ),
        }));
        return { ok: true };
      },

      setTwoFactorDemo: (enabled) => {
        const uid = get().sessionUserId;
        if (!uid) return;
        set((s) => ({
          users: s.users.map((u) => (u.id === uid ? { ...u, twoFactorDemoEnabled: enabled } : u)),
        }));
      },

      adminApproveKyc: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId && u.kycStatus === "pending_review"
              ? { ...u, kycStatus: "approved", verificationStatus: "approved" as const }
              : u,
          ),
        }));
      },

      adminRejectKyc: (userId) => {
        set((s) => ({
          users: s.users.map((u) =>
            u.id === userId && u.kycStatus === "pending_review"
              ? { ...u, kycStatus: "rejected", verificationStatus: "rejected" as const }
              : u,
          ),
        }));
      },

      adminAdjustBalance: (userId, delta, reason) => {
        const cleanReason = reason.trim() || "Admin balance adjustment";
        set((s) => ({
          users: s.users.map((u) => {
            if (u.id !== userId) return u;
            const nextBal = Math.max(0, u.balance + delta);
            const row: GameHistoryEntry = {
              id: randomId(),
              game: "admin",
              type: "admin_adjustment",
              delta,
              reason: cleanReason,
              balanceAfter: nextBal,
              createdAt: new Date().toISOString(),
            };
            return {
              ...u,
              balance: nextBal,
              gameHistory: [row, ...u.gameHistory].slice(0, 120),
            };
          }),
        }));
      },

      adminSetBanned: (userId, banned) => {
        set((s) => ({
          users: s.users.map((u) => (u.id === userId ? { ...u, banned } : u)),
        }));
        const session = get().sessionUserId;
        if (session === userId && banned) set({ sessionUserId: null });
      },

      demoSocialAuth: (provider) => {
        const email = (provider === "google" ? DEMO_GOOGLE_EMAIL : DEMO_APPLE_EMAIL).toLowerCase();
        const now = new Date().toISOString();
        const existing = get().getUserByEmail(email);
        if (existing) {
          if (existing.banned) return { ok: false, error: "This demo account is suspended." };
          set((s) => ({
            sessionUserId: existing.id,
            users: s.users.map((x) =>
              x.id === existing.id
                ? {
                    ...normalizeStoredUser(x),
                    authProvider: provider,
                    loginHistoryMock: [
                      {
                        id: randomId(),
                        at: now,
                        device: `${provider === "google" ? "Google" : "Apple"} demo (local)`,
                        ip: "198.51.100.0 (demo)",
                        success: true,
                      },
                      ...x.loginHistoryMock,
                    ].slice(0, 40),
                  }
                : x,
            ),
          }));
          return { ok: true };
        }

        const username = provider === "google" ? "MadbakGoogle" : "MadbakApple";
        const user: MadbakUser = {
          id: randomId(),
          username,
          email,
          passwordHashMock: mockPasswordHash(`__demo_oauth_no_password__${provider}${randomId()}`),
          dateOfBirth: "1990-01-01",
          country: "United States",
          createdAt: now,
          emailVerified: true,
          verificationStatus: "email_verified",
          authProvider: provider,
          kycStatus: "none",
          kycData: null,
          balance: INITIAL_DEMO_BALANCE,
          role: "user",
          vipLevel: "Crimson",
          banned: false,
          twoFactorDemoEnabled: false,
          gameHistory: [],
          activeSessionsMock: defaultSessions(),
          loginHistoryMock: [
            {
              id: randomId(),
              at: now,
              device: `${provider === "google" ? "Google" : "Apple"} demo (local)`,
              ip: "198.51.100.0 (demo)",
              success: true,
            },
          ],
        };

        set((s) => ({
          users: [...s.users.map(normalizeStoredUser), user],
          sessionUserId: user.id,
        }));
        return { ok: true };
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        users: s.users,
        sessionUserId: s.sessionUserId,
        emailCodes: s.emailCodes,
      }),
    },
  ),
);

export function useCurrentUser(): MadbakUser | null {
  return useAuthStore((s) => {
    if (!s.sessionUserId) return null;
    return s.getUser(s.sessionUserId) ?? null;
  });
}
