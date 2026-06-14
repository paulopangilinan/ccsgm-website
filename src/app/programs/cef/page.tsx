import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import PostGrid, { type Post } from "@/components/PostGrid";
import { client } from "@/sanity/client";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Church Extension Fellowship (CEF)",
  description:
    "The Church Extension Fellowship (CEF) reaches out to the community through weekly Bible study and monthly general assemblies.",
};

type RawPost = Post & { mainImage?: { _type: "image"; asset: { _ref: string } } };

async function getCEFPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch<RawPost[]>(
      `*[_type == "post" && category == "Programs" && programSubCategory == "CEF"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, featured, author, mainImage
      }`
    );
    return posts.map((p) => ({ ...p, mainImage: p.mainImage ?? undefined }));
  } catch {
    return [];
  }
}

export default async function CEFPage() {
  const posts = await getCEFPosts();

  return (
    <>
      <HeroSection
        eyebrow="Programs"
        title="Church Extension Fellowship"
        subtitle="Growing together in the grace and knowledge of the Lord and Saviour Jesus Christ."
        imageName="sunday-school"
      />

      {/* Intro */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
            About CEF
          </p>
          <h2 className="text-3xl font-bold text-[#1a4731] mb-6 leading-snug">
            What is the Church Extension Fellowship?
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              The Church Extension Fellowship (CEF) is our way to reach out to the
              community through weekly Bible study and to grow together in the grace
              and in the knowledge of the Lord and Saviour Jesus Christ.
            </p>
            <p>
              The CEF is open to everyone who wants to grow in their relationship
              with the Lord and have fellowship among brethren. We are currently
              doing the CEF gatherings via online or face-to-face depending on the
              request of the members of each sector. We also have our monthly CEF
              General Assembly.
            </p>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-2">
              Programs
            </p>
            <h2 className="text-3xl font-bold text-[#1a4731]">CEF Updates</h2>
          </div>
          <PostGrid
            posts={posts}
            emptyMessage="No articles yet for CEF. Check back soon."
          />
        </div>
      </section>
    </>
  );
}
