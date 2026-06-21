import type { Metadata } from "next";
import TaxonomyIndexPage from "@/components/TaxonomyIndexPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Missions",
  description:
    "CCSGM's church planting missions, reaching unreached communities across the Philippines with the Gospel.",
};

export default function MissionsPage() {
  return (
    <TaxonomyIndexPage
      type="mission"
      heroEyebrow="Our Passion"
      heroTitle="Missions"
      heroSubtitle="Planting churches and reaching unreached communities across the Philippines with the Gospel."
      basePath="/missions"
      emptyMessage="No missions to show yet. Check back soon."
    />
  );
}
