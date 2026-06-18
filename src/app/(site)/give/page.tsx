import type { Metadata } from "next";
import { Heart, Building, Globe, BookOpen } from "lucide-react";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Give",
  description: "Support the ministry of CCSGM through your generous giving.",
};

const funds = [
  {
    icon: Heart,
    name: "General Fund",
    description:
      "Supports the day-to-day operations of all CCSGM congregations — pastoral ministry, Sunday services, and community outreach.",
  },
  {
    icon: Building,
    name: "Gideon 300 Building Project",
    description:
      "Contributes to our campaign to build a permanent home for gospel ministry, training, and our growing congregation.",
  },
  {
    icon: Globe,
    name: "Missions Fund",
    description:
      "Funds our missionaries reaching unreached communities in Surigao del Sur and beyond.",
  },
  {
    icon: BookOpen,
    name: "Ergartes Bible Institute",
    description:
      "Supports scholarships and operations for our theological training school, equipping the next generation of pastors and leaders.",
  },
];

export default function GivePage() {
  return (
    <>
      <HeroSection
        eyebrow="Partner With Us"
        title="Give to the Great Commission"
        subtitle="Your generosity directly fuels church planting, biblical education, and missions to unreached communities across the Philippines."
        imageName="give"
      />

      {/* Scripture */}
      <section className="py-12 bg-[#52b788]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <p className="text-white text-xl font-semibold italic leading-relaxed">
            &ldquo;Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver.&rdquo;
          </p>
          <p className="mt-3 text-white/70 text-sm">2 Corinthians 9:7</p>
        </div>
      </section>

      {/* Giving funds */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-10">
            Where Your Gift Goes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {funds.map(({ icon: Icon, name, description }) => (
              <div
                key={name}
                className="p-7 rounded-2xl border border-gray-100 hover:border-[#52b788]/40 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a4731] flex items-center justify-center mb-4">
                  <Icon size={17} className="text-[#52b788]" />
                </div>
                <h3 className="font-bold text-[#1a4731] mb-2">{name}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to give */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-8">
            How to Give
          </h2>
          <div className="space-y-6">
            <div className="p-6 bg-white rounded-2xl border border-gray-100">
              <h3 className="font-bold text-[#1a4731] mb-2">In Person</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Offerings and tithes are received during Sunday worship services
                at all CCSGM locations. Look for the offering bags or giving
                boxes at each service.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100">
              <h3 className="font-bold text-[#1a4731] mb-2">Bank Transfer</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                You can give via bank transfer to our church account. Please
                contact us at{" "}
                <a
                  href="mailto:ccsgm.kawit@gmail.com"
                  className="text-[#52b788] hover:underline"
                >
                  ccsgm.kawit@gmail.com
                </a>{" "}
                or call (046) 472-9443 for bank details.
              </p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-gray-100">
              <h3 className="font-bold text-[#1a4731] mb-2">
                GCash / Digital Wallets
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                We accept digital giving via GCash and other e-wallets. Contact
                your local CCSGM congregation for the registered number.
              </p>
            </div>
          </div>
          <p className="mt-8 text-sm text-gray-400 text-center">
            For giving enquiries, reach us at{" "}
            <a
              href="mailto:ccsgm.kawit@gmail.com"
              className="text-[#52b788] hover:underline"
            >
              ccsgm.kawit@gmail.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
