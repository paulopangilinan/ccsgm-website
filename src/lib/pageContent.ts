import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type PageContent = {
  body?: unknown[];
  heroImage?: SanityImage;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
};

export async function getPageContent(id: string): Promise<PageContent | null> {
  try {
    return await client.fetch<PageContent | null>(
      `*[_id == $id][0]{ body, heroImage, heroEyebrow, heroTitle, heroSubtitle }`,
      { id }
    );
  } catch {
    return null;
  }
}
