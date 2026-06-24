import { defineField, defineType } from "sanity";

/**
 * Site-wide settings singleton. Currently just the contact form's delivery
 * address, kept here (rather than hardcoded in the API route) so it can be
 * changed without a deploy.
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "contactEmail",
      title: "Contact Form Recipient Email",
      type: "string",
      description: "Where messages submitted through the Contact page are sent.",
      validation: (r) => r.required().email(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
