import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type TimelineEntry = { _key: string; year: string; event: string };
export type ValueEntry = { _key: string; title: string; body: string };
export type LeaderEntry = { _key: string; name: string; role: string; bio?: string; photo?: SanityImage };

export type AboutPage = {
  heroImage?: SanityImage;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  missionStatement?: string;
  timeline?: TimelineEntry[];
  familyOfChurchesParagraphs?: string[];
  statementOfFaithUrl?: string;
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
