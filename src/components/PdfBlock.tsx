"use client";

import { useState } from "react";
import { FileText, ExternalLink, X } from "lucide-react";

function driveEmbedUrl(url: string): string {
  // Google Drive share link → embed/preview URL
  if (url.includes("drive.google.com")) {
    return url.replace(/\/view.*$/, "/preview");
  }
  // Direct PDF or other URL — use Google Docs viewer as fallback
  return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
}

export default function PdfBlock({
  title,
  url,
  description,
}: {
  title: string;
  url: string;
  description?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Inline row — same style as ReadingModal SessionRow */}
      <div className="not-prose flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-gray-100 bg-white hover:bg-[#f0fdf4] transition-colors my-4">
        <div className="flex items-start gap-3">
          <FileText size={16} className="text-[#52b788] mt-0.5 shrink-0" />
          <div>
            <button
              onClick={() => setOpen(true)}
              className="text-sm font-semibold text-[#1a4731] hover:text-[#52b788] transition-colors text-left"
            >
              {title}
            </button>
            {description && (
              <p className="text-xs text-gray-400 mt-0.5">{description}</p>
            )}
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 text-[#52b788] hover:text-[#3d9971]"
          aria-label="Preview document"
        >
          <ExternalLink size={15} />
        </button>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ height: "85vh" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-[#1a4731] text-sm leading-snug">{title}</p>
                {description && (
                  <p className="text-xs text-gray-400 mt-0.5">{description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#52b788] hover:underline"
                >
                  Open file <ExternalLink size={12} />
                </a>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            {/* Embed */}
            <iframe
              src={driveEmbedUrl(url)}
              className="flex-1 w-full"
              allow="autoplay"
              title={title}
            />
          </div>
        </div>
      )}
    </>
  );
}
