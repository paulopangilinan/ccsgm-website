import type { Metadata } from "next";
import TaxonomyDetailPage from "@/components/TaxonomyDetailPage";
import { getTaxonomyMetadata } from "@/lib/taxonomy";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return getTaxonomyMetadata("project", slug);
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <TaxonomyDetailPage
      type="project"
      slug={slug}
      postCategory="Projects"
      postSubField="projectSubCategory"
      updatesLabel="Projects"
    />
  );
}
