import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PostGrid, { type Post } from "@/components/PostGrid";
import { client } from "@/sanity/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "One Worship",
  description: "One Worship updates and articles from CCSGM.",
};

async function getOneWorshipPosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && category == "Programs" && programSubCategory == "One Worship"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, featured, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

export default async function OneWorshipPage() {
  const posts = await getOneWorshipPosts();

  return (
    <>
      <HeroSection
        eyebrow="Programs"
        title="One Worship"
        subtitle="One Worship updates, highlights, and resources from CCSGM."
        imageName="locations"
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PostGrid
            posts={posts}
            emptyMessage="No One Worship articles yet. Check back soon."
          />
        </div>
      </section>
    </>
  );
}
