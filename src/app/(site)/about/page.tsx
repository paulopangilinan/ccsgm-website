import type { Metadata } from "next";
import Image from "next/image";
import { CheckCircle } from "lucide-react";
import ValueBody from "@/components/ValueBody";
import HeroSection from "@/components/HeroSection";
import { urlFor } from "@/sanity/lib/image";
import { getAboutPage } from "@/lib/aboutPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Who We Are",
  description:
    "Learn about CCSGM's history, beliefs, values, and leadership.",
};

export default async function AboutPage() {
  const about = await getAboutPage();
  const heroImageUrl = about?.heroImage
    ? urlFor(about.heroImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;

  return (
    <>
      <HeroSection
        eyebrow={about?.heroEyebrow || "Who We Are"}
        title={about?.heroTitle || "About CCSGM"}
        subtitle={
          about?.heroSubtitle ||
          "Cross of Christ Salvation Gospel Ministries (CCSGM) is a Christian Evangelical Church in the Philippines. We are part of Sovereign Grace Churches, a family of churches passionate in advancing the Great Commission through church planting and equipping local churches."
        }
        imageUrl={heroImageUrl}
        imageName="about"
      />

      {/* Mission */}
      {about?.missionStatement && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-5">Our Mission</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {about.missionStatement}
            </p>
          </div>
        </section>
      )}

      {/* Timeline */}
      {about?.timeline && about.timeline.length > 0 && (
        <section className="py-20 bg-[#f0fdf4]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-10">Our History</h2>
            <ol className="relative border-l-2 border-[#52b788]/30 space-y-8">
              {about.timeline.map(({ _key, year, event }) => (
                <li key={_key} className="pl-8 relative">
                  <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#52b788]" />
                  <p className="text-xs font-bold text-[#52b788] uppercase tracking-widest mb-1">
                    {year}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed">{event}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Family of Churches */}
      {about?.familyOfChurchesParagraphs && about.familyOfChurchesParagraphs.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-5">
              Our Family of Churches
            </h2>
            {about.familyOfChurchesParagraphs.map((p, i) => (
              <p key={i} className="text-gray-600 leading-relaxed mb-4">
                {p}
              </p>
            ))}
            {about.statementOfFaithUrl && (
              <div className="mt-6">
                <a
                  href={about.statementOfFaithUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-5 py-2.5 rounded-full bg-[#1a4731] text-white text-sm font-semibold hover:bg-[#16382a] transition-colors"
                >
                  Statement of Faith
                </a>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Shared Values */}
      {about?.values && about.values.length > 0 && (
        <section className="py-20 bg-[#f0fdf4]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-10">
              Our Shared Values
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {about.values.map(({ _key, title, body }) => (
                <div
                  key={_key}
                  className="p-6 bg-white rounded-2xl border border-gray-100"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle
                      size={18}
                      className="text-[#52b788] mt-0.5 shrink-0"
                    />
                    <h3 className="text-[#1a4731] font-bold text-base leading-snug">
                      {title}
                    </h3>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    <ValueBody text={body} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Leadership */}
      {about?.leaders && about.leaders.length > 0 && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-[#1a4731] mb-10">Leadership</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {about.leaders.map(({ _key, name, role, bio, photo }) => (
                <div key={_key} className="p-7 bg-[#f0fdf4] rounded-2xl border border-gray-100">
                  <div className="flex flex-col items-center sm:flex-row sm:items-center gap-4 mb-3">
                    {photo ? (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0">
                        <Image
                          src={urlFor(photo).width(128).height(128).fit("crop").auto("format").url()}
                          alt={name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-[#1a4731] flex items-center justify-center shrink-0">
                        <span className="text-[#52b788] font-bold text-xl">
                          {name[0]}
                        </span>
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <h3 className="font-bold text-[#1a4731] text-base">{name}</h3>
                      <p className="text-[#52b788] text-xs font-semibold uppercase tracking-wide">
                        {role}
                      </p>
                    </div>
                  </div>
                  {bio && <p className="text-gray-500 text-sm leading-relaxed">{bio}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
