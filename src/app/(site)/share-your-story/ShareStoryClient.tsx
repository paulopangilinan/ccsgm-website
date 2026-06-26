"use client";

import { useState } from "react";
import Script from "next/script";
import HeroSection from "@/components/HeroSection";
import RichTextEditor from "@/components/RichTextEditor";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

const STORY_TYPES = [
  "Testimony",
  "Devotion",
  "Praise Report",
  "Prayer Request",
  "Salvation Story",
  "Missions Update",
  "Other",
];

export default function ShareStoryClient() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "bot-check-failed" | "story-empty">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storyDoc, setStoryDoc] = useState<object | null>(null);
  const [storyText, setStoryText] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!storyText.trim()) {
      setStatus("story-empty");
      return;
    }

    const form = e.currentTarget;
    const formData = new FormData(form);
    const turnstileToken = formData.get("cf-turnstile-response");
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setStatus("bot-check-failed");
      return;
    }
    formData.set("turnstileToken", turnstileToken ?? "");
    formData.set("storyDoc", JSON.stringify(storyDoc));
    formData.set("storyText", storyText);

    setStatus("sending");
    setErrorMessage(null);
    try {
      const res = await fetch("/api/share-story", {
        method: "POST",
        body: formData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMessage(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
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
        title="Share Your Story"
        subtitle="A testimony, a devotion, a praise report, a prayer request — whatever's on your heart, we'd love for you to share it with the CCSGM community."
        imageName="testimonies"
      />

      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {status === "sent" ? (
            <div className="p-8 rounded-2xl bg-green-50 border border-green-100 text-center">
              <p className="text-green-700 font-semibold text-lg mb-1">Thank you for sharing!</p>
              <p className="text-green-600 text-sm">
                Your story has been submitted. Our team will review it before it's published.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Your Name <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                    placeholder="Juan dela Cruz"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Email <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                    placeholder="juan@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  What kind of story is this?
                </label>
                <select
                  name="storyType"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm text-gray-700"
                >
                  <option value="">Select a category…</option>
                  {STORY_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                  placeholder="Give your story a title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Story</label>
                <RichTextEditor
                  placeholder="Share what God has done…"
                  onChange={(json, text) => {
                    setStoryDoc(json);
                    setStoryText(text);
                  }}
                />
                {status === "story-empty" && (
                  <p className="text-sm text-red-600 mt-1.5">Please write your story before submitting.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Photo <span className="text-gray-400">(optional)</span>
                </label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  className="w-full text-sm text-gray-600 file:mr-4 file:px-4 file:py-2 file:rounded-full file:border-0 file:bg-[#f0fdf4] file:text-[#1a4731] file:font-semibold file:text-sm hover:file:bg-[#e3f8ec]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Video Link <span className="text-gray-400">(optional — YouTube, Google Drive, Vimeo, etc.)</span>
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#52b788] focus:ring-1 focus:ring-[#52b788] text-sm"
                  placeholder="https://youtube.com/watch?v=..."
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
                <p className="text-sm text-red-600">{errorMessage}</p>
              )}
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors disabled:opacity-60"
              >
                {status === "sending" ? "Submitting…" : "Share My Story"}
              </button>
              <p className="text-xs text-gray-400 text-center">
                Submitted stories are reviewed by our team before being published.
              </p>
            </form>
          )}
        </div>
      </section>
    </>
  );
}
