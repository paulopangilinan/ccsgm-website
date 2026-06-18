import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PostGrid, { type Post } from "@/components/PostGrid";
import { client } from "@/sanity/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Summits & Conferences",
  description: "Summit and conference updates and articles from CCSGM.",
};

async function getConferencePosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && category == "Programs" && programSubCategory == "Conferences"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, featured, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

export default async function ConferencesPage() {
  const posts = await getConferencePosts();

  return (
    <>
      <HeroSection
        eyebrow="Programs"
        title="Summits & Conferences"
        subtitle="Summit and conference updates, highlights, and resources from CCSGM."
        imageName="locations"
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PostGrid
            posts={posts}
            emptyMessage="No conference articles yet. Check back soon."
          />
        </div>
      </section>
    </>
  );
}
