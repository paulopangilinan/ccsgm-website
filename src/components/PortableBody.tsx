import Image from "next/image";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import ArticleCarousel from "@/components/ArticleCarousel";
import PdfBlock from "@/components/PdfBlock";
import GalleryLightbox from "@/components/GalleryLightbox";
import PlaylistBlock from "@/components/PlaylistBlock";
import { getPlaylistVideos, type YouTubeVideo } from "@/lib/youtube";
import { getYouTubeId } from "@/lib/youtubeId";

type SanityImage = { _type: "image"; asset: { _ref: string } };

/**
 * Renders a Sanity portable-text body with every shared block type (image,
 * gallery, carousel, PDF, video file, YouTube video/playlist) — used by the
 * blog post detail page and by editable `pageContent` sections on other
 * pages, so both stay visually/behaviourally consistent without duplicating
 * ~150 lines of renderer code.
 */
export default async function PortableBody({
  body,
  className = "prose prose-green max-w-none prose-headings:text-[#1a4731] prose-a:text-[#52b788]",
}: {
  body: unknown[] | undefined;
  className?: string;
}) {
  if (!body || body.length === 0) return null;

  type PlaylistBlockValue = { _type: string; playlistId?: string; maxVideos?: number };
  const playlistBlocks = (body as PlaylistBlockValue[]).filter(
    (b) => b._type === "youtubePlaylist" && b.playlistId
  );
  const playlistMap: Record<string, YouTubeVideo[]> = {};
  await Promise.all(
    playlistBlocks.map(async (b) => {
      playlistMap[b.playlistId!] = await getPlaylistVideos(b.playlistId!, b.maxVideos ?? 6);
    })
  );

  const components: PortableTextComponents = {
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
      youtubePlaylist: ({ value }: { value: { playlistId: string; maxVideos?: number } }) => (
        <PlaylistBlock videos={playlistMap[value.playlistId] ?? []} playlistId={value.playlistId} />
      ),
      pdfEmbed: ({ value }: { value: { title: string; url: string; description?: string } }) => (
        <PdfBlock title={value.title} url={value.url} description={value.description} />
      ),
      videoFile: ({ value }: { value: { url: string; caption?: string } }) => (
        <div className="my-8">
          <div className="rounded-2xl overflow-hidden bg-black">
            <video controls src={value.url} className="w-full max-h-[500px]" />
          </div>
          {value.caption && (
            <p className="text-center text-xs text-gray-400 mt-2">{value.caption}</p>
          )}
        </div>
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

  return (
    <div className={className}>
      <PortableText value={body} components={components} />
    </div>
  );
}
