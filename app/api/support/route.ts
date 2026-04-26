import { NextResponse } from "next/server";
import { Resend } from "resend";

type Body = {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  category?: "Account" | "Game Issue" | "Verification" | "General";
};

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function fail(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function POST(req: Request) {
  let data: Body;
  try {
    data = (await req.json()) as Body;
  } catch {
    return fail("Invalid request body.");
  }

  const name = (data.name ?? "").trim();
  const email = (data.email ?? "").trim();
  const subject = (data.subject ?? "").trim();
  const message = (data.message ?? "").trim();
  const category = data.category ?? "General";

  if (!name) return fail("Name is required.");
  if (!isEmail(email)) return fail("Valid email is required.");
  if (!subject) return fail("Subject is required.");
  if (message.length < 10) return fail("Message must be at least 10 characters.");

  const to = process.env.SUPPORT_TO_EMAIL || "madbak98@gmail.com";
  const from = process.env.SUPPORT_FROM_EMAIL;
  const apiKey = process.env.RESEND_API_KEY;

  const formattedSubject = `[MADBAK HOUSE Support] ${category} — ${subject}`;
  const text = `New support request:

Name: ${name}
Email: ${email}
Category: ${category}
Subject: ${subject}
Message:
${message}

Sent from MADBAK HOUSE support form.
`;

  if (!apiKey || !from) {
    console.log("[SUPPORT_DEMO_LOCAL_LOG]", {
      to,
      from: from ?? "missing SUPPORT_FROM_EMAIL",
      subject: formattedSubject,
      text,
    });
    const err = process.env.NODE_ENV === "development" ? "RESEND_API_KEY or SUPPORT_FROM_EMAIL is missing." : "Support service unavailable.";
    return NextResponse.json({ ok: false, error: err }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    await resend.emails.send({
      from,
      to,
      replyTo: email,
      subject: formattedSubject,
      text,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Email delivery failed." }, { status: 502 });
  }
}
