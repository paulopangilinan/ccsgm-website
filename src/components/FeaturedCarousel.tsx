"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Calendar, Home } from "lucide-react";
import { categoryColour, displayCategory, formatDate } from "./PostGrid";
import { formatEventDate } from "@/lib/formatEventDate";

export type FeaturedPost = {
  _id: string;
  slug: { current: string };
  category: string;
  blogSubCategory?: { _id: string; title: string };
  title: string;
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  mainImageUrl?: string;
};

type HeroSlide = { type: "hero" };
type PostSlide = { type: "post"; post: FeaturedPost };
type Slide = HeroSlide | PostSlide;

function Controls({
  slides,
  current,
  setCurrent,
  prev,
  next,
}: {
  slides: Slide[];
  current: number;
  setCurrent: (i: number) => void;
  prev: () => void;
  next: () => void;
}) {
  return (
    <div className="flex items-center gap-3 mt-8">
      <button
        onClick={prev}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Previous"
      >
        <ChevronLeft size={16} />
      </button>
      <div className="flex items-center gap-2">
        {slides.map((s, i) =>
          s.type === "hero" ? (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex items-center justify-center w-4 h-4 rounded-full transition-all ${
                i === current ? "bg-white text-[#1a4731]" : "bg-white/20 text-white/60 hover:bg-white/30"
              }`}
              aria-label="Home slide"
            >
              <Home size={8} />
            </button>
          ) : (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all ${
                i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/30"
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          )
        )}
      </div>
      <button
        onClick={next}
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Next"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

export default function FeaturedCarousel({ posts }: { posts: FeaturedPost[] }) {
  const slides: Slide[] = [
    { type: "hero" },
    ...posts.map((p): PostSlide => ({ type: "post", post: p })),
  ];

  const [current, setCurrent] = useState(0);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % slides.length),
    [slides.length]
  );

  useEffect(() => {
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next]);

  const slide = slides[current];

  if (slide.type === "hero") {
    return (
      <section className="relative bg-[#1a4731] text-white overflow-hidden" style={{ height: "520px" }}>
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-4">
                Part of Sovereign Grace Churches
              </p>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4">
                Bringing the Gospel <br className="hidden sm:block" />
                to Every Nation
              </h1>
              <p className="text-gray-300 text-lg max-w-xl leading-relaxed mb-8">
                Cross of Christ Salvation Gospel Ministries is a Christian
                Evangelical Church in the Philippines, passionate about the Great
                Commission — church planting, missions, and equipping believers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  href="/locations"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors"
                >
                  Find a Location
                </Link>
                <Link
                  href="/sermons"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
                >
                  Watch Sermons
                </Link>
              </div>
              <Controls slides={slides} current={current} setCurrent={setCurrent} prev={prev} next={next} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const post = slide.post;
  return (
    <section className="bg-[#1a4731] text-white overflow-hidden" style={{ minHeight: "450px" }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-stretch gap-4 md:gap-6 py-1 md:py-0 md:h-[520px]">

        {/* Mobile image */}
        {post.mainImageUrl && (
          <div className="md:hidden flex items-center justify-center">
            <div className="relative w-full overflow-hidden" style={{ height: "220px" }}>
              <Image
                src={post.mainImageUrl}
                alt={post.title}
                fill
                className="object-cover object-center"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        )}

        {/* Text column */}
        <div className="featured-carousel-details flex-1 max-w-none md:max-w-sm lg:max-w-md flex flex-col px-4 pt-0 pb-4 md:px-0 md:py-10">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColour(displayCategory(post))}`}>
              {displayCategory(post)}
            </span>
            {post.category === "Events" && post.eventDateStart ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-indigo-300">
                <Calendar size={11} />
                {formatEventDate(post.eventDateStart, post.eventDateEnd)}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Calendar size={11} />
                {formatDate(post.publishedAt)}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-3xl font-bold leading-tight mb-2 md:mb-3">{post.title}</h2>
          <p className="text-gray-300 text-sm leading-relaxed mb-4 md:mb-5 line-clamp-3">{post.excerpt}</p>
          <Link href={`/blog/${post.slug.current}?from=home`} className="inline-flex items-center gap-1 text-sm font-semibold text-[#52b788] hover:underline mb-4 md:mb-6">
            Read more <ChevronRight size={15} />
          </Link>
          <div>
            <Controls slides={slides} current={current} setCurrent={setCurrent} prev={prev} next={next} />
          </div>
        </div>

        {/* Desktop image */}
        {post.mainImageUrl && (
          <div className="hidden md:flex flex-1 items-center justify-center py-10">
            <div className="relative w-full rounded-xl overflow-hidden" style={{ height: "380px" }}>
              <Image
                src={post.mainImageUrl}
                alt={post.title}
                fill
                className="object-cover object-center"
                sizes="50vw"
                priority
              />
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
