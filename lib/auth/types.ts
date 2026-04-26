export type UserRole = "user" | "admin";

/** Email/password vs demo OAuth (real apps: NextAuth/Auth.js, Clerk, Supabase Auth, Firebase Auth — never roll your own OAuth.) */
export type AuthProvider = "email" | "google" | "apple";

/** Account verification / KYC stage for UI and demo social payloads */
export type AccountVerificationStatus =
  | "email_unverified"
  | "email_verified"
  | "pending_review"
  | "approved"
  | "rejected";

export type KycStatus = "none" | "pending_review" | "approved" | "rejected";

export type IdDocumentType = "passport" | "id_card" | "driving_license";

export type KycFormData = {
  fullLegalName: string;
  dateOfBirth: string;
  nationality: string;
  countryOfResidence: string;
  idType: IdDocumentType;
  idNumber: string;
  address: string;
  /** Demo-only flags — no files are uploaded */
  mockIdFrontSet: boolean;
  mockSelfieSet: boolean;
  submittedAt?: string;
};

export type GameHistoryEntry = {
  id: string;
  game: string;
  type: "game_result" | "sportsbook" | "reward" | "admin_adjustment" | "manual";
  delta: number;
  reason: string;
  balanceAfter: number;
  createdAt: string;
};

export type MockSessionRow = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
};

export type MockLoginHistoryRow = {
  id: string;
  at: string;
  device: string;
  ip: string;
  success: boolean;
};

export type MadbakUser = {
  id: string;
  username: string;
  email: string;
  /** Demo fingerprint only — production must use server-side bcrypt/argon2 */
  passwordHashMock: string;
  dateOfBirth: string;
  country: string;
  createdAt: string;
  emailVerified: boolean;
  /** Mirrors lifecycle for display; keep in sync with emailVerified + kycStatus */
  verificationStatus: AccountVerificationStatus;
  authProvider: AuthProvider;
  kycStatus: KycStatus;
  kycData: KycFormData | null;
  balance: number;
  role: UserRole;
  vipLevel: string;
  banned: boolean;
  twoFactorDemoEnabled: boolean;
  gameHistory: GameHistoryEntry[];
  activeSessionsMock: MockSessionRow[];
  loginHistoryMock: MockLoginHistoryRow[];
};

export type AuthModalTab = "login" | "signup" | "forgot";

export const INITIAL_DEMO_BALANCE = 10_000;

export const DEMO_ADMIN_EMAIL = "admin@madbak-house.demo";
export const DEMO_ADMIN_PASSWORD = "AdminDemo2026!";

/** Fixed demo identities for local OAuth simulation only (no real Google/Apple tokens). */
export const DEMO_GOOGLE_EMAIL = "demo.google@madbak.house";
export const DEMO_APPLE_EMAIL = "demo.apple@madbak.house";

/** Verification tier for badges / gating (demo semantics). */
export function getVerificationLevel(user: MadbakUser | null, isLoggedIn: boolean): 0 | 1 | 2 | 3 {
  if (!isLoggedIn || !user) return 0;
  if (!user.emailVerified) return 0;
  if (user.kycStatus === "approved") return 3;
  if (user.kycStatus === "pending_review") return 2;
  return 1;
}

export function verificationLevelLabel(level: 0 | 1 | 2 | 3): string {
  switch (level) {
    case 0:
      return "Guest / Unverified";
    case 1:
      return "Email verified";
    case 2:
      return "Identity submitted";
    case 3:
      return "Approved";
    default:
      return "Unknown";
  }
}
