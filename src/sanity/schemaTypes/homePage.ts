import { defineArrayMember, defineField, defineType } from "sanity";

// Curated set of icons admins can assign to a highlight card — names match
// lucide-react component exports exactly, so the frontend lookup is a
// straight string-keyed map (see src/lib/highlightIcons.ts).
const HIGHLIGHT_ICON_OPTIONS = [
  "BookOpen",
  "Users",
  "Globe",
  "Heart",
  "Star",
  "GraduationCap",
  "Compass",
  "HandHeart",
  "Church",
  "Sparkles",
];

/**
 * Singleton for homepage content. Mirrors the page's existing sections and
 * layout exactly — every field here just makes already-designed copy
 * editable, it doesn't add new sections or change the layout.
 */
export const homePageType = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  groups: [
    { name: "carousel", title: "Carousel" },
    { name: "highlights", title: "Highlights" },
    { name: "story", title: "Our Story" },
    { name: "locations", title: "Locations" },
    { name: "cta", title: "Give CTA" },
  ],
  fields: [
    // --- Carousel hero slide ---
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
      description: "Shown on the homepage carousel's first slide.",
      group: "carousel",
    }),
    defineField({
      name: "heroEyebrow",
      title: "Eyebrow",
      type: "string",
      group: "carousel",
    }),
    defineField({
      name: "heroTitle",
      title: "Title",
      type: "text",
      rows: 2,
      description: "Each line becomes its own line on the page.",
      group: "carousel",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 3,
      group: "carousel",
    }),
    defineField({
      name: "heroPrimaryButton",
      title: "Primary Button",
      type: "object",
      group: "carousel",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "url", title: "Link", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "heroSecondaryButton",
      title: "Secondary Button",
      type: "object",
      group: "carousel",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "url", title: "Link", type: "string", validation: (r) => r.required() }),
      ],
    }),

    // --- Carousel article selection ---
    defineField({
      name: "featuredMode",
      title: "Carousel Articles",
      type: "string",
      group: "carousel",
      options: {
        layout: "radio",
        list: [
          { title: "Automatic — show Featured articles (padded with recent ones to 8)", value: "auto" },
          { title: "Manual — I'll pick the articles myself", value: "manual" },
        ],
      },
      initialValue: "auto",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "featuredPosts",
      title: "Selected Articles",
      type: "array",
      group: "carousel",
      of: [defineArrayMember({ type: "reference", to: [{ type: "post" }] })],
      description: "Shown on the carousel in this order. Only used when \"Carousel Articles\" above is set to Manual.",
      hidden: ({ document }) => document?.featuredMode !== "manual",
    }),

    // --- Highlights ("What We're About") ---
    defineField({
      name: "highlightsTitle",
      title: "Title",
      type: "string",
      group: "highlights",
    }),
    defineField({
      name: "highlightsSubtitle",
      title: "Subtitle",
      type: "text",
      rows: 2,
      group: "highlights",
    }),
    defineField({
      name: "highlights",
      title: "Highlight Cards",
      type: "array",
      group: "highlights",
      of: [
        defineArrayMember({
          type: "object",
          name: "highlightCard",
          fields: [
            defineField({
              name: "icon",
              title: "Icon",
              type: "string",
              options: { list: HIGHLIGHT_ICON_OPTIONS },
              validation: (r) => r.required(),
            }),
            defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3, validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: "title", subtitle: "icon" },
          },
        }),
      ],
    }),

    // --- "Our Story" teaser ---
    defineField({
      name: "storyEyebrow",
      title: "Eyebrow",
      type: "string",
      group: "story",
    }),
    defineField({
      name: "storyTitle",
      title: "Title",
      type: "string",
      group: "story",
    }),
    defineField({
      name: "storyParagraphs",
      title: "Paragraphs",
      type: "array",
      group: "story",
      of: [defineArrayMember({ type: "text", rows: 3 })],
    }),
    defineField({
      name: "storyLink",
      title: "Link",
      type: "object",
      group: "story",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "url", title: "Link", type: "string", validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: "stats",
      title: "Stats",
      type: "array",
      group: "story",
      of: [
        defineArrayMember({
          type: "object",
          name: "stat",
          fields: [
            defineField({ name: "value", title: "Value", type: "string", validation: (r) => r.required() }),
            defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
          ],
          preview: {
            select: { title: "value", subtitle: "label" },
          },
        }),
      ],
    }),

    // --- Locations teaser ---
    defineField({
      name: "locationsEyebrow",
      title: "Eyebrow",
      type: "string",
      group: "locations",
    }),
    defineField({
      name: "locationsTitle",
      title: "Title",
      type: "string",
      group: "locations",
    }),
    defineField({
      name: "locationsLinkLabel",
      title: "\"All Locations\" Link Label",
      type: "string",
      group: "locations",
      description: "The church list itself is managed under Locations Page, not here.",
    }),

    // --- Give CTA banner ---
    defineField({
      name: "ctaTitle",
      title: "Title",
      type: "string",
      group: "cta",
    }),
    defineField({
      name: "ctaBody",
      title: "Body",
      type: "text",
      rows: 3,
      group: "cta",
    }),
    defineField({
      name: "ctaButton",
      title: "Button",
      type: "object",
      group: "cta",
      fields: [
        defineField({ name: "label", title: "Label", type: "string", validation: (r) => r.required() }),
        defineField({ name: "url", title: "Link", type: "string", validation: (r) => r.required() }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home Page" };
    },
  },
});
