/**
 * Demo-only password handling. In production: hash with bcrypt or argon2 on the server,
 * never persist plaintext, and never trust client-side hashing for security.
 */
export function mockPasswordHash(password: string): string {
  let h = 2166136261;
  const salted = `madbak-demo-v1|${password}`;
  for (let i = 0; i < salted.length; i++) {
    h ^= salted.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `mock:${(h >>> 0).toString(16)}`;
}

export function verifyMockPassword(password: string, storedHash: string): boolean {
  return mockPasswordHash(password) === storedHash;
}

export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export function evaluatePasswordStrength(password: string): { score: number; label: PasswordStrength } {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  let label: PasswordStrength = "weak";
  if (score >= 5) label = "strong";
  else if (score >= 4) label = "good";
  else if (score >= 3) label = "fair";

  return { score: Math.min(score, 6), label };
}

export function passwordMeetsPolicy(password: string): boolean {
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
}
