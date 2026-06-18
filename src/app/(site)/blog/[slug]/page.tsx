import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Calendar, ChevronLeft, User } from "lucide-react";
import { formatEventDate } from "@/lib/formatEventDate";
import { client } from "@/sanity/client";
import { urlFor } from "@/sanity/lib/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import ArticleCarousel from "@/components/ArticleCarousel";
import { CATEGORY_COLOURS, displayCategory } from "@/components/PostGrid";
import PdfBlock from "@/components/PdfBlock";
import GalleryLightbox from "@/components/GalleryLightbox";
import PlaylistBlock from "@/components/PlaylistBlock";
import { getPlaylistVideos, type YouTubeVideo } from "@/lib/youtube";

export const revalidate = 60;

type SanityImage = { _type: "image"; asset: { _ref: string } };

type Post = {
  _id: string;
  title: string;
  slug: { current: string };
  category: string;
  subCategory?: string;
  programSubCategory?: string;
  blogSubCategory?: string;
  excerpt: string;
  publishedAt: string;
  eventDateStart?: string;
  eventDateEnd?: string;
  author: string;
  mainImage?: SanityImage;
  body: unknown[];
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    return await client.fetch<Post>(
      `*[_type == "post" && slug.current == $slug][0] {
        _id, title, slug, category, subCategory, programSubCategory, blogSubCategory, excerpt, publishedAt, eventDateStart, eventDateEnd, author, mainImage, body
      }`,
      { slug }
    );
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post Not Found" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function resolveBackLink(
  category: string,
  subCategory?: string,
  programSubCategory?: string,
  fromHome?: boolean,
): { href: string; label: string } {
  if (fromHome) return { href: "/", label: "Back to Home" };
  if (category === "Missions") {
    if (subCategory === "Surigao") return { href: "/missions/surigao", label: "Back to Surigao Missions" };
    if (subCategory === "Agusan")  return { href: "/missions/agusan",  label: "Back to Agusan Missions" };
    return { href: "/missions", label: "Back to Missions" };
  }
  if (category === "Programs") {
    if (programSubCategory === "CEF") return { href: "/programs/cef", label: "Back to Church Extension Fellowship" };
    if (programSubCategory === "Conferences") return { href: "/programs/conferences", label: "Back to Summits & Conferences" };
    if (programSubCategory === "One Worship") return { href: "/programs/one-worship", label: "Back to One Worship" };
    return { href: "/programs", label: "Back to Programs" };
  }
  if (category === "Blogs") {
    return { href: "/blogs", label: "Back to Blogs" };
  }
  const map: Record<string, { href: string; label: string }> = {
    News:           { href: "/news",          label: "Back to News & Events" },
    Events:         { href: "/news",          label: "Back to News & Events" },
    Testimonies:    { href: "/testimonies",   label: "Back to Testimonies" },
    Readings:       { href: "/readings",      label: "Back to Readings" },
    "Sunday School":{ href: "/sunday-school", label: "Back to Sunday School" },
  };
  return map[category] ?? { href: "/blog", label: "Back to Articles" };
}

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

