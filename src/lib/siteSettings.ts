import { client } from "@/sanity/client";

export type SiteSettings = {
  contactEmail?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch<SiteSettings | null>(`*[_id == "site-settings"][0]`);
  } catch {
    return null;
  }
}
