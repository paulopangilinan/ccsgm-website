import type { Metadata } from "next";
import Image from "next/image";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import { urlFor } from "@/sanity/lib/image";
import { getLocationsPage } from "@/lib/locationsPage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Locations",
  description: "Find a CCSGM congregation near you across Cavite and Surigao del Sur.",
};

export default async function LocationsPage() {
  const page = await getLocationsPage();
  const heroImageUrl = page?.heroImage
    ? urlFor(page.heroImage).width(1600).height(900).fit("crop").auto("format").url()
    : undefined;
  const churches = page?.churches ?? [];

  return (
    <>
      <HeroSection
        eyebrow={page?.heroEyebrow || "Worship With Us"}
        title={page?.heroTitle || "Find a Location Near You"}
        subtitle={
          page?.heroSubtitle ||
          "CCSGM has five congregations across Cavite province and Surigao del Sur. All are welcome."
        }
        imageUrl={heroImageUrl}
        imageName="locations"
      />
      {/* Location cards */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6">
            {churches.map((loc) => (
              <div
                key={loc._key}
                className="flex flex-col md:flex-row rounded-2xl border border-gray-100 hover:border-[#52b788]/40 hover:shadow-md transition-all overflow-hidden"
              >
                {/* Details */}
                <div className="flex-1 p-7">
                  <div className="flex items-start justify-between gap-2 mb-4">
                    <h2 className="text-lg font-bold text-[#1a4731]">
                      {loc.name}
                    </h2>
                    {loc.note && (
                      <span className="shrink-0 text-xs font-semibold bg-[#52b788]/10 text-[#52b788] px-2 py-0.5 rounded-full">
                        {loc.note}
                      </span>
                    )}
                  </div>
                  {loc.image && (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden mb-4">
                      <Image
                        src={urlFor(loc.image).width(700).height(400).fit("crop").auto("format").url()}
                        alt={loc.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <ul className="space-y-2.5">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin size={15} className="text-[#52b788] mt-0.5 shrink-0" />
                      {loc.address}
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600">
                      <Clock size={15} className="text-[#52b788] shrink-0" />
                      {loc.schedule}
                    </li>
                    {loc.phone && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone size={15} className="text-[#52b788] shrink-0" />
                        {loc.phone}
                      </li>
                    )}
                    {loc.email && (
                      <li className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail size={15} className="text-[#52b788] shrink-0" />
                        <a
                          href={`mailto:${loc.email}`}
                          className="hover:text-[#52b788] transition-colors"
                        >
                          {loc.email}
                        </a>
                      </li>
                    )}
                  </ul>
                </div>

                {/* Map */}
                <div className="w-full md:w-96 h-56 md:h-auto shrink-0">
                  <iframe
                    src={`https://maps.google.com/maps?q=${loc.mapQuery}&output=embed`}
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "224px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title={`Map for ${loc.name}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plan your visit CTA */}
      <section className="py-16 bg-[#f0fdf4]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-[#1a4731] mb-3">
            Planning Your First Visit?
          </h2>
          <p className="text-gray-500 mb-6">
            We&apos;d love to hear from you. Reach out to the location nearest
            you, or send us a message and we&apos;ll connect you with the right
            congregation.
          </p>
          <a
            href="/contact"
            className="inline-flex items-center px-6 py-3 rounded-full bg-[#52b788] text-white font-semibold hover:bg-[#3d9971] transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </section>
    </>
  );
}
