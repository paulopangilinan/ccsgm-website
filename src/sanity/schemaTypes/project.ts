import { defineType } from "sanity";
import { taxonomyFields } from "./taxonomyFields";

/**
 * A project (e.g. Gideon 300 Building Project). Editors create one of these
 * per project so new projects can be added in Studio without a code change —
 * each gets its own page at /projects/[slug], built entirely from this
 * document's fields, plus any `post` documents whose `projectSubCategory`
 * references it.
 */
export const projectType = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: taxonomyFields("project"),
  preview: {
    select: { title: "title", subtitle: "excerpt", media: "heroImage" },
  },
});
