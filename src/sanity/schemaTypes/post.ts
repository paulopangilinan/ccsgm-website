import { defineField, defineType } from "sanity";
import { bodyBlocks } from "./bodyBlocks";
import { TagsInput } from "../components/TagsInput";

export const postType = defineType({
  name: "post",
  title: "Blog Post",
  type: "document",
  fields: [
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
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          "News",
          "Events",
          "Testimonies",
          "Readings",
          "Projects",
          "Sunday School",
          "Missions",
          "Programs",
          "Blogs",
        ],
      },
    }),
    defineField({
      name: "subCategory",
      title: "Mission",
      type: "reference",
      to: [{ type: "mission" }],
      description: "Select the specific mission this post belongs to.",
      hidden: ({ document }) => document?.category !== "Missions",
    }),
    defineField({
      name: "programSubCategory",
      title: "Program",
      type: "reference",
      to: [{ type: "program" }],
      description: "Select the specific program this post belongs to.",
      hidden: ({ document }) => document?.category !== "Programs",
    }),
    defineField({
      name: "projectSubCategory",
      title: "Project",
      type: "reference",
      to: [{ type: "project" }],
      description: "Select the specific project this post belongs to.",
      hidden: ({ document }) => document?.category !== "Projects",
    }),
    defineField({
      name: "blogSubCategory",
      title: "Blog Topic",
      type: "reference",
      to: [{ type: "blogCategory" }],
      description: "Select the specific topic this blog post belongs to.",
      hidden: ({ document }) => document?.category !== "Blogs",
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      components: { input: TagsInput },
      description:
        "Optional secondary topics this post relates to, beyond its main category — e.g. a Conference recap that's also about Music. Used to surface it under \"Related Articles\" on other posts.",
    }),
    defineField({
      name: "excerpt",
      title: "Excerpt",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "publishedAt",
      title: "Published At",
      type: "datetime",
    }),
    defineField({
      name: "eventDateStart",
      title: "Event Start Date",
      type: "datetime",
      hidden: ({ document }) => document?.category !== "Events",
    }),
    defineField({
      name: "isMultiDay",
      title: "Runs Across Multiple Days",
      type: "boolean",
      description: "Enable to set a separate end date for events that span more than one day.",
      initialValue: false,
      hidden: ({ document }) => document?.category !== "Events",
    }),
    defineField({
      name: "eventDateEnd",
      title: "Event End Date",
      type: "datetime",
      hidden: ({ document }) => document?.category !== "Events" || !document?.isMultiDay,
    }),
    defineField({
      name: "featured",
      title: "Featured",
      type: "boolean",
      description: "Show this post in the Top Stories section on the home page.",
      initialValue: false,
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "string",
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: bodyBlocks,
    }),

    // --- Set automatically by the "Share Your Story" public submission
    // form — not meant to be filled in manually when creating a post.
    defineField({
      name: "isVisitorSubmission",
      title: "Visitor Submission",
      type: "boolean",
      description: "Set automatically when this draft came in through the \"Share Your Story\" page.",
      initialValue: false,
      readOnly: true,
    }),
    defineField({
      name: "submissionStoryType",
      title: "Story Type (as submitted)",
      type: "string",
      options: {
        list: [
          "Testimony",
          "Devotion",
          "Praise Report",
          "Prayer Request",
          "Salvation Story",
          "Missions Update",
          "Other",
        ],
      },
      hidden: ({ document }) => !document?.isVisitorSubmission,
      readOnly: true,
    }),
    defineField({
      name: "submitterName",
      title: "Submitted By",
      type: "string",
      hidden: ({ document }) => !document?.isVisitorSubmission,
      readOnly: true,
    }),
    defineField({
      name: "submitterEmail",
      title: "Submitter Email",
      type: "string",
      hidden: ({ document }) => !document?.isVisitorSubmission,
      readOnly: true,
    }),
    defineField({
      name: "submittedVideoUrl",
      title: "Submitted Video Link",
      type: "url",
      description: "Also added to the Body above — as a YouTube embed if it's a YouTube link, otherwise a plain link.",
      hidden: ({ document }) => !document?.isVisitorSubmission,
      readOnly: true,
    }),
  ],
  preview: {
    select: { title: "title", media: "mainImage", isVisitorSubmission: "isVisitorSubmission", storyType: "submissionStoryType" },
    prepare({ title, media, isVisitorSubmission, storyType }) {
      return {
        title: isVisitorSubmission ? `📬 ${title}` : title,
        subtitle: isVisitorSubmission ? `Visitor submission — ${storyType ?? "Story"}` : undefined,
        media,
      };
    },
  },
});
