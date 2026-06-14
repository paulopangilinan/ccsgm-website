import type { Metadata } from "next";
import { MapPin, Mail } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import PostGrid, { type Post } from "@/components/PostGrid";
import Link from "next/link";
import { client } from "@/sanity/client";
import GalleryLightbox from "@/components/GalleryLightbox";
import fs from "fs";
import path from "path";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Church Planting: Surigao Missions",
  description:
    "CCSGM's church planting work in Surigao — reaching mountain communities across six locations since the mid-1990s.",
};

type RawPost = Post & { mainImage?: { _type: "image"; asset: { _ref: string } } };

const GALLERY_DIR = path.join(process.cwd(), "public", "images", "missions", "surigao");
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

function getGalleryImages(): string[] {
  try {
    return fs
      .readdirSync(GALLERY_DIR)
      .filter((f) => ALLOWED_EXTENSIONS.has(path.extname(f).toLowerCase()))
      .map((f) => `/images/missions/surigao/${f}`);
  } catch {
    return [];
  }
}

async function getSurigaoPosts(): Promise<Post[]> {
  try {
    const posts = await client.fetch<RawPost[]>(
      `*[_type == "post" && category == "Missions" && subCategory == "Surigao"] | order(publishedAt desc) {
        _id, slug, category, title, excerpt, publishedAt, featured, author, mainImage
      }`
    );
    return posts.map((p) => ({
      ...p,
      mainImage: p.mainImage ? p.mainImage : undefined,
    }));
  } catch {
    return [];
  }
}

const locations = [
  "Tandag, Surigao del Sur",
  "Carascal, Surigao del Sur",
  "Pantukan",
  "Gacub",
  "Cabangahan",
  "Babuyan",
];

export default async function SurigaoMissionsPage() {
  const posts = await getSurigaoPosts();
  const galleryImages = getGalleryImages();

  return (
    <>
      <HeroSection
        eyebrow="Church Planting"
        title="Surigao Missions"
        subtitle="Reaching mountain communities in Surigao del Sur with the Gospel — planting churches that glorify Christ and serve the unreached."
        imageName="locations"
      />

      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
                Our Story
              </p>
              <h2 className="text-3xl font-bold text-[#1a4731] mb-5 leading-snug">
                A Call to the Mountains of Surigao
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                In the mid-1990s, Head Pastor Jeffrey Jo felt a deep calling to
                bring the Gospel to the remote communities of Surigao. Connecting
                with local pastors who shared a hunger for Gospel outreach and
                theological grounding, the work began in faith.
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                Through God&apos;s grace and mercy, CCSGM Surigao grew into a
                network of six churches spanning Tandag, Carascal, Pantukan,
                Gacub, Cabangahan, and Babuyan. The ministry continues to grow to
                this day.
              </p>
              <p className="text-gray-600 leading-relaxed">
                During the pandemic, the ministry adapted by holding regular Zoom
                meetings to equip and encourage local pastors — sustaining the
                work even when in-person gatherings were not possible.
              </p>
            </div>

            {/* Locations */}
            <div className="bg-[#f0fdf4] rounded-2xl p-8">
              <h3 className="text-lg font-bold text-[#1a4731] mb-5">
                Church Planting Locations
              </h3>
              <ul className="space-y-3">
                {locations.map((loc) => (
                  <li key={loc} className="flex items-center gap-3 text-gray-600">
                    <MapPin size={16} className="text-[#52b788] shrink-0" />
                    <span className="text-sm">{loc}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t border-[#52b788]/20">
                <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1">
                  Evangelism Outreach
                </p>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <MapPin size={14} className="text-[#52b788] shrink-0" />
                  New Bataan, Davao del Norte
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="py-20 bg-[#f0fdf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-2">
                In the Field
              </p>
              <h2 className="text-3xl font-bold text-[#1a4731]">Gallery</h2>
            </div>
            <GalleryLightbox images={galleryImages} />
          </div>
        </section>
      )}

      {/* Related Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-2">
              Missions
            </p>
            <h2 className="text-3xl font-bold text-[#1a4731]">
              Surigao Mission Updates
            </h2>
          </div>
          <PostGrid
            posts={posts}
            emptyMessage="No articles yet for Surigao Missions. Check back soon."
          />
        </div>
      </section>

      {/* How We Serve */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a4731] mb-3">
              How We Serve
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              The Surigao mission is sustained through faithful partnership,
              pastoral mentoring, and consistent Gospel proclamation.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Church Planting",
                body: "Establishing local congregations in unreached mountain communities, rooting them in the Word and equipping them for self-sustaining ministry.",
              },
              {
                title: "Pastoral Mentoring",
                body: "Head Pastor Jeffrey Jo and the CCSGM team provide theological training and ongoing support to local pastors across the six Surigao locations.",
              },
              {
                title: "Evangelism Outreach",
                body: "Active evangelism extending beyond established churches, including outreach work in New Bataan, Davao del Norte.",
              },
            ].map(({ title, body }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-white hover:shadow-md transition-shadow"
              >
                <div className="w-2 h-8 rounded-full bg-[#52b788] mb-5" />
                <h3 className="text-lg font-semibold text-[#1a4731] mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1a4731] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner With Surigao Missions</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            Your prayers and giving directly support church planting, pastoral
            training, and Gospel outreach in some of the most remote communities
            in the Philippines.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/give"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors"
            >
              Give to Surigao Missions
            </Link>
            <a
              href="mailto:info@grey-chicken-485947.hostingersite.com"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full border border-white/30 text-white font-semibold hover:bg-white/10 transition-colors"
            >
              <Mail size={16} />
              Get in Touch
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
