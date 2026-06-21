import { defineArrayMember, defineField } from "sanity";

/**
 * The rich-content block types shared by anything that needs an "article-like"
 * body — currently `post` and `pageContent`. Kept in one place so adding a new
 * embed type (or tweaking an existing one) doesn't require touching multiple
 * schemas in lockstep.
 */
export const bodyBlocks = [
  defineArrayMember({ type: "block" }),
  defineArrayMember({
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "caption",
        title: "Caption",
        type: "string",
        description: "Optional caption displayed below the image.",
      }),
    ],
  }),
  defineArrayMember({
    type: "object",
    name: "carousel",
    title: "Image Carousel",
    fields: [
      defineField({
        name: "images",
        title: "Images",
        type: "array",
        of: [
          defineArrayMember({
            type: "image",
            options: { hotspot: true },
            fields: [defineField({ name: "caption", title: "Caption", type: "string" })],
          }),
        ],
        validation: (r) => r.min(2).error("A carousel needs at least 2 images."),
      }),
    ],
    preview: {
      select: { images: "images" },
      prepare({ images }: { images?: unknown[] }) {
        return { title: "Image Carousel", subtitle: `${images?.length ?? 0} images` };
      },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "gallery",
    title: "Image Gallery",
    fields: [
      defineField({
        name: "images",
        title: "Images",
        type: "array",
        of: [
          defineArrayMember({
            type: "image",
            options: { hotspot: true },
            fields: [defineField({ name: "caption", title: "Caption", type: "string" })],
          }),
        ],
        validation: (r) => r.min(1).error("Add at least one image."),
      }),
    ],
    preview: {
      select: { images: "images" },
      prepare({ images }: { images?: unknown[] }) {
        return { title: "Image Gallery", subtitle: `${images?.length ?? 0} images` };
      },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "pdfEmbed",
    title: "PDF / Document",
    fields: [
      defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
      defineField({ name: "url", title: "File URL", type: "url", description: "Google Drive share link or direct PDF URL.", validation: (r) => r.required() }),
      defineField({ name: "description", title: "Description (optional)", type: "string" }),
    ],
    preview: {
      select: { title: "title", url: "url" },
      prepare({ title, url }: { title?: string; url?: string }) {
        return { title: title || "PDF Document", subtitle: url };
      },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "videoFile",
    title: "Video File",
    fields: [
      defineField({
        name: "url",
        title: "Video URL",
        type: "url",
        description: "Direct link to a hosted video file (e.g. .mp4). Not for YouTube — use the YouTube Video block for that.",
        validation: (r) => r.required(),
      }),
      defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
    ],
    preview: {
      select: { url: "url", caption: "caption" },
      prepare({ url, caption }: { url?: string; caption?: string }) {
        return { title: caption || "Video File", subtitle: url };
      },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "youtubePlaylist",
    title: "YouTube Playlist",
    fields: [
      defineField({ name: "playlistId", title: "Playlist ID", type: "string", description: "The YouTube playlist ID — the value after list= in the playlist URL.", validation: (r) => r.required() }),
      defineField({ name: "maxVideos", title: "Number of Videos to Display", type: "number", description: "How many videos to show on the page (1–12).", initialValue: 6, validation: (r) => r.min(1).max(12) }),
    ],
    preview: {
      select: { playlistId: "playlistId", maxVideos: "maxVideos" },
      prepare({ playlistId, maxVideos }: { playlistId?: string; maxVideos?: number }) {
        return { title: "YouTube Playlist", subtitle: `${maxVideos ?? 6} videos · ${playlistId ?? "no ID set"}` };
      },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "youtube",
    title: "YouTube Video",
    fields: [
      defineField({ name: "url", title: "YouTube URL", type: "url", description: "Paste the full YouTube video URL (e.g. https://www.youtube.com/watch?v=xxxxx)", validation: (r) => r.required() }),
      defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
    ],
    preview: {
      select: { url: "url", caption: "caption" },
      prepare({ url, caption }: { url?: string; caption?: string }) {
        return { title: caption || "YouTube Video", subtitle: url };
      },
    },
  }),
];
