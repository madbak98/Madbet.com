"use client";

import { useState } from "react";

type Category = "Account" | "Game Issue" | "Verification" | "General";

const CATEGORIES: Category[] = ["Account", "Game Issue", "Verification", "General"];

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: Category;
};

const initialState: FormState = {
  name: "",
  email: "",
  subject: "",
  message: "",
  category: "General",
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function SupportForm({ onSuccess }: { onSuccess?: (msg: string) => void }) {
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!form.name.trim()) return "Name is required.";
    if (!isEmail(form.email.trim())) return "Valid email is required.";
    if (!form.subject.trim()) return "Subject is required.";
    if (form.message.trim().length < 10) return "Message must be at least 10 characters.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) {
      setError(v);
      setSuccess(null);
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim(),
          message: form.message.trim(),
          category: form.category,
        }),
      });

      const body: { ok?: boolean; error?: string } = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) {
        throw new Error(body.error || "Could not send message. Please try again.");
      }

      const successMsg = "Message sent successfully";
      setSuccess(successMsg);
      setForm(initialState);
      onSuccess?.(successMsg);
    } catch (err) {
      const fallback = "Could not send message. Please try again.";
      const detail = err instanceof Error ? err.message : fallback;
      setError(detail || fallback);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Name</span>
          <input
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            className="w-full rounded-xl border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            placeholder="Your name"
            required
          />
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Email</span>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            className="w-full rounded-xl border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            placeholder="you@example.com"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Category</span>
          <select
            value={form.category}
            onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Category }))}
            className="w-full rounded-xl border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Subject</span>
          <input
            value={form.subject}
            onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
            className="w-full rounded-xl border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
            placeholder="Short subject"
            required
          />
        </label>
      </div>

      <label className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#BFAF91]">Message</span>
        <textarea
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          rows={6}
          className="w-full resize-y rounded-xl border border-[#2A1D19] bg-[#0D0D0D] px-3 py-2 text-sm text-[#F2E3C6] focus:border-[#B11226] focus:outline-none"
          placeholder="Describe your issue in detail…"
          required
          minLength={10}
        />
      </label>

      {error ? <p className="rounded-lg border border-[#5A1018] bg-[#3A0B10]/35 px-3 py-2 text-sm text-[#F2E3C6]">{error}</p> : null}
      {success ? <p className="rounded-lg border border-[#2D5A2D] bg-[#1A2D1A]/30 px-3 py-2 text-sm text-[#F2E3C6]">{success}</p> : null}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-xl bg-[#B11226] px-6 py-3 text-sm font-black uppercase tracking-wider text-[#F2E3C6] transition hover:bg-[#E21B35] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
