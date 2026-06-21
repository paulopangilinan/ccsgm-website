import type { Template } from "sanity";

/**
 * Named "Create new" options so content editors pick a category directly
 * (e.g. "Event", "Program — CEF Article") instead of creating a blank
 * Blog Post and choosing category/sub-category from dropdowns.
 */
export const templates = (prev: Template[]): Template[] => [
  ...prev.filter((t) => t.id !== "post" && t.id !== "sermonSettings" && t.id !== "pageContent"),
  {
    id: "post-news",
    title: "News",
    schemaType: "post",
    value: { category: "News" },
  },
  {
    id: "post-events",
    title: "Event",
    schemaType: "post",
    value: { category: "Events" },
  },
  {
    id: "post-testimonies",
    title: "Testimony",
    schemaType: "post",
    value: { category: "Testimonies" },
  },
  {
    id: "post-readings",
    title: "Reading",
    schemaType: "post",
    value: { category: "Readings" },
  },
  {
    id: "post-projects",
    title: "Project",
    schemaType: "post",
    value: { category: "Projects" },
  },
  {
    id: "post-sunday-school",
    title: "Sunday School",
    schemaType: "post",
    value: { category: "Sunday School" },
  },
  {
    id: "post-blogs-pastors-devotion",
    title: "Blog — Pastor's Devotion",
    schemaType: "post",
    value: { category: "Blogs", blogSubCategory: "Pastor's Devotion" },
  },
  {
    id: "post-blogs-youth",
    title: "Blog — Youth",
    schemaType: "post",
    value: { category: "Blogs", blogSubCategory: "Youth" },
  },
  {
    id: "post-blogs-couples",
    title: "Blog — Couples",
    schemaType: "post",
    value: { category: "Blogs", blogSubCategory: "Couples" },
  },
  {
    id: "post-blogs-music",
    title: "Blog — Music",
    schemaType: "post",
    value: { category: "Blogs", blogSubCategory: "Music" },
  },
  {
    id: "post-missions",
    title: "Mission Article",
    schemaType: "post",
    value: { category: "Missions" },
  },
  {
    id: "post-programs",
    title: "Program Article",
    schemaType: "post",
    value: { category: "Programs" },
  },
];
