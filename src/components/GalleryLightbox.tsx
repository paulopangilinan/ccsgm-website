"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function GalleryLightbox({ images }: { images: string[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => setActive((i) => (i === null ? null : (i - 1 + images.length) % images.length)), [images.length]);
  const next = useCallback(() => setActive((i) => (i === null ? null : (i + 1) % images.length)), [images.length]);

  useEffect(() => {
    if (active === null) return;

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }

    function onWheel(e: WheelEvent) {
      e.preventDefault();
      if (e.deltaY > 0 || e.deltaX > 0) next();
      else prev();
    }

    window.addEventListener("keydown", onKey);
    window.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("wheel", onWheel);
    };
  }, [active, close, prev, next]);

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? next() : prev();
    touchStartX.current = null;
  }

  return (
    <>
      {/* Grid */}
      <div className="not-prose columns-2 sm:columns-3 lg:columns-4 gap-3 space-y-3">
        {images.map((src, i) => (
          <div
            key={src}
            className="relative break-inside-avoid overflow-hidden rounded-xl cursor-zoom-in"
            onClick={() => setActive(i)}
          >
            <Image
              src={src}
              alt={`Surigao Missions photo ${i + 1}`}
              width={600}
              height={400}
              className="w-full h-auto object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {active !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={close}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Prev */}
          <button
            className="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>

          {/* Image */}
          <div
            className="relative max-w-5xl max-h-[90vh] w-full mx-16"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[active]}
              alt={`Surigao Missions photo ${active + 1}`}
              width={1200}
              height={800}
              className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
              priority
            />
            <p className="text-center text-white/50 text-sm mt-3">
              {active + 1} / {images.length}
            </p>
          </div>

          {/* Next */}
          <button
            className="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
          >
            <ChevronRight size={20} className="text-white" />
          </button>

          {/* Close */}
          <button
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            onClick={close}
            aria-label="Close"
          >
            <X size={20} className="text-white" />
          </button>
        </div>
      )}
    </>
  );
}
