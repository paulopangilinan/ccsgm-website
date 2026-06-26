import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getSiteSettings, getContactRecipients } from "@/lib/siteSettings";
import { verifyTurnstile } from "@/lib/turnstile";
import { escapeHtml } from "@/lib/escapeHtml";

type Body = {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject?: string;
  message?: string;
  turnstileToken?: string;
};

export async function POST(req: NextRequest) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { firstName, lastName, email, subject, message, turnstileToken } = body;
  if (!firstName || !lastName || !email || !subject || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json({ error: "Bot verification failed" }, { status: 403 });
  }

  const gmailUser = process.env.GMAIL_USER;
  const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;
  if (!gmailUser || !gmailAppPassword) {
    return NextResponse.json({ error: "Email is not configured" }, { status: 500 });
  }

  const settings = await getSiteSettings();
  const to = getContactRecipients(settings);
  if (to.length === 0) {
    return NextResponse.json({ error: "No contact recipient configured" }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: gmailUser, pass: gmailAppPassword },
  });

  try {
    await transporter.sendMail({
      from: `CCSGM Website <${gmailUser}>`,
      to,
      replyTo: email,
      subject: `[Contact Form] ${subject} — ${firstName} ${lastName}`,
      html: `
        <p><strong>Name:</strong> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br>")}</p>
      `,
    });
  } catch {
    return NextResponse.json({ error: "Failed to send message" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
