import { notFound } from "next/navigation";
import HeroSection from "@/components/HeroSection";
import PostGrid, { type Post } from "@/components/PostGrid";
import PortableBody from "@/components/PortableBody";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import { getTaxonomyItemBySlug, type TaxonomyType } from "@/lib/taxonomy";

type RawPost = Post & { mainImage?: { _type: "image"; asset: { _ref: string } } };

type Props = {
  type: TaxonomyType;
  slug: string;
  postCategory: string;
  postSubField: "subCategory" | "programSubCategory" | "projectSubCategory";
  updatesLabel: string;
};

async function getRelatedPosts(postCategory: string, postSubField: string, itemId: string): Promise<Post[]> {
  try {
    const posts = await client.fetch<RawPost[]>(
      `*[_type == "post" && category == $postCategory && ${postSubField}._ref == $itemId] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, featured, author, mainImage
      }`,
      { postCategory, itemId }
    );
    return posts.map((p) => ({ ...p, mainImage: p.mainImage ?? undefined }));
  } catch {
    return [];
  }
}

export default async function TaxonomyDetailPage({ type, slug, postCategory, postSubField, updatesLabel }: Props) {
  const item = await getTaxonomyItemBySlug(type, slug);
  if (!item) notFound();

  const posts = await getRelatedPosts(postCategory, postSubField, item._id);
  const heroImageUrl = item.heroImage
    ? urlFor(item.heroImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;

  return (
    <>
      <HeroSection
        eyebrow={item.eyebrow}
        title={item.title}
        subtitle={item.excerpt}
        imageUrl={heroImageUrl}
        imageName="locations"
      />

      {item.body && item.body.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <PortableBody body={item.body} />
          </div>
        </section>
      )}

      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-2">
              {updatesLabel}
            </p>
            <h2 className="text-3xl font-bold text-[#1a4731]">
              {item.title} Updates
            </h2>
          </div>
          <PostGrid
            posts={posts}
            emptyMessage={`No articles yet for ${item.title}. Check back soon.`}
          />
        </div>
      </section>
    </>
  );
}
