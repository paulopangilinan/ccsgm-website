"use client";

import { useState } from "react";
import Script from "next/script";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import HeroSection from "@/components/HeroSection";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function ContactClient() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "bot-check-failed">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const turnstileToken = form.get("cf-turnstile-response");
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("bot-check-failed");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.get("firstName"),
          lastName: form.get("lastName"),
          email: form.get("email"),
          subject: form.get("subject"),
          message: form.get("message"),
          turnstileToken,
        }),
      });
      if (!res.ok) throw new Error("Failed to send");
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      {TURNSTILE_SITE_KEY && (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      )}
      <HeroSection
        eyebrow="We'd Love to Hear From You"
        title="Contact Us"
        subtitle="Have a question, want to visit, or need to connect with a pastor? Reach out and we'll get back to you shortly."
        imageName="contact"
      />

      {/* Contact content */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14">
            {/* Form */}
            <div>
              <h2 className="text-xl font-bold text-[#1a4731] mb-6">
                Send a Message
              </h2>
              {status === "sent" ? (
                <div className="p-8 rounded-2xl bg-green-50 border border-green-100 text-center">
                  <p className="text-green-700 font-semibold text-lg mb-1">
                    Message Sent!
                  </p>
                  <p className="text-green-600 text-sm">
                    Thank you for getting in touch. We&apos;ll respond within
                    1–2 business days.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        First Name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                        placeholder="Juan"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        required
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                        placeholder="dela Cruz"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                      placeholder="juan@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Subject
                    </label>
                    <select
                      name="subject"
                      required
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm text-gray-700"
                    >
                      <option value="">Select a subject…</option>
                      <option>Planning a Visit</option>
                      <option>Prayer Request</option>
                      <option>Giving Enquiry</option>
                      <option>Ministries & Programmes</option>
                      <option>Ergartes Bible Institute</option>
                      <option>Missions Partnership</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Message
                    </label>
                    <textarea
                      name="message"
                      required
                      rows={5}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm resize-none"
                      placeholder="How can we help?"
                    />
                  </div>
                  {TURNSTILE_SITE_KEY && (
                    <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} />
                  )}
                  {status === "bot-check-failed" && (
                    <p className="text-sm text-red-600">
                      Please wait for the verification check above to complete, then try again.
                    </p>
                  )}
                  {status === "error" && (
                    <p className="text-sm text-red-600">
                      Something went wrong sending your message. Please try again, or email us directly.
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="w-full py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors disabled:opacity-60"
                  >
                    {status === "sending" ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Info */}
            <div>
              <h2 className="text-xl font-bold text-[#1a4731] mb-6">
                Get in Touch
              </h2>
              <div className="space-y-5 mb-10">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-[#52b788]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a4731]">Main Office</p>
                    <p className="text-sm text-gray-500">
                      213 Don Pedro Subdivision, Kaingen, Kawit, Cavite
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-[#52b788]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a4731]">Phone</p>
                    <p className="text-sm text-gray-500">(046) 472-9443</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-[#52b788]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a4731]">Email</p>
                    <a
                      href="mailto:ccsgm.kawit@gmail.com"
                      className="text-sm text-[#52b788] hover:underline"
                    >
                      ccsgm.kawit@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                    <Clock size={16} className="text-[#52b788]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1a4731]">Office Hours</p>
                    <p className="text-sm text-gray-500">
                      Monday – Friday, 9:00 am – 5:00 pm
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#f0fdf4] rounded-2xl">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                  All Locations
                </p>
                <ul className="space-y-3 text-sm text-gray-600">
                  {[
                    "Kawit, Cavite — Sun 7:30 am & 10:00 am",
                    "Cavite City — Sun 9:00 am",
                    "Imus, Cavite — Sun 10:00 am",
                    "Dasmariñas — Sun 9:00 am",
                    "Carascal, Surigao del Sur — Sun 8:00 am",
                  ].map((loc) => (
                    <li key={loc} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#52b788] shrink-0" />
                      {loc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