const portableTextComponents: PortableTextComponents = {
  types: {
    youtube: ({ value }: { value: { url: string; caption?: string } }) => {
      const id = getYouTubeId(value.url);
      if (!id) return null;
      return (
        <div className="my-8">
          <div className="aspect-video rounded-2xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${id}`}
              title={value.caption || "YouTube video"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {value.caption && (
            <p className="text-center text-xs text-gray-400 mt-2">{value.caption}</p>
          )}
        </div>
      );
    },
    pdfEmbed: ({ value }: { value: { title: string; url: string; description?: string } }) => (
      <PdfBlock title={value.title} url={value.url} description={value.description} />
    ),
    gallery: ({ value }: { value: { images: Array<SanityImage & { caption?: string }> } }) => {
      const images = (value.images ?? []).map((img) =>
        urlFor(img).width(1200).fit("max").auto("format").url()
      );
      if (images.length === 0) return null;
      return <GalleryLightbox images={images} />;
    },
    carousel: ({ value }: { value: { images: Array<SanityImage & { caption?: string }> } }) => {
      const images = (value.images ?? []).map((img) => ({
        url: urlFor(img).width(900).fit("max").auto("format").url(),
        caption: img.caption,
      }));
      if (images.length === 0) return null;
      return <ArticleCarousel images={images} />;
    },
    image: ({ value }: { value: SanityImage & { caption?: string } }) => (
      <figure className="my-8">
        <div className="rounded-2xl overflow-hidden">
          <Image
            src={urlFor(value).width(900).fit("max").auto("format").url()}
            alt={value.caption ?? ""}
            width={900}
            height={600}
            className="w-full h-auto object-cover"
          />
        </div>
        {value.caption && (
          <figcaption className="text-center text-xs text-gray-400 mt-2">
            {value.caption}
          </figcaption>
        )}
      </figure>
    ),
  },
};

export default async function BlogPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const [{ slug }, { from }] = await Promise.all([params, searchParams]);
  const post = await getPost(slug);

  if (!post) notFound();

  const mainImageUrl = post.mainImage
    ? urlFor(post.mainImage).width(1200).fit("max").auto("format").url()
    : null;

  const backLink = resolveBackLink(post.category, post.subCategory, post.programSubCategory, from === "home");

  // Pre-fetch any YouTube Playlist blocks in the body
  type PlaylistBlock = { _type: string; playlistId?: string; maxVideos?: number };
  const playlistBlocks = ((post.body ?? []) as PlaylistBlock[]).filter(
    (b) => b._type === "youtubePlaylist" && b.playlistId
  );
  const playlistMap: Record<string, YouTubeVideo[]> = {};
  await Promise.all(
    playlistBlocks.map(async (b) => {
      playlistMap[b.playlistId!] = await getPlaylistVideos(b.playlistId!, b.maxVideos ?? 6);
    })
  );

  function buildComponents(): PortableTextComponents {
    return {
      ...portableTextComponents,
      types: {
        ...portableTextComponents.types,
        pdfEmbed: ({ value }: { value: { title: string; url: string; description?: string } }) => (
          <PdfBlock title={value.title} url={value.url} description={value.description} />
        ),
        gallery: ({ value }: { value: { images: Array<SanityImage & { caption?: string }> } }) => {
          const images = (value.images ?? []).map((img) =>
            urlFor(img).width(1200).fit("max").auto("format").url()
          );
          if (images.length === 0) return null;
          return <GalleryLightbox images={images} />;
        },
        youtubePlaylist: ({ value }: { value: { playlistId: string; maxVideos?: number } }) => (
          <PlaylistBlock videos={playlistMap[value.playlistId] ?? []} playlistId={value.playlistId} />
        ),
      },
    };
  }

  const components = buildComponents();

  return (
    <>
      {/* Hero */}
      <section className="bg-[#1a4731] text-white py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backLink.href}
            className="inline-flex items-center gap-1 text-[#52b788] text-sm font-medium mb-6 hover:underline"
          >
            <ChevronLeft size={15} /> {backLink.label}
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-5">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-gray-400 text-sm">
            {post.author && (
              <span className="flex items-center gap-1.5">
                <User size={13} />
                {post.author}
              </span>
            )}
            {post.category === "Events" && post.eventDateStart ? (
              <span className="flex items-center gap-1.5 font-semibold text-indigo-300">
                <Calendar size={13} />
                {formatEventDate(post.eventDateStart, post.eventDateEnd)}
              </span>
            ) : post.publishedAt ? (
              <span className="flex items-center gap-1.5">
                <Calendar size={13} />
                {formatDate(post.publishedAt)}
              </span>
            ) : null}
            {post.category && (
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLOURS[displayCategory(post)] ?? "bg-gray-100 text-gray-600"}`}
              >
                {displayCategory(post)}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Main Image */}
      {mainImageUrl && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
          <div className="relative w-full rounded-2xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
            <Image
              src={mainImageUrl}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Body */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {post.excerpt && (
            <p className="text-lg text-gray-500 leading-relaxed mb-10 border-l-4 border-[#52b788] pl-4 italic">
              {post.excerpt}
            </p>
          )}
          {post.body && post.body.length > 0 ? (
            <div className="prose prose-green max-w-none prose-headings:text-[#1a4731] prose-a:text-[#52b788]">
              <PortableText
                value={post.body}
                components={components}
              />
            </div>
          ) : (
            <p className="text-gray-400 italic">No content yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
