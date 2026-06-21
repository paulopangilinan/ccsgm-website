import type { Metadata } from "next";
import TaxonomyIndexPage from "@/components/TaxonomyIndexPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Projects",
  description: "CCSGM's building and ministry projects, including the Gideon 300 Building Project.",
};

export default function ProjectsPage() {
  return (
    <TaxonomyIndexPage
      type="project"
      heroEyebrow="Our Passion"
      heroTitle="Projects"
      heroSubtitle="Faith-driven projects that expand our capacity to serve and reach the community."
      basePath="/projects"
      emptyMessage="No projects to show yet. Check back soon."
    />
  );
}
