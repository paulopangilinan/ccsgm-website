import { defineField, defineType } from "sanity";

export const sermonSettingsType = defineType({
  name: "sermonSettings",
  title: "Sermon Settings",
  type: "document",
  fields: [
    defineField({
      name: "seriesTitle",
      title: "Current Series Title",
      type: "string",
      description: 'e.g. "Book of Samuel" — shown above the latest message.',
    }),
    defineField({
      name: "playlistId",
      title: "Current Series Playlist ID",
      type: "string",
      description:
        "The YouTube playlist ID for this quarter's sermon series — the value after list= in the playlist URL. Upload new sermons to this playlist and they'll appear here automatically.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "otherPlaylists",
      title: "Other Playlists",
      type: "array",
      description:
        "Up to 4 other playlists to feature below the current series (e.g. past series, topical studies).",
      of: [
        {
          type: "object",
          name: "playlist",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "playlistId",
              title: "Playlist ID",
              type: "string",
              description: "The value after list= in the playlist URL.",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "playlistId" },
          },
        },
      ],
      validation: (r) => r.max(4).error("Only 4 other playlists can be displayed on the page."),
    }),
  ],
  preview: {
    select: { seriesTitle: "seriesTitle" },
    prepare({ seriesTitle }: { seriesTitle?: string }) {
      return { title: "Sermon Settings", subtitle: seriesTitle || "No current series set" };
    },
  },
});
