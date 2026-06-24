import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronRight } from "lucide-react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "News & Events",
  description: "Latest news and events from CCSGM.",
};

export const revalidate = 60;

type SanityImage = { _type: "image"; asset: { _ref: string } };

type Post = {
  _id: string;
  slug: { current: string };
  category: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  author: string;
  mainImage?: SanityImage;
};

const FALLBACK_POSTS: Post[] = [
  {
    _id: "1",
    slug: { current: "leadership-summit-2025" },
    category: "News & Events",
    title: "Leadership Summit 2025: Equipping for the Harvest",
    excerpt:
      "Our annual Leadership Summit brought together pastors and church leaders from across the CCSGM network for three days of training, worship, and strategic planning.",
    publishedAt: "2025-05-15",
    author: "CCSGM Admin",
  },
  {
    _id: "2",
    slug: { current: "carascal-missions-update" },
    category: "News & Events",
    title: "Missions Update: New Believers in Carascal, Surigao del Sur",
    excerpt:
      "Praise God — our missionary team reports 12 new believers baptised in Barangay Gamuton over the past quarter. The church plant continues to grow.",
    publishedAt: "2025-04-28",
    author: "Missions Team",
  },
  {
    _id: "3",
    slug: { current: "seekers-camp-recap" },
    category: "News & Events",
    title: "Seekers' Camp 2025: 30 Young People Encounter Christ",
    excerpt:
      "Over a weekend in Imus, 30 young seekers attended our annual Seekers' Camp. Many gave their lives to Christ for the first time.",
    publishedAt: "2025-03-08",
    author: "Youth Ministry",
  },
];

async function getPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch<Post[]>(
      `*[_type == "post" && category in ["News", "Events"]] | order(coalesce(eventDateStart, publishedAt) desc) {
        _id, slug, category, tags, title, excerpt, publishedAt, eventDateStart, eventDateEnd, featured, author, mainImage
      }`
    );
    return posts.length > 0 ? posts : FALLBACK_POSTS;
  } catch {
    return FALLBACK_POSTS;
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function NewsPage() {
  const posts = await getPosts();

  return (
    <>
      <HeroSection
        eyebrow="Stay Connected"
        title="News & Events"
        subtitle="Ministry updates, announcements, and events from across the CCSGM network."
        imageName="news"
      />

      {/* Posts */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {posts.map((post) => (
              <article
                key={post._id}
                className="flex flex-col rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.mainImage ? (
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                    <Image
                      src={urlFor(post.mainImage).width(600).height(320).fit("crop").auto("format").url()}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-48 w-full bg-[#f0fdf4] flex items-center justify-center">
                    <span className="text-[#52b788] text-xs uppercase tracking-widest font-semibold">
                      News & Events
                    </span>
                  </div>
                )}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        post.category === "Events"
                          ? "bg-indigo-50 text-indigo-700"
                          : "bg-blue-50 text-blue-700"
                      }`}
                    >
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Calendar size={12} />
                      {post.eventDateStart
                        ? post.eventDateEnd
                          ? `${formatDate(post.eventDateStart)} – ${formatDate(post.eventDateEnd)}`
                          : formatDate(post.eventDateStart)
                        : formatDate(post.publishedAt)}
                    </span>
                  </div>
                  <h2 className="font-bold text-[#1a4731] text-base leading-snug mb-2">
                    {post.title}
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed flex-1">
                    {post.excerpt}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs text-gray-400">{post.author}</span>
                    <Link
                      href={`/blog/${post.slug.current}`}
                      className="inline-flex items-center gap-0.5 text-xs font-semibold text-[#1a4731] hover:text-[#52b788] transition-colors"
                    >
                      Read more <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
