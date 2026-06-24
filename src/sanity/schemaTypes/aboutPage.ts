import { defineArrayMember, defineField, defineType } from "sanity";
import { infoSectionBlocks } from "./infoSectionBlocks";

/**
 * Singleton powering /about. Unlike `pageContent` (one freeform rich-text
 * block), this page's sections — timeline, values, leadership — each have
 * their own fixed visual layout (a timeline list, a card grid, etc.), so the
 * schema mirrors that with structured fields/arrays of objects rather than
 * one generic body. Lets editors add/remove/reorder entries (e.g. a new
 * leader or timeline event) without changing the page's layout in code.
 */
export const aboutPageType = defineType({
  name: "aboutPage",
  title: "About Page",
  type: "document",
  fields: [
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Shown in the hero section at the top of the page.",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Hero Eyebrow",
      type: "string",
      initialValue: "Who We Are",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      initialValue: "About CCSGM",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "missionContent",
      title: "Our Mission",
      type: "array",
      of: infoSectionBlocks,
      description: "Displayed side by side with \"Our Family of Churches\" below.",
    }),
    defineField({
      name: "timeline",
      title: "Our History",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "timelineEntry",
          fields: [
            defineField({ name: "year", title: "Year", type: "string", validation: (r) => r.required() }),
            defineField({ name: "event", title: "Event", type: "text", rows: 2, validation: (r) => r.required() }),
            defineField({
              name: "caption",
              title: "Sub-caption",
              type: "string",
              description: "Optional extra detail shown when hovering this event on the timeline.",
            }),
            defineField({
              name: "photo",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              description: "Optional — shown when hovering this event on the timeline.",
            }),
          ],
          preview: {
            select: { title: "year", subtitle: "event", media: "photo" },
          },
        }),
      ],
    }),
    defineField({
      name: "familyOfChurchesContent",
      title: "Our Family of Churches",
      type: "array",
      of: infoSectionBlocks,
      description: "Add a Button block here for links like \"Statement of Faith\".",
    }),
    defineField({
      name: "values",
      title: "Our Shared Values",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "valueEntry",
          fields: [
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({
              name: "body",
              title: "Body",
              type: "text",
              rows: 6,
              description: "Verse references in parentheses, e.g. (Romans 11:36), are automatically linked.",
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: "title" },
          },
        }),
      ],
    }),
    defineField({
      name: "leaders",
      title: "Leadership",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "leaderEntry",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "role", title: "Role", type: "string", validation: (r) => r.required() }),
            defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
            defineField({
              name: "photo",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              description: "Optional — shows initials in a circle if left blank.",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "role", media: "photo" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "About Page" };
    },
  },
});
