import type { Metadata } from "next";
import { BookOpen, Church, Globe, Users, Star } from "lucide-react";
import Link from "next/link";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Ministries",
  description:
    "Explore CCSGM's ministries: Ergartes Bible Institute, Church Extension Fellowship, Missions, and more.",
};

const ministries = [
  {
    icon: BookOpen,
    name: "Ergartes Bible Institute",
    tagline: "Equipping the Next Generation of Ministers",
    body: "Ergartes Bible Institute (EBI) provides rigorous, gospel-centred theological education to equip leaders for church ministry and missions. Named from the Greek word for 'workers', EBI trains pastors, elders, and lay leaders across our network.",
    highlights: [
      "Systematic and biblical theology",
      "Preaching and pastoral ministry training",
      "Missions and church-planting modules",
    ],
  },
  {
    icon: Church,
    name: "Church Extension Fellowship",
    tagline: "Planting Churches Across the Philippines",
    body: "The Church Extension Fellowship (CEF) is CCSGM's church-planting arm. Through CEF, we identify unreached communities, send church planters, and support emerging congregations as they grow into self-sustaining local churches.",
    highlights: [
      "Church planting in Cavite and Surigao",
      "Pastor and planter support",
      "Annual CEF conferences and summits",
    ],
  },
  {
    icon: Globe,
    name: "Missions",
    tagline: "Reaching the Unreached",
    body: "CCSGM is actively engaged in cross-cultural missions, with a particular focus on the mountain communities of Surigao del Sur. Our missionaries plant churches, disciple believers, and establish gospel-centred congregations in underserved areas.",
    highlights: [
      "Mountain missions in Surigao del Sur",
      "Short-term mission trips",
      "Partnership with Sovereign Grace Churches globally",
    ],
  },
  {
    icon: Users,
    name: "Leadership Summit",
    tagline: "Developing Leaders for the Church",
    body: "Our annual Leadership Summit gathers pastors, elders, and church leaders across our network for training, encouragement, and strategic alignment. It is a key venue for sharpening vision and deepening partnerships.",
    highlights: [
      "Annual summit for church leaders",
      "Workshops on pastoral ministry",
      "Network-wide prayer and worship",
    ],
  },
  {
    icon: Star,
    name: "Sunday School & Seekers' Camp",
    tagline: "Raising Up Disciples from Every Generation",
    body: "Sunday School programmes run at all CCSGM locations, nurturing children, youth, and adults in the Word. Our Seekers' Camp provides an intensive encounter weekend for those exploring Christianity.",
    highlights: [
      "Age-appropriate Sunday School at all locations",
      "Annual Seekers' Camp for enquirers",
      "Youth discipleship and relay conferences",
    ],
  },
];

export default function MinistriesPage() {
  return (
    <>
      <HeroSection
        eyebrow="Our Work"
        title="Ministries & Programmes"
        subtitle="From biblical education to frontier missions, our ministries are united by one goal — advancing the Great Commission."
        imageName="ministries"
      />

      {/* Ministry cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {ministries.map(({ icon: Icon, name, tagline, body, highlights }) => (
            <div
              key={name}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 rounded-2xl border border-gray-100 hover:border-[#52b788]/30 hover:shadow-sm transition-all"
            >
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-full bg-[#1a4731] flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#52b788]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#1a4731]">{name}</h2>
                    <p className="text-xs text-[#52b788] font-semibold">{tagline}</p>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">{body}</p>
              </div>
              <div className="bg-[#f0fdf4] rounded-xl p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
                  Highlights
                </p>
                <ul className="space-y-2">
                  {highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#52b788] shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Gideon 300 Building Project */}
      <section className="py-20 bg-[#1a4731] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
            Special Initiative
          </p>
          <h2 className="text-3xl font-bold mb-5">
            Gideon 300 Building Project
          </h2>
          <p className="text-gray-300 leading-relaxed mb-8">
            The Gideon 300 Building Project is our campaign to establish a
            permanent home for gospel ministry — a facility that will house the
            Ergartes Bible Institute, training programmes, and our growing
            congregation. Like Gideon&apos;s 300, we trust God to do great
            things through willing, faithful people.
          </p>
          <Link
            href="/give"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors"
          >
            Support the Building Project
          </Link>
        </div>
      </section>
    </>
  );
}
