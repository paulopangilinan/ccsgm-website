import { client } from "@/sanity/client";

export type ContactInfo = {
  mainOfficeLabel?: string;
  mainOfficeAddress?: string;
  phone?: string;
  email?: string;
  officeHours?: string;
};

export async function getContactPage(): Promise<ContactInfo | null> {
  try {
    return await client.fetch<ContactInfo | null>(`*[_id == "contact-page"][0]`);
  } catch {
    return null;
  }
}
