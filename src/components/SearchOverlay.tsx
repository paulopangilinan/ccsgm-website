"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X } from "lucide-react";

type PageResult = { type: string; title: string; excerpt?: string; href: string; imageUrl?: string };
type ArticleResult = { id: string; title: string; excerpt?: string; href: string; category?: string; imageUrl?: string };

function ResultCard({
  href,
  title,
  excerpt,
  imageUrl,
  badge,
  onNavigate,
}: {
  href: string;
  title: string;
  excerpt?: string;
  imageUrl?: string;
  badge?: string;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#52b788]/40 hover:shadow-sm transition-all"
    >
      <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-[#f0fdf4]">
        {imageUrl && <Image src={imageUrl} alt={title} fill className="object-cover" />}
      </div>
      <div className="min-w-0">
        {badge && (
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#52b788] mb-0.5">
            {badge}
          </span>
        )}
        <p className="font-semibold text-[#1a4731] text-sm leading-snug line-clamp-1">{title}</p>
        {excerpt && <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">{excerpt}</p>}
      </div>
    </Link>
  );
}

export default function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [pages, setPages] = useState<PageResult[]>([]);
  const [articles, setArticles] = useState<ArticleResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setPages([]);
      setArticles([]);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setPages([]);
      setArticles([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const data = await res.json();
        setPages(data.pages ?? []);
        setArticles(data.articles ?? []);
      } catch {
        setPages([]);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const trimmed = query.trim();
  const hasResults = pages.length > 0 || articles.length > 0;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-start justify-center px-4 pt-20 sm:pt-28"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search articles, programs, missions…"
            className="flex-1 text-base outline-none placeholder:text-gray-400"
          />
          <button onClick={onClose} aria-label="Close search" className="text-gray-400 hover:text-gray-600 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="p-5">
          {trimmed.length < 2 && (
            <p className="text-sm text-gray-400 text-center py-10">
              Search by article title, category, or a page name like “CEF”.
            </p>
          )}
          {trimmed.length >= 2 && loading && (
            <p className="text-sm text-gray-400 text-center py-10">Searching…</p>
          )}
          {trimmed.length >= 2 && !loading && !hasResults && (
            <p className="text-sm text-gray-400 text-center py-10">No results for &ldquo;{trimmed}&rdquo;.</p>
          )}

          {pages.length > 0 && (
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Pages</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {pages.map((p) => (
                  <ResultCard
                    key={p.href}
                    href={p.href}
                    title={p.title}
                    excerpt={p.excerpt}
                    imageUrl={p.imageUrl}
                    badge={p.type}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          )}

          {articles.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Articles</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {articles.map((a) => (
                  <ResultCard
                    key={a.id}
                    href={a.href}
                    title={a.title}
                    excerpt={a.excerpt}
                    imageUrl={a.imageUrl}
                    badge={a.category}
                    onNavigate={onClose}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
