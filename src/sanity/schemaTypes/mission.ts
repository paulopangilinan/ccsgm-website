import { defineType } from "sanity";
import { taxonomyFields } from "./taxonomyFields";

/**
 * A church-planting mission (e.g. Surigao, Agusan). Editors create one of
 * these per mission so new missions can be added in Studio without a code
 * change — each gets its own page at /missions/[slug], built entirely from
 * this document's fields, plus any `post` documents whose `subCategory`
 * references it.
 */
export const missionType = defineType({
  name: "mission",
  title: "Mission",
  type: "document",
  fields: taxonomyFields("mission"),
  preview: {
    select: { title: "title", subtitle: "excerpt", media: "heroImage" },
  },
});
