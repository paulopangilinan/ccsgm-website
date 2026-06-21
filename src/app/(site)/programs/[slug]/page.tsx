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
  return getTaxonomyMetadata("program", slug);
}

export default async function ProgramPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <TaxonomyDetailPage
      type="program"
      slug={slug}
      postCategory="Programs"
      postSubField="programSubCategory"
      updatesLabel="Programs"
    />
  );
}
