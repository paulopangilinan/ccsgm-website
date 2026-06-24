import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, User } from "lucide-react";
import { formatEventDate } from "@/lib/formatEventDate";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import { categoryColour, displayCategory, tagColour } from "@/components/PostGrid";
import PostGrid, { type Post as PostGridPost } from "@/components/PostGrid";
import PortableBody from "@/components/PortableBody";

export const revalidate = 60;

type SanityImage = { _type: "image"; asset: { _ref: string } };

type TaxonomyRef = { _id: string; title: string; slug: { current: string } };

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  subCategory?: TaxonomyRef;
  programSubCategory?: TaxonomyRef;
  projectSubCategory?: TaxonomyRef;
  blogSubCategory?: { _id: string; title: string };
  tags?: string[];
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  author: string;
  mainImage?: SanityImage;
  body: unknown[];
};

const RELATED_POST_FIELDS = `_id, slug, category, blogSubCategory->{_id, title}, tags, title, excerpt, publishedAt, eventDateStart, eventDateEnd, featured, author, mainImage`;
const RELATED_POST_LIMIT = 3;

async function getPost(slug: string): Promise<Post | null> {
  try {
    return await client.fetch<Post>(
      `*[_type == "post" && slug.current == $slug][0] {
        _id, title, slug, category, subCategory->{_id, title, slug}, programSubCategory->{_id, title, slug}, projectSubCategory->{_id, title, slug}, blogSubCategory->{_id, title}, tags, excerpt, publishedAt, eventDateStart, eventDateEnd, author, mainImage, body
      }`,
      { slug }
    );
  } catch {
    return null;
  }
}

async function getRelatedPosts(post: Post): Promise<PostGridPost[]> {
  try {
    const exclude = [post.slug.current];
    let related: PostGridPost[] = [];

    if (post.tags && post.tags.length > 0) {
      related = await client.fetch<PostGridPost[]>(
        `*[_type == "post" && !(slug.current in $exclude) && count(tags[@ in $tags]) > 0] | order(publishedAt desc) [0...${RELATED_POST_LIMIT}] { ${RELATED_POST_FIELDS} }`,
        { exclude, tags: post.tags }
      );
      exclude.push(...related.map((r) => r.slug.current));
    }

    if (related.length < RELATED_POST_LIMIT) {
      const needed = RELATED_POST_LIMIT - related.length;
      let subFilter = "category == $category";
      const params: Record<string, unknown> = { exclude, category: post.category };
      if (post.category === "Missions" && post.subCategory) {
        subFilter = `category == "Missions" && subCategory._ref == $subCat`;
        params.subCat = post.subCategory._id;
      } else if (post.category === "Programs" && post.programSubCategory) {
        subFilter = `category == "Programs" && programSubCategory._ref == $subCat`;
        params.subCat = post.programSubCategory._id;
      } else if (post.category === "Projects" && post.projectSubCategory) {
        subFilter = `category == "Projects" && projectSubCategory._ref == $subCat`;
        params.subCat = post.projectSubCategory._id;
      } else if (post.category === "Blogs" && post.blogSubCategory) {
        subFilter = `category == "Blogs" && blogSubCategory._ref == $subCat`;
        params.subCat = post.blogSubCategory._id;
      }
      const fallback = await client.fetch<PostGridPost[]>(
        `*[_type == "post" && !(slug.current in $exclude) && (${subFilter})] | order(publishedAt desc) [0...${needed}] { ${RELATED_POST_FIELDS} }`,
        params
      );
      related = [...related, ...fallback];
      exclude.push(...fallback.map((r) => r.slug.current));
    }

    // Cross-category match: an article tagged with this post's category or
    // specific sub-category (e.g. a Blogs post tagged "Summits & Conferences")
    // is related to it even though its own main category differs — surfaces
    // it here rather than only on posts sharing the same category/sub-category.
    if (related.length < RELATED_POST_LIMIT) {
      const needed = RELATED_POST_LIMIT - related.length;
      const subTitle =
        post.subCategory?.title || post.programSubCategory?.title || post.projectSubCategory?.title || post.blogSubCategory?.title;
      const matchTitles = subTitle ? [post.category, subTitle] : [post.category];
      const byTag = await client.fetch<PostGridPost[]>(
        `*[_type == "post" && !(slug.current in $exclude) && count(tags[@ in $matchTitles]) > 0] | order(publishedAt desc) [0...${needed}] { ${RELATED_POST_FIELDS} }`,
        { exclude, matchTitles }
      );
      related = [...related, ...byTag];
    }

    return related;
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function resolveBackLink(
  category: string,
  subCategory?: TaxonomyRef,
  programSubCategory?: TaxonomyRef,
  projectSubCategory?: TaxonomyRef,
  fromHome?: boolean,
): { href: string; label: string } {
  if (fromHome) return { href: "/", label: "Back to Home" };
  if (category === "Missions") {
    if (subCategory) return { href: `/missions/${subCategory.slug.current}`, label: `Back to ${subCategory.title}` };
    return { href: "/missions", label: "Back to Missions" };
  }
  if (category === "Programs") {
    if (programSubCategory) return { href: `/programs/${programSubCategory.slug.current}`, label: `Back to ${programSubCategory.title}` };
    return { href: "/programs", label: "Back to Programs" };
  }
  if (category === "Projects") {
    if (projectSubCategory) return { href: `/projects/${projectSubCategory.slug.current}`, label: `Back to ${projectSubCategory.title}` };
    return { href: "/projects", label: "Back to Projects" };
  }
  if (category === "Blogs") {
    return { href: "/blogs", label: "Back to Blogs" };
  }
  const map: Record<string, { href: string; label: string }> = {
    News:           { href: "/news",          label: "Back to News & Events" },
    Events:         { href: "/news",          label: "Back to News & Events" },
    Testimonies:    { href: "/testimonies",   label: "Back to Testimonies" },
    Readings:       { href: "/readings",      label: "Back to Readings" },
    "Sunday School":{ href: "/sunday-school", label: "Back to Sunday School" },
  };
  return map[category] ?? { href: "/blog", label: "Back to Articles" };
}

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams]);
  const post = await getPost(slug);

  if (!post) notFound();

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).fit("max").auto("format").url()
    : null;

  const backLink = resolveBackLink(post.category, post.subCategory, post.programSubCategory, post.projectSubCategory, from === "home");
  const relatedPosts = await getRelatedPosts(post);

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a4731] text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1 text-[#52b788] text-sm font-medium mb-6 hover:underline"
          >
            <ChevronLeft size={15} /> {backLink.label}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {post.author}
              </span>
            )}
            {post.category === "Events" && post.eventDateStart ? (
              <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <Calendar size={13} />
                {formatEventDate(post.eventDateStart, post.eventDateEnd)}
              </span>
            ) : post.publishedAt ? (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(post.publishedAt)}
              </span>
            ) : null}
            {post.category && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${categoryColour(displayCategory(post))}`}
              >
                {displayCategory(post)}
              </span>
            )}
          </div>
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
        </div>
      </section>

      {/* Main Image */}
      {mainImageUrl && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <Image
              src={mainImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Body */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-10 border-l-4 border-[#52b788] pl-4 italic">
              {post.excerpt}
            </p>
          )}
          {post.body && post.body.length > 0 ? (
            <PortableBody body={post.body} />
          ) : (
            <p className="text-gray-400 italic">No content yet.</p>
          )}
        </div>
      </section>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-[#f0fdf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-8">
              Related Articles
            </h2>
            <PostGrid posts={relatedPosts} />
          </div>
        </section>
      )}
    </>
  );
}
