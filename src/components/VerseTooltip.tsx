"use client";

import { useState, useRef, useEffect } from "react";

const LIMIT = 300;

export default function VerseTooltip({ reference }: { reference: string }) {
  const [fullText, setFullText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const fetched = useRef(false);

  // Reset when reference changes so a corrected ref re-fetches
  useEffect(() => {
    fetched.current = false;
    setFullText(null);
    setExpanded(false);
  }, [reference]);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isTruncated = fullText !== null && fullText.length > LIMIT;
  const displayText = fullText
    ? expanded
      ? fullText
      : isTruncated
      ? fullText.slice(0, LIMIT - 1) + "…"
      : fullText
    : null;

  async function load() {
    if (fetched.current) return;
    fetched.current = true;
    setLoading(true);
    try {
      const res = await fetch(`/api/verse?ref=${encodeURIComponent(reference)}`);
      const data = await res.json();
      setFullText(data.text ?? null);
    } catch {
      setFullText(null);
    } finally {
      setLoading(false);
    }
  }

  function show() {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setVisible(true);
    load();
  }

  function scheduleHide() {
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setExpanded(false);
    }, 150);
  }

  return (
    <span className="relative inline-block">
      <span
        className="text-[#52b788] cursor-pointer font-medium underline decoration-dotted underline-offset-2"
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
      >
        {reference}
      </span>
      {visible && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3 rounded-xl bg-[#1a4731] text-white text-xs leading-relaxed shadow-xl"
          onMouseEnter={show}
          onMouseLeave={scheduleHide}
        >
          <span className="font-semibold block mb-1 text-[#52b788]">
            {reference} <span className="text-gray-400 font-normal">(ESV)</span>
          </span>
          {loading ? (
            <span className="opacity-60">Loading…</span>
          ) : displayText ? (
            <>
              {displayText}
              {isTruncated && (
                <button
                  onClick={() => setExpanded((x) => !x)}
                  className="mt-2 flex items-center px-2 py-0.5 rounded-full bg-[#52b788]/20 text-[#52b788] hover:bg-[#52b788]/40 transition-colors text-[10px] font-semibold cursor-pointer"
                >
                  {expanded ? "Show less" : "Show full passage"}
                </button>
              )}
            </>
          ) : (
            <span className="opacity-60">Verse unavailable</span>
          )}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#1a4731]" />
        </span>
      )}
    </span>
  );
}
