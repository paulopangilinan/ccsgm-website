import type { Metadata } from "next";
import TaxonomyIndexPage from "@/components/TaxonomyIndexPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Programs",
  description: "CCSGM's ongoing programs — CEF, summits & conferences, One Worship, and more.",
};

export default function ProgramsPage() {
  return (
    <TaxonomyIndexPage
      type="program"
      heroEyebrow="Our Passion"
      heroTitle="Programs"
      heroSubtitle="Ongoing programs that grow us in fellowship, worship, and the knowledge of Christ."
      basePath="/programs"
      emptyMessage="No programs to show yet. Check back soon."
    />
  );
}
