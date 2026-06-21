import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { urlFor } from "@/sanity/lib/image";
import { getTaxonomyItems, type TaxonomyType } from "@/lib/taxonomy";

type Props = {
  type: TaxonomyType;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  basePath: string;
  emptyMessage: string;
};

export default async function TaxonomyIndexPage({
  type,
  heroEyebrow,
  heroTitle,
  heroSubtitle,
  basePath,
  emptyMessage,
}: Props) {
  const items = await getTaxonomyItems(type);

  return (
    <>
      <HeroSection eyebrow={heroEyebrow} title={heroTitle} subtitle={heroSubtitle} imageName="locations" />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <p className="text-gray-400 text-center py-10">{emptyMessage}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {items.map((item) => (
                <Link
                  key={item._id}
                  href={`${basePath}/${item.slug.current}`}
                  className="group rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="relative aspect-[4/3] bg-[#f0fdf4]">
                    {item.heroImage && (
                      <Image
                        src={urlFor(item.heroImage).width(800).height(600).fit("crop").auto("format").url()}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    {item.eyebrow && (
                      <p className="text-[#52b788] text-xs font-semibold uppercase tracking-widest mb-2">
                        {item.eyebrow}
                      </p>
                    )}
                    <h2 className="text-lg font-bold text-[#1a4731] mb-2 group-hover:text-[#52b788] transition-colors">
                      {item.title}
                    </h2>
                    {item.excerpt && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                        {item.excerpt}
                      </p>
                    )}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[#1a4731] mt-4 group-hover:text-[#52b788] transition-colors">
                      Learn more <ChevronRight size={14} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
