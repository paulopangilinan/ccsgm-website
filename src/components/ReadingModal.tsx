"use client";

import { useState } from "react";
import { FileText, ExternalLink, X } from "lucide-react";

type Session = {
  title: string;
  speaker: string;
  url?: string;
};

function driveEmbedUrl(shareUrl: string): string {
  // Convert share URL to preview embed URL
  // https://drive.google.com/file/d/{id}/view?... → https://drive.google.com/file/d/{id}/preview
  return shareUrl.replace(/\/view.*$/, "/preview");
}

function Modal({
  session,
  onClose,
}: {
  session: Session;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ height: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-bold text-[#1a4731] text-sm leading-snug">
              {session.title}
            </p>
            {session.speaker && (
              <p className="text-xs text-gray-400 mt-0.5">{session.speaker}</p>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0 ml-4">
            <a
              href={session.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#52b788] hover:underline"
            >
              Open in Drive <ExternalLink size={12} />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
        {/* Embed */}
        <iframe
          src={driveEmbedUrl(session.url!)}
          className="flex-1 w-full"
          allow="autoplay"
          title={session.title}
        />
      </div>
    </div>
  );
}

export default function SessionRow({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-[#f0fdf4] transition-colors">
        <div className="flex items-start gap-3">
          <FileText size={16} className="text-[#52b788] mt-0.5 shrink-0" />
          <div>
            {session.url ? (
              <button
                onClick={() => setOpen(true)}
                className="text-sm font-semibold text-[#1a4731] hover:text-[#52b788] transition-colors text-left"
              >
                {session.title}
              </button>
            ) : (
              <p className="text-sm font-semibold text-gray-700">
                {session.title}
              </p>
            )}
            {session.speaker && (
              <p className="text-xs text-gray-400 mt-0.5">{session.speaker}</p>
            )}
          </div>
        </div>
        {session.url && (
          <button
            onClick={() => setOpen(true)}
            className="shrink-0 text-[#52b788] hover:text-[#3d9971]"
            aria-label="Preview"
          >
            <ExternalLink size={15} />
          </button>
        )}
      </div>

      {open && <Modal session={session} onClose={() => setOpen(false)} />}
    </>
  );
}
