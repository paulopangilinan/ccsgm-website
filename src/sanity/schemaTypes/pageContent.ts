import { defineField, defineType } from "sanity";
import { bodyBlocks } from "./bodyBlocks";

/**
 * A reusable, editable content block for a specific spot on a specific page —
 * e.g. the intro section on /sunday-school, shown above the video playlist.
 * Each instance lives at a fixed document ID (see src/sanity/structure.ts),
 * one per page slot, so it's a singleton there rather than something editors
 * pick from a list — and it's deliberately a separate _type from `post` so it
 * never shows up in the Articles structure or gets queried as an article.
 */
export const pageContentType = defineType({
  name: "pageContent",
  title: "Page Content",
  type: "document",
  fields: [
    defineField({
      name: "internalTitle",
      title: "Internal Title",
      type: "string",
      description: "For your reference in the Studio only — not shown on the site.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "body",
      title: "Content",
      type: "array",
      of: bodyBlocks,
    }),
  ],
  preview: {
    select: { title: "internalTitle" },
  },
});
