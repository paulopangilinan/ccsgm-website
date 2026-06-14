import Link from "next/link";
import { BookOpen, Users, Globe, MapPin, ChevronRight } from "lucide-react";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import FeaturedCarousel, { type FeaturedPost } from "@/components/FeaturedCarousel";

export const revalidate = 60;

type RawPost = FeaturedPost & { mainImage?: { _type: "image"; asset: { _ref: string } } };

function sortAndMap(posts: RawPost[]): FeaturedPost[] {
  posts.sort((a, b) => {
    const da = a.category === "Events" && a.eventDateStart ? a.eventDateStart : a.publishedAt;
    const db = b.category === "Events" && b.eventDateStart ? b.eventDateStart : b.publishedAt;
    return new Date(db).getTime() - new Date(da).getTime();
  });
  return posts.map((p) => ({
    ...p,
    mainImageUrl: p.mainImage
      ? urlFor(p.mainImage).width(800).height(500).fit("crop").auto("format").url()
      : undefined,
  }));
}

async function getFeaturedPosts(): Promise<FeaturedPost[]> {
  try {
    const PAST_EVENT_FILTER = `!(category == "Events" && (
      (defined(eventDateEnd) && dateTime(eventDateEnd) < dateTime(now())) ||
      (!defined(eventDateEnd) && defined(eventDateStart) && dateTime(eventDateStart) < dateTime(now()))
    ))`;

    const featured = await client.fetch<RawPost[]>(
      `*[_type == "post" && featured == true && ${PAST_EVENT_FILTER}] {
        _id, slug, category, title, excerpt, publishedAt, eventDateStart, eventDateEnd, mainImage
      }`
    );

    if (featured.length >= 8) return sortAndMap(featured).slice(0, 8);

    // Pad with recent non-featured posts to reach 8
    const featuredIds = featured.map((p) => p._id);
    const needed = 8 - featured.length;
    const recent = await client.fetch<RawPost[]>(
      `*[_type == "post" && !(_id in $ids) && ${PAST_EVENT_FILTER}] | order(coalesce(eventDateStart, publishedAt) desc)[0..${needed - 1}] {
        _id, slug, category, title, excerpt, publishedAt, eventDateStart, eventDateEnd, mainImage
      }`,
      { ids: featuredIds }
    );

    return sortAndMap([...featured, ...recent]).slice(0, 8);
  } catch {
    return [];
  }
}


const highlights = [
  {
    icon: BookOpen,
    title: "Gospel-Centred Preaching",
    body: "Every Sunday we open God's Word and preach Christ crucified — the power of God for salvation.",
  },
  {
    icon: Users,
    title: "Community & Discipleship",
    body: "From Sunday School to small groups, we grow together in faith, love, and the knowledge of Christ.",
  },
  {
    icon: Globe,
    title: "Missions & Church Planting",
    body: "We are active in reaching unreached areas across the Philippines, planting new congregations.",
  },
];

const locations = [
  { name: "Kawit, Cavite", schedule: "Sunday 7:30 am & 10:00 am" },
  { name: "Cavite City", schedule: "Sunday 9:00 am" },
  { name: "Imus, Cavite", schedule: "Sunday 10:00 am" },
  { name: "Dasmariñas", schedule: "Sunday 9:00 am" },
  { name: "Carascal, Surigao del Sur", schedule: "Sunday 8:00 am" },
];

export default async function HomePage() {
  const featuredPosts = await getFeaturedPosts();
  return (
    <>
      {/* Carousel — hero slide is always slide 1, featured posts follow */}
      <FeaturedCarousel posts={featuredPosts} />

      {/* Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-[#1a4731] mb-3">
              What We&apos;re About
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              We exist to bring people into a real, loving, and personal
              relationship with Jesus Christ as Lord and Saviour.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="p-8 rounded-2xl bg-gray-50 hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-full bg-[#1a4731] flex items-center justify-center mb-5">
                  <Icon size={18} className="text-[#52b788]" />
                </div>
                <h3 className="text-lg font-semibold text-[#1a4731] mb-2">
                  {title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About teaser */}
      <section className="py-20 bg-[#f0fdf4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-3">
                Our Story
              </p>
              <h2 className="text-3xl font-bold text-[#1a4731] mb-5 leading-snug">
                From a Bible Study to a Movement
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                CCSGM began in the 1980s as a humble Bible study in Kawit,
                Cavite. Formally established in 1992, we have grown into a
                multi-location church planting movement across Cavite and
                Surigao del Sur.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                In 2018 we were rebranded as Cross of Christ Salvation Gospel
                Ministries, and in 2022–2023 our senior leadership was ordained
                within the Sovereign Grace Churches network.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-1 text-[#1a4731] font-semibold text-sm hover:text-[#52b788] transition-colors"
              >
                Read our full story <ChevronRight size={16} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { value: "40+", label: "Years of Ministry" },
                { value: "5", label: "Locations" },
                { value: "80+", label: "SGC Partner Churches" },
                { value: "1", label: "Bible Institute" },
              ].map(({ value, label }) => (
                <div
                  key={label}
                  className="p-6 rounded-2xl bg-[#1a4731] text-white"
                >
                  <p className="text-3xl font-bold text-[#52b788]">{value}</p>
                  <p className="text-sm text-gray-300 mt-1">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Locations teaser */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-[#52b788] text-sm font-semibold uppercase tracking-widest mb-2">
                Worship With Us
              </p>
              <h2 className="text-3xl font-bold text-[#1a4731]">
                Find a Location Near You
              </h2>
            </div>
            <Link
              href="/locations"
              className="inline-flex items-center gap-1 text-[#1a4731] font-semibold text-sm hover:text-[#52b788] transition-colors shrink-0"
            >
              All locations <ChevronRight size={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map(({ name, schedule }) => (
              <div
                key={name}
                className="flex items-start gap-3 p-5 rounded-xl border border-gray-100 hover:border-[#52b788]/40 hover:shadow-sm transition-all"
              >
                <MapPin size={18} className="text-[#52b788] mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-[#1a4731] text-sm">{name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{schedule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA banner */}
      <section className="py-20 bg-[#52b788]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Partner With the Great Commission
          </h2>
          <p className="text-white/80 leading-relaxed mb-8">
            Your generosity fuels church planting, the Ergartes Bible
            Institute, and missions to unreached communities across the
            Philippines.
          </p>
          <Link
            href="/give"
            className="inline-flex items-center px-8 py-3 rounded-full bg-[#1a4731] text-white font-semibold hover:bg-[#1a4731] transition-colors"
          >
            Give Today
          </Link>
        </div>
      </section>
    </>
  );
}
