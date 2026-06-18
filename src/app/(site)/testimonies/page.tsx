import type { Metadata } from "next";
import { client } from "@/sanity/client";
import PostGrid, { type Post } from "@/components/PostGrid";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Testimonies",
  description: "Stories of God's faithfulness from the CCSGM community.",
};

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && category == "Testimonies"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

export default async function TestimoniesPage() {
  const posts = await getPosts();

  return (
    <>
      <HeroSection
        eyebrow="Preaching"
        title="Testimonies"
        subtitle="Stories of God's faithfulness from members and friends of the CCSGM community."
        imageName="testimonies"
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PostGrid posts={posts} emptyMessage="No testimonies yet. Check back soon." />
        </div>
      </section>
    </>
  );
}
