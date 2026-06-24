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

type BlogCategory = { _id: string; title: string };

// Includes posts of any category tagged with a blog category's title (e.g.
// a Missions post tagged "Youth") alongside actual category == "Blogs" posts
// — same "tag relates it everywhere" behaviour as the taxonomy pages.
async function getPosts(categoryTitles: string[]): Promise<Post[]> {
  try {
    return await client.fetch<Post[]>(
      `*[_type == "post" && (category == "Blogs" || count(tags[@ in $categoryTitles]) > 0)] | order(publishedAt desc) {
        _id, slug, category, blogSubCategory->{_id, title}, tags, title, excerpt, publishedAt, author, mainImage
      }`,
      { categoryTitles }
    );
  } catch {
    return [];
  }
}

async function getBlogCategories(): Promise<BlogCategory[]> {
  try {
    return await client.fetch<BlogCategory[]>(
      `*[_type == "blogCategory"] | order(coalesce(order, 999) asc, title asc) { _id, title }`
    );
  } catch {
    return [];
  }
}

export default async function BlogsPage() {
  const categories = await getBlogCategories();
  const posts = await getPosts(categories.map((c) => c.title));

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
          <BlogsExplorer posts={posts} categories={categories} />
        </div>
      </section>
    </>
  );
}
