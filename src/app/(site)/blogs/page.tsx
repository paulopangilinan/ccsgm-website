import type { Metadata } from "next";
import { client } from "@/sanity/client";
import { type Post } from "@/components/PostGrid";
import BlogsExplorer from "@/components/BlogsExplorer";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Articles on youth, music, couples, and life from the CCSGM community.",
};

export const revalidate = 60;

async function getPosts(): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && category == "Blogs"] | order(publishedAt desc) {
        _id, slug, category, blogSubCategory, title, excerpt, publishedAt, author, mainImage
      }`
    );
  } catch {
    return [];
  }
}

export default async function BlogsPage() {
  const posts = await getPosts();

  return (
    <>
      <HeroSection
        eyebrow="Preaching"
        title="Blogs"
        subtitle="Articles on youth, music, couples, and life from the CCSGM community."
        imageName="blogs"
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogsExplorer posts={posts} />
        </div>
      </section>
    </>
  );
}
