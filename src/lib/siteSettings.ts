import { client } from "@/sanity/client";

export type SiteSettings = {
  contactEmails?: string[];
  contactEmail?: string;
};

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await client.fetch<SiteSettings | null>(`*[_id == "site-settings"][0]`);
  } catch {
    return null;
  }
}

/** The contact form's recipient list — the new array field if set, else the legacy single field. */
export function getContactRecipients(settings: SiteSettings | null): string[] {
  if (settings?.contactEmails && settings.contactEmails.length > 0) return settings.contactEmails;
  if (settings?.contactEmail) return [settings.contactEmail];
  return [];
}
