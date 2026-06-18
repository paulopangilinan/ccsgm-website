import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Gideon 300 Building Project",
  description:
    "CCSGM's vision to build a dedicated church facility for the glory of God and the blessing of the community.",
};

export default function Gideon300Page() {
  return (
    <>
      <HeroSection
        eyebrow="Projects"
        title="Gideon 300 Building Project"
        subtitle="After seeking God's provision for over a decade, CCSGM is believing Him for a dedicated church facility — a larger home for worship, fellowship, and equipping."
        imageName="locations"
      />

      {/* Overview */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
            The Vision
          </p>
          <h2 className="text-3xl font-bold text-[#1a4731] mb-6 leading-snug">
            A Home Built for God's Glory
          </h2>
          <div className="space-y-4 text-gray-600 leading-relaxed">
            <p>
              The Gideon 300 Building Project is CCSGM&apos;s faith-driven initiative
              to construct a dedicated church facility — a larger space where more
              people can gather to hear God&apos;s Word, grow in fellowship, and be
              equipped for ministry.
            </p>
            <p>
              The church&apos;s current sanctuary faces ongoing environmental challenges,
              with storms and high tides a constant concern for the congregation.
              Beyond safety, the existing space limits parking and the capacity to
              host the growing community.
            </p>
            <p>
              Two CCSGM members — Bro. Vinoy and Architect Mary Francisco — have
              developed building plans featuring multiple floors with dedicated spaces
              for worship, fellowship, and Christian education.
            </p>
            <p>
              We believe that through God&apos;s provision and the generosity of His
              people, this building will become an instrument of blessing — not only
              to CCSGM but to the wider community around us.
            </p>
          </div>
        </div>
      </section>

      {/* Goals */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a4731] mb-3">What We&apos;re Building For</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "More Room for the Gospel",
                body: "A larger sanctuary means more seats for neighbours, families, and visitors to encounter Jesus Christ and hear the preaching of God's Word.",
              },
              {
                title: "Fellowship & Community",
                body: "Dedicated fellowship spaces will enable small groups, discipleship programmes, and community activities to flourish under one roof.",
              },
              {
                title: "Christian Education",
                body: "Purpose-built rooms for Sunday School, the Ergartes Bible Institute, and youth programmes — investing in the next generation of believers.",
              },
            ].map(({ title, body }) => (
              <div key={title} className="p-8 rounded-2xl bg-white hover:shadow-md transition-shadow">
                <div className="w-2 h-8 rounded-full bg-[#52b788] mb-5" />
                <h3 className="text-lg font-semibold text-[#1a4731] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#1a4731] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Partner With This Vision</h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            Resources are limited, but our God is not. If you feel led to
            support the Gideon 300 Building Project, every gift brings us
            one step closer to a home built for His glory.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/give"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors"
            >
              Give to the Building Project
            </Link>
            <a
              href="mailto:ccsgm.kawit@gmail.com"
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
