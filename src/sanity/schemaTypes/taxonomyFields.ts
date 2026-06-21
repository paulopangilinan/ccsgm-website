import { defineField } from "sanity";
import { bodyBlocks } from "./bodyBlocks";
import { showInNavField } from "./navToggle";

/**
 * Shared field set for mission/program/project — each is a "sub-topic" an
 * admin can add freely (e.g. Surigao under Missions, CEF under Programs),
 * with its own page at /{type}/[slug] built from these fields, plus any
 * `post` documents that reference it.
 */
export function taxonomyFields(typeName: string) {
  return [
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
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label shown above the title in the hero section.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
      description: "Short summary used as the hero subtitle and on the index page.",
    }),
    defineField({
      name: "heroImage",
      title: "Hero Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Content",
      type: "array",
      of: bodyBlocks,
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first on the index page. Leave blank to sort alphabetically.",
    }),
    showInNavField(typeName),
  ];
}
