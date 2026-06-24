"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import type { TimelineEntry } from "@/lib/aboutPage";

const POINT_GAP = 140; // px between dots — used for arrow-button paging

/**
 * Horizontal timeline: a single line of dots, one per event, with the year
 * above each dot. Clicking a dot selects it — the selected dot recolours
 * and the full event (plus photo/caption, if set) appears in the one detail
 * panel below. Arrow buttons nudge the line; the scrollbar is hidden, the
 * line itself is the only scroll affordance besides the arrows and wheel.
 */
export default function HistoryTimeline({ items }: { items: TimelineEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeKey, setActiveKey] = useState<string | undefined>(items[0]?._key);
  const activeIndex = Math.max(0, items.findIndex((i) => i._key === activeKey));
  const active = items[activeIndex] ?? items[0];
  // Centre of each dot sits at index * POINT_GAP + POINT_GAP / 2 within the
  // row (each item occupies a POINT_GAP-wide column) — the filled portion of
  // the line runs from the start up to the selected dot's centre.
  const filledWidth = activeIndex * POINT_GAP + POINT_GAP / 2;

  function scrollByAmount(amount: number) {
    scrollRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  }

  // Hovering the line and scrolling (wheel/trackpad) scrolls it horizontally
  // instead of the page. Native listener so preventDefault isn't ignored —
  // React's onWheel is attached passive by default.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (el!.scrollWidth <= el!.clientWidth) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  if (!active) return null;

  return (
    <div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => scrollByAmount(-POINT_GAP * 3)}
          aria-label="Scroll history left"
          className="shrink-0 w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>

        <div ref={scrollRef} className="no-scrollbar overflow-x-auto flex-1">
          <div className="relative flex items-center min-w-max px-6 py-3">
            <div className="absolute left-6 right-6 h-px bg-white/25" />
            <div
              className="absolute left-6 h-px bg-[#52b788] transition-all"
              style={{ width: filledWidth }}
            />
            {items.map((item) => {
              const isActive = item._key === active._key;
              return (
                <button
                  key={item._key}
                  type="button"
                  onClick={() => setActiveKey(item._key)}
                  className="relative flex flex-col items-center shrink-0"
                  style={{ width: POINT_GAP }}
                >
                  <span
                    className={`text-xs font-semibold mb-3 transition-colors ${
                      isActive ? "text-[#52b788]" : "text-white/60"
                    }`}
                  >
                    {item.year}
                  </span>
                  <span
                    className={`block rounded-full transition-colors ${
                      isActive ? "w-3 h-3 bg-[#52b788]" : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scrollByAmount(POINT_GAP * 3)}
          aria-label="Scroll history right"
          className="shrink-0 w-9 h-9 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Detail panel for the selected event */}
      <div className="mt-10 max-w-2xl">
        <p className="text-[#52b788] text-sm font-bold tracking-wide mb-2">{active.year}</p>
        <p className="text-white/90 leading-relaxed">{active.event}</p>
        {(active.photo || active.caption) && (
          <div className="mt-5 flex flex-col sm:flex-row gap-4 items-start">
            {active.photo && (
              <div className="relative w-full aspect-video sm:w-48 sm:aspect-auto sm:h-32 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={urlFor(active.photo).width(480).height(320).fit("crop").auto("format").url()}
                  alt={active.year}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            {active.caption && (
              <p className="text-white/60 text-sm italic leading-relaxed">{active.caption}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
