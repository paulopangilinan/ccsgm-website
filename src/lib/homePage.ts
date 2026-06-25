import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };
type LinkButton = { label: string; url: string };

export type HighlightCard = { _key: string; icon: string; title: string; body: string };
export type Stat = { _key: string; value: string; label: string };

export type FeaturedPostRef = {
  _id: string;
  slug: { current: string };
  category: string;
  blogSubCategory?: { _id: string; title: string };
  title: string;
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  mainImage?: SanityImage;
};

export type HomePage = {
  heroImage?: SanityImage;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroPrimaryButton?: LinkButton;
  heroSecondaryButton?: LinkButton;
  featuredMode?: "auto" | "manual";
  featuredPosts?: FeaturedPostRef[];
  highlightsTitle?: string;
  highlightsSubtitle?: string;
  highlights?: HighlightCard[];
  storyEyebrow?: string;
  storyTitle?: string;
  storyParagraphs?: string[];
  storyLink?: LinkButton;
  stats?: Stat[];
  locationsEyebrow?: string;
  locationsTitle?: string;
  locationsLinkLabel?: string;
  ctaTitle?: string;
  ctaBody?: string;
  ctaButton?: LinkButton;
};

const FEATURED_POST_FIELDS = `
  _id, slug, category, blogSubCategory->{_id, title}, title, excerpt,
  publishedAt, eventDateStart, eventDateEnd, mainImage
`;

export async function getHomePage(): Promise<HomePage | null> {
  try {
    return await client.fetch<HomePage | null>(
      `*[_id == "home-page"][0]{
        ...,
        featuredPosts[]->{ ${FEATURED_POST_FIELDS} }
      }`
    );
  } catch {
    return null;
  }
}
