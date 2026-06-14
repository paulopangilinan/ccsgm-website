"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ExternalLink, Play } from "lucide-react";
import type { YouTubeVideo } from "@/lib/youtube";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PlaylistBlock({
  videos,
  playlistId,
}: {
  videos: YouTubeVideo[];
  playlistId: string;
}) {
  const [active, setActive] = useState<YouTubeVideo | null>(null);
  const close = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, close]);

  if (videos.length === 0) return null;

  return (
    <>
      <div className="not-prose my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-[#1a4731]">Videos</h3>
          <a
            href={`https://www.youtube.com/playlist?list=${playlistId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#52b788] hover:underline"
          >
            Full playlist <ExternalLink size={11} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <button
              key={v.id}
              onClick={() => setActive(v)}
              className="group text-left rounded-2xl overflow-hidden border border-gray-100 bg-white hover:shadow-lg hover:border-[#52b788]/30 transition-all duration-200"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-100 overflow-hidden">
                {v.thumbnail ? (
                  <Image
                    src={v.thumbnail}
                    alt={v.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="absolute inset-0 bg-[#1a4731]/10" />
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
                    <Play size={22} className="text-[#1a4731] ml-1" fill="currentColor" />
                  </div>
                </div>
              </div>

              {/* Meta */}
              <div className="px-4 py-3">
                <p className="font-semibold text-[#1a4731] text-sm leading-snug line-clamp-2 group-hover:text-[#52b788] transition-colors">
                  {v.title}
                </p>
                <p className="text-gray-400 text-xs mt-1.5">{formatDate(v.publishedAt)}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={close}
        >
          <div
            className="relative w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${active.id}?autoplay=1&rel=0`}
                title={active.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Close button — inside top-right corner of the video */}
            <button
              onClick={close}
              className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors"
              aria-label="Close"
            >
              <X size={18} className="text-white" />
            </button>

            <p className="text-white/80 text-sm font-medium mt-3 text-center line-clamp-1">
              {active.title}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
