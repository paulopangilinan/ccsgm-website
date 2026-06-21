import { defineType } from "sanity";
import { taxonomyFields } from "./taxonomyFields";

/**
 * A program (e.g. CEF, Summits & Conferences, One Worship). Editors create
 * one of these per program so new programs can be added in Studio without a
 * code change — each gets its own page at /programs/[slug], built entirely
 * from this document's fields, plus any `post` documents whose
 * `programSubCategory` references it.
 */
export const programType = defineType({
  name: "program",
  title: "Program",
  type: "document",
  fields: taxonomyFields("program"),
  preview: {
    select: { title: "title", subtitle: "excerpt", media: "heroImage" },
  },
});
