import { defineField, defineType } from "sanity";

export const postType = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "News",
          "Events",
          "Testimonies",
          "Readings",
          "Projects",
          "Sunday School",
          "Missions",
          "Programs",
          "Blogs",
        ],
      },
    }),
    defineField({
      name: "subCategory",
      title: "Mission Location",
      type: "string",
      description: "Select the specific mission this post belongs to.",
      options: { list: ["Surigao", "Agusan"] },
      hidden: ({ document }) => document?.category !== "Missions",
    }),
    defineField({
      name: "programSubCategory",
      title: "Program",
      type: "string",
      description: "Select the specific program this post belongs to.",
      options: { list: ["CEF", "Conferences", "One Worship"] },
      hidden: ({ document }) => document?.category !== "Programs",
    }),
    defineField({
      name: "blogSubCategory",
      title: "Blog Topic",
      type: "string",
      description: "Select the specific topic this blog post belongs to.",
      options: { list: ["Pastor's Devotion", "Youth", "Couples", "Music"] },
      hidden: ({ document }) => document?.category !== "Blogs",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "eventDateStart",
      title: "Event Start Date",
      type: "datetime",
      hidden: ({ document }) => document?.category !== "Events",
    }),
    defineField({
      name: "isMultiDay",
      title: "Runs Across Multiple Days",
      type: "boolean",
      description: "Enable to set a separate end date for events that span more than one day.",
      initialValue: false,
      hidden: ({ document }) => document?.category !== "Events",
    }),
    defineField({
      name: "eventDateEnd",
      title: "Event End Date",
      type: "datetime",
      hidden: ({ document }) => document?.category !== "Events" || !document?.isMultiDay,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this post in the Top Stories section on the home page.",
      initialValue: false,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        { type: "block" },
        {
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
        },
        {
          type: "object",
          name: "carousel",
          title: "Image Carousel",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({ name: "caption", title: "Caption", type: "string" }),
                  ],
                },
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
        },
        {
          type: "object",
          name: "gallery",
          title: "Image Gallery",
          fields: [
            defineField({
              name: "images",
              title: "Images",
              type: "array",
              of: [
                {
                  type: "image",
                  options: { hotspot: true },
                  fields: [
                    defineField({ name: "caption", title: "Caption", type: "string" }),
                  ],
                },
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
        },
        {
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
        },
        {
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
        },
        {
          type: "object",
          name: "youtube",
          title: "YouTube Video",
          fields: [
            defineField({ name: "url", title: "YouTube URL", type: "url", description: "Paste the full YouTube video URL (e.g. https://www.youtube.com/watch?v=xxxxx)", validation: (r) => r.required() }),
            defineField({ name: "caption", title: "Caption (optional)", type: "string" }),
          ],
          preview: {
            select: { url: "url", caption: "caption" },
            prepare({ url, caption }) {
              return { title: caption || "YouTube Video", subtitle: url };
            },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "title", media: "mainImage" },
  },
});
