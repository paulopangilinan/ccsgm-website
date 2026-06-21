import { client } from "@/sanity/client";

export type TaxonomyType = "mission" | "program" | "project";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type TaxonomyItem = {
  _id: string;
  title: string;
  slug: { current: string };
  eyebrow?: string;
  excerpt?: string;
  heroImage?: SanityImage;
  body?: unknown[];
};

export type NavItem = {
  title: string;
  slug: { current: string };
};

const MAX_NAV_ITEMS = 5;

export async function getTaxonomyItems(type: TaxonomyType): Promise<TaxonomyItem[]> {
  try {
    return await client.fetch<TaxonomyItem[]>(
      `*[_type == $type] | order(coalesce(order, 999) asc, title asc) {
        _id, title, slug, eyebrow, excerpt, heroImage
      }`,
      { type }
    );
  } catch {
    return [];
  }
}

export async function getTaxonomyItemBySlug(type: TaxonomyType, slug: string): Promise<TaxonomyItem | null> {
  try {
    return await client.fetch<TaxonomyItem | null>(
      `*[_type == $type && slug.current == $slug][0]{
        _id, title, slug, eyebrow, excerpt, heroImage, body
      }`,
      { type, slug }
    );
  } catch {
    return null;
  }
}

export async function getTaxonomyMetadata(type: TaxonomyType, slug: string) {
  const item = await getTaxonomyItemBySlug(type, slug);
  if (!item) return { title: "Not Found" };
  return { title: item.title, description: item.excerpt };
}

export async function getNavItems(type: TaxonomyType): Promise<NavItem[]> {
  try {
    const items = await client.fetch<NavItem[]>(
      `*[_type == $type && showInNav == true] | order(coalesce(order, 999) asc, title asc) [0...${MAX_NAV_ITEMS}] {
        title, slug
      }`,
      { type }
    );
    return items;
  } catch {
    return [];
  }
}
