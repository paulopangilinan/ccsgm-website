import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight, Star } from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { formatEventDate } from "@/lib/formatEventDate";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type Post = {
  _id: string;
  slug: { current: string };
  category: string;
  blogSubCategory?: { _id: string; title: string } | string;
  tags?: string[];
  title: string;
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  featured?: boolean;
  author: string;
  mainImage?: SanityImage;
};

function blogSubCategoryTitle(blogSubCategory: Post["blogSubCategory"]): string | undefined {
  if (!blogSubCategory) return undefined;
  return typeof blogSubCategory === "string" ? blogSubCategory : blogSubCategory.title;
}

export const CATEGORY_COLOURS: Record<string, string> = {
  News: "bg-blue-50 text-blue-700",
  Events: "bg-indigo-50 text-indigo-700",
  Testimonies: "bg-yellow-50 text-yellow-700",
  Readings: "bg-purple-50 text-purple-700",
  Youth: "bg-pink-50 text-pink-700",
  Projects: "bg-amber-50 text-amber-700",
  Couples: "bg-rose-50 text-rose-700",
  Music: "bg-teal-50 text-teal-700",
  "Sunday School": "bg-green-50 text-green-700",
  Missions: "bg-emerald-50 text-emerald-700",
  Programs: "bg-violet-600 text-white",
  Blogs: "bg-pink-50 text-pink-700",
  "Pastor's Devotion": "bg-orange-50 text-orange-700",
};

// Used for any label without a fixed entry above — admin-created mission,
// program, project, and blog category titles, plus tag pills — so they get
// a distinct colour instead of all collapsing into one grey fallback.
const COLOUR_PALETTE = [
  "bg-blue-50 text-blue-700",
  "bg-emerald-50 text-emerald-700",
  "bg-amber-50 text-amber-700",
  "bg-rose-50 text-rose-700",
  "bg-violet-50 text-violet-700",
  "bg-cyan-50 text-cyan-700",
  "bg-orange-50 text-orange-700",
  "bg-fuchsia-50 text-fuchsia-700",
  "bg-lime-50 text-lime-700",
  "bg-indigo-50 text-indigo-700",
  "bg-teal-50 text-teal-700",
  "bg-pink-50 text-pink-700",
  "bg-sky-50 text-sky-700",
  "bg-yellow-50 text-yellow-700",
  "bg-purple-50 text-purple-700",
];

function hashColour(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return COLOUR_PALETTE[hash % COLOUR_PALETTE.length];
}

/** A label's fixed brand colour if it has one, else a deterministic colour from the palette. */
export function categoryColour(label: string): string {
  return CATEGORY_COLOURS[label] ?? hashColour(label);
}

/** Tag pills never have fixed brand colours — always palette-derived. */
export function tagColour(label: string): string {
  return hashColour(label);
}

export function displayCategory(post: { category: string; blogSubCategory?: Post["blogSubCategory"] }) {
  const topic = blogSubCategoryTitle(post.blogSubCategory);
  return post.category === "Blogs" && topic ? topic : post.category;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function EventDateBadge({ start, end }: { start: string; end?: string }) {
  const isPast = end ? new Date(end) < new Date() : new Date(start) < new Date();
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${isPast ? "bg-gray-100 text-gray-400" : "bg-indigo-600 text-white"}`}>
      <Calendar size={11} />
      <span>{formatEventDate(start, end)}</span>
      {isPast && <span className="ml-1 text-[10px] font-normal">(Past)</span>}
    </div>
  );
}

export default function PostGrid({
  posts,
  emptyMessage = "No posts yet. Check back soon.",
}: {
  posts: Post[];
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return <p className="text-gray-400 text-center py-20">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
      {posts.map((post) => {
        const href = `/blog/${post.slug.current}`;
        return (
          <article
            key={post._id}
            className="flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Image — clickable */}
            <Link href={href} className="block relative h-48 w-full overflow-hidden bg-gray-100 group">
              {post.mainImage ? (
                <Image
                  src={urlFor(post.mainImage).width(600).height(320).fit("crop").auto("format").url()}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="absolute inset-0 bg-[#f0fdf4] flex items-center justify-center">
                  <span className="text-[#52b788] text-xs uppercase tracking-widest font-semibold">
                    {displayCategory(post)}
                  </span>
                </div>
              )}
              {post.featured && (
                <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-amber-400 flex items-center justify-center shadow">
                  <Star size={13} className="text-white fill-white" />
                </div>
              )}
            </Link>

            <div className="p-6 flex flex-col flex-1">
              {/* Event date banner */}
              {post.category === "Events" && post.eventDateStart && (
                <div className="mb-3">
                  <EventDateBadge start={post.eventDateStart} end={post.eventDateEnd} />
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColour(displayCategory(post))}`}>
                  {displayCategory(post)}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {formatDate(post.publishedAt)}
                </span>
              </div>

              {/* Title — clickable */}
              <Link href={href} className="group mb-2">
                <h2 className="font-bold text-[#1a4731] text-base leading-snug group-hover:text-[#52b788] transition-colors">
                  {post.title}
                </h2>
              </Link>

              <p className="text-gray-500 text-sm leading-relaxed flex-1">
                {post.excerpt}
              </p>
              {post.tags && post.tags.filter((t) => t !== displayCategory(post)).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4">
                  {post.tags
                    .filter((t) => t !== displayCategory(post))
                    .map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${tagColour(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                </div>
              )}
              <div className="mt-5 flex items-center justify-between">
                <span className="text-xs text-gray-400">{post.author}</span>
                <Link
                  href={href}
                  className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1a4731] hover:text-[#52b788] transition-colors"
                >
                  Read more <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
