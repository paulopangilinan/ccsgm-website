import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type GivingMethod = {
  _key: string;
  template?: "default" | "gcash" | "bpi";
  title: string;
  accountName?: string;
  accountNumber?: string;
  bankBranch?: string;
  notes?: string;
  backgroundColor?: { hex: string };
  qrCode?: SanityImage;
};

export type GivePage = {
  givingMethods?: GivingMethod[];
};

export async function getGivePage(): Promise<GivePage | null> {
  try {
    return await client.fetch<GivePage | null>(`*[_id == "give-page"][0]`);
  } catch {
    return null;
  }
}
