import { defineArrayMember, defineField } from "sanity";

/**
 * Shared sub-section types for a simple two-block info area (e.g. About
 * page's Mission / Family of Churches) — lets editors mix paragraphs with
 * an occasional CTA button (e.g. "Statement of Faith") without a dedicated
 * field for each, and keeps both blocks on the same schema shape.
 */
export const infoSectionBlocks = [
  defineArrayMember({
    type: "object",
    name: "sectionParagraph",
    title: "Paragraph",
    fields: [
      defineField({ name: "text", title: "Text", type: "text", rows: 4, validation: (r) => r.required() }),
    ],
    preview: {
      select: { title: "text" },
    },
  }),
  defineArrayMember({
    type: "object",
    name: "sectionButton",
    title: "Button",
    fields: [
      defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
      defineField({ name: "url", title: "URL", type: "url", validation: (r) => r.required() }),
    ],
    preview: {
      select: { title: "label", subtitle: "url" },
    },
  }),
];
