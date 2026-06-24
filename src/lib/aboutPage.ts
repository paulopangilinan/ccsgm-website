import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type TimelineEntry = { _key: string; year: string; event: string; caption?: string; photo?: SanityImage };
export type ValueEntry = { _key: string; title: string; body: string };
export type LeaderEntry = { _key: string; name: string; role: string; bio?: string; photo?: SanityImage };
export type InfoSectionBlock =
  | { _key: string; _type: "sectionParagraph"; text: string }
  | { _key: string; _type: "sectionButton"; label: string; url: string };

export type AboutPage = {
  heroImage?: SanityImage;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  missionContent?: InfoSectionBlock[];
  timeline?: TimelineEntry[];
  familyOfChurchesContent?: InfoSectionBlock[];
  values?: ValueEntry[];
  leaders?: LeaderEntry[];
};

export async function getAboutPage(): Promise<AboutPage | null> {
  try {
    return await client.fetch<AboutPage | null>(`*[_id == "about-page"][0]`);
  } catch {
    return null;
  }
}
