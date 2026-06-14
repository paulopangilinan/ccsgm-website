import type { Metadata } from "next";
import { PlayCircle, ExternalLink } from "lucide-react";
import { getChannelVideos, type YouTubeVideo } from "@/lib/youtube";
import HeroSection from "@/components/HeroSection";

export const metadata: Metadata = {
  title: "Sermons",
  description: "Watch and listen to sermons from CCSGM pastors.",
};

export const revalidate = 3600;

const FALLBACK_VIDEOS: YouTubeVideo[] = [
  {
    id: "dQw4w9WgXcQ",
    title: "The Great Commission — Our Calling",
    description: "Rev. Dr. Jeffrey T. Jo · Matthew 28",
    publishedAt: "2025-05-25",
    thumbnail: "",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Grace Sufficient — 2 Corinthians 12",
    description: "Ptr. Rey Lacbayo · 2 Corinthians",
    publishedAt: "2025-05-18",
    thumbnail: "",
  },
  {
    id: "dQw4w9WgXcQ",
    title: "Rooted in the Gospel",
    description: "Rev. Dr. Jeffrey T. Jo · Colossians",
    publishedAt: "2025-05-11",
    thumbnail: "",
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function SermonsPage() {
  const liveVideos = await getChannelVideos(7);
  const videos = liveVideos.length > 0 ? liveVideos : FALLBACK_VIDEOS;
  const [featured, ...rest] = videos;

  return (
    <>
      <HeroSection
        eyebrow="Preaching"
        title="Sermons & Messages"
        subtitle="Listen to gospel-centred preaching from CCSGM pastors. New messages posted each week."
        imageName="sermons"
      />

      {/* Featured sermon */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl font-bold text-[#1a4731] mb-6">
            Latest Message
          </h2>
          <div className="rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <div className="aspect-video w-full">
              <iframe
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${featured.id}`}
                title={featured.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-[#1a4731] mb-1">
                {featured.title}
              </h3>
              <p className="text-gray-400 text-sm">
                {featured.description
                  ? featured.description
                  : formatDate(featured.publishedAt)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent sermons grid */}
      {rest.length > 0 && (
        <section className="py-10 pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-bold text-[#1a4731] mb-6">
              Recent Messages
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((v) => (
                <div
                  key={v.id + v.publishedAt}
                  className="rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <div className="aspect-video">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${v.id}`}
                      title={v.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-[#1a4731] text-sm mb-1 line-clamp-2">
                      {v.title}
                    </h3>
                    <p className="text-gray-400 text-xs">
                      {formatDate(v.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* YouTube CTA */}
      <section className="py-16 bg-[#f0fdf4]">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 mx-auto mb-4">
            <PlayCircle size={22} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-[#1a4731] mb-3">
            Full Sermon Archive on YouTube
          </h2>
          <p className="text-gray-500 mb-6">
            Browse our complete library of messages, Sunday School recordings,
            and conference talks on our YouTube channel.
          </p>
          <a
            href="https://www.youtube.com/@ccsgmkawit"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors"
          >
            Visit YouTube Channel <ExternalLink size={15} />
          </a>
        </div>
      </section>
    </>
  );
}
