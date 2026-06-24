import { defineArrayMember, defineField, defineType } from "sanity";

/**
 * Singleton powering /locations. Each church is a structured entry (not a
 * freeform body) since the page renders a fixed card layout — address,
 * schedule, contact details, and an embedded map — that editors fill in
 * rather than design themselves. An optional photo per church is supported,
 * but not required, since most churches won't have one.
 */
export const locationsPageType = defineType({
  name: "locationsPage",
  title: "Locations Page",
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
      initialValue: "Worship With Us",
    }),
    defineField({
      name: "heroTitle",
      title: "Hero Title",
      type: "string",
      initialValue: "Find a Location Near You",
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "churches",
      title: "Churches",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "churchEntry",
          fields: [
            defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
            defineField({ name: "address", title: "Address", type: "string", validation: (r) => r.required() }),
            defineField({ name: "schedule", title: "Service Schedule", type: "string", validation: (r) => r.required() }),
            defineField({ name: "phone", title: "Phone", type: "string" }),
            defineField({ name: "email", title: "Email", type: "string" }),
            defineField({ name: "note", title: "Note", type: "string", description: "e.g. \"Main / Flagship Church\" — shown as a small badge." }),
            defineField({
              name: "mapQuery",
              title: "Google Maps Query",
              type: "string",
              description: "Address formatted for a Google Maps embed URL, e.g. 213+Don+Pedro+Subdivision+Kawit+Cavite+Philippines",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "image",
              title: "Photo",
              type: "image",
              options: { hotspot: true },
              description: "Optional — shows a photo of the church if set.",
            }),
          ],
          preview: {
            select: { title: "name", subtitle: "address", media: "image" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Locations Page" };
    },
  },
});
