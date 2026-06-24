import { defineField, defineType } from "sanity";

/**
 * A blog topic (e.g. Pastor's Devotion, Youth). Editors create one of these
 * per topic so new topics can be added in Studio without a code change —
 * used as `post.blogSubCategory` and surfaced as a filter pill on /blogs.
 * No dedicated page/slug, unlike mission/program/project — blogs are only
 * ever browsed via the filtered list, not a per-topic page.
 */
export const blogCategoryType = defineType({
  name: "blogCategory",
  title: "Blog Category",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first in the blog filter. Leave blank to sort alphabetically.",
    }),
  ],
  preview: {
    select: { title: "title" },
  },
});
