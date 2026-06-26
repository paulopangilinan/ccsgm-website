import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";

const PAGE_TYPE_PATH: Record<string, string> = {
  mission: "missions",
  program: "programs",
  project: "projects",
};

type SanityImage = { _type: "image"; asset: { _ref: string } };

type PageDoc = {
  _type: "mission" | "program" | "project";
  title: string;
  slug: { current: string };
  excerpt?: string;
  heroImage?: SanityImage;
};

type ArticleDoc = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  excerpt?: string;
  mainImage?: SanityImage;
  blogSubCategory?: { title: string };
  programSubCategory?: { title: string };
  subCategory?: { title: string };
  projectSubCategory?: { title: string };
};

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) {
    return NextResponse.json({ pages: [], articles: [] });
  }

  const pattern = `*${q}*`;

  try {
    const [pages, articles] = await Promise.all([
      client.fetch<PageDoc[]>(
        `*[_type in ["mission", "program", "project"] && title match $pattern] | order(title asc) [0...6] {
          _type, title, slug, excerpt, heroImage
        }`,
        { pattern }
      ),
      client.fetch<ArticleDoc[]>(
        `*[_type == "post" && (
          title match $pattern ||
          category match $pattern ||
          blogSubCategory->title match $pattern ||
          programSubCategory->title match $pattern ||
          subCategory->title match $pattern ||
          projectSubCategory->title match $pattern ||
          count(tags[@ match $pattern]) > 0
        )] | order(publishedAt desc) [0...12] {
          _id, title, slug, category, excerpt, mainImage,
          blogSubCategory->{title},
          programSubCategory->{title},
          subCategory->{title},
          projectSubCategory->{title}
        }`,
        { pattern }
      ),
    ]);

    return NextResponse.json({
      pages: pages.map((p) => ({
        type: p._type,
        title: p.title,
        excerpt: p.excerpt,
        href: `/${PAGE_TYPE_PATH[p._type]}/${p.slug.current}`,
        imageUrl: p.heroImage
          ? urlFor(p.heroImage).width(160).height(160).fit("crop").auto("format").url()
          : undefined,
      })),
      articles: articles.map((a) => ({
        id: a._id,
        title: a.title,
        excerpt: a.excerpt,
        href: `/blog/${a.slug.current}`,
        category:
          a.blogSubCategory?.title ||
          a.programSubCategory?.title ||
          a.subCategory?.title ||
          a.projectSubCategory?.title ||
          a.category,
        imageUrl: a.mainImage
          ? urlFor(a.mainImage).width(160).height(160).fit("crop").auto("format").url()
          : undefined,
      })),
    });
  } catch {
    return NextResponse.json({ pages: [], articles: [] });
  }
}
