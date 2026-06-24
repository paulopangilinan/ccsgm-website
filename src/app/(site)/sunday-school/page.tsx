import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { getPlaylistVideos } from "@/lib/youtube";
import { client } from "@/sanity/client";
import { getPageContent } from "@/lib/pageContent";
import PostGrid, { type Post } from "@/components/PostGrid";
import PortableBody from "@/components/PortableBody";
import HeroSection from "@/components/HeroSection";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "Sunday School",
  description: "Sunday School teachings, videos, and resources from CCSGM.",
};

export const revalidate = 3600;

const PLAYLIST_ID = "PLpsHyVP6I2myFVUAaaw1LMv1lPQ901vET";

async function getSanityPosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && category == "Sunday School"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SundaySchoolPage() {
  const [videos, posts, pageContent] = await Promise.all([
    getPlaylistVideos(PLAYLIST_ID, 6),
    getSanityPosts(),
    getPageContent("pageContent-sunday-school"),
  ]);
  const heroImageUrl = pageContent?.heroImage
    ? urlFor(pageContent.heroImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;

  return (
    <>
      <HeroSection
        eyebrow={pageContent?.heroEyebrow || "Preaching"}
        title={pageContent?.heroTitle || "Sunday School"}
        subtitle={
          pageContent?.heroSubtitle ||
          "Weekly teachings to ground us in Scripture and grow us in faith."
        }
        imageUrl={heroImageUrl}
        imageName="sunday-school"
      />

      {/* Editable intro section — managed in Studio under Page Content */}
      {pageContent?.body && pageContent.body.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <PortableBody body={pageContent.body} />
          </div>
        </section>
      )}

      {/* Videos */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-8">
            <h2 className="text-2xl font-bold text-[#1a4731]">Latest Videos</h2>
            <a
              href={`https://www.youtube.com/playlist?list=${PLAYLIST_ID}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#52b788] hover:underline"
            >
              Full playlist <ExternalLink size={13} />
            </a>
          </div>

          {videos.length === 0 ? (
            <p className="text-gray-400 text-center py-10">
              Videos unavailable at the moment.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((v) => (
                <div
                  key={v.id + v.publishedAt}
                  className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${v.id}`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-[#1a4731] text-sm mb-1 line-clamp-2">
                      {v.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {formatDate(v.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sanity articles */}
      {posts.length > 0 && (
        <section className="py-20 bg-[#f0fdf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-8">
              Articles & Resources
            </h2>
            <PostGrid posts={posts} />
          </div>
        </section>
      )}
    </>
  );
}
