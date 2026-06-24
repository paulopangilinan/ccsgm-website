import { client } from "@/sanity/client";

type SanityImage = { _type: "image"; asset: { _ref: string } };

export type ChurchEntry = {
  _key: string;
  name: string;
  address: string;
  schedule: string;
  phone?: string;
  email?: string;
  note?: string;
  mapQuery: string;
  image?: SanityImage;
};

export type LocationsPage = {
  heroImage?: SanityImage;
  heroEyebrow?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  churches?: ChurchEntry[];
};

export async function getLocationsPage(): Promise<LocationsPage | null> {
  try {
    return await client.fetch<LocationsPage | null>(`*[_id == "locations-page"][0]`);
  } catch {
    return null;
  }
}
