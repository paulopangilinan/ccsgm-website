"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

type CarouselImage = {
  url: string;
  caption?: string;
};

export default function ArticleCarousel({ images }: { images: CarouselImage[] }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next]);

  // Restart timer on manual nav
  function go(i: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setCurrent(i);
    timerRef.current = setInterval(next, 5000);
  }

  // Touch swipe
  const touchStartX = useRef<number | null>(null);
  function onTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX; }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) delta > 0 ? go((current + 1) % images.length) : go((current - 1 + images.length) % images.length);
    touchStartX.current = null;
  }

  const img = images[current];

  return (
    <figure
      className="not-prose my-8 select-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="relative rounded-2xl overflow-hidden bg-gray-100">
        <Image
          key={current}
          src={img.url}
          alt={img.caption ?? `Image ${current + 1} of ${images.length}`}
          width={900}
          height={600}
          className="w-full h-auto object-cover"
          priority={current === 0}
        />

        {/* Prev / Next */}
        <button
          onClick={() => go((current - 1 + images.length) % images.length)}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} className="text-white" />
        </button>
        <button
          onClick={() => go((current + 1) % images.length)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center transition-colors"
          aria-label="Next image"
        >
          <ChevronRight size={18} className="text-white" />
        </button>

        {/* Counter */}
        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Dot indicators */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all ${i === current ? "w-4 h-2 bg-[#1a4731]" : "w-2 h-2 bg-gray-300"}`}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>

      {/* Caption for current image */}
      {img.caption && (
        <figcaption className="text-center text-xs text-gray-400 mt-2">
          {img.caption}
        </figcaption>
      )}
    </figure>
  );
}
