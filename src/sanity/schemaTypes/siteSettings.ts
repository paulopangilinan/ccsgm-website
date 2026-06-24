import { defineField, defineType } from "sanity";

/**
 * Site-wide settings singleton. Currently just the contact form's delivery
 * address(es), kept here (rather than hardcoded in the API route) so it can
 * be changed without a deploy.
 */
export const siteSettingsType = defineType({
  name: "siteSettings",
  title: "Site Settings",
  type: "document",
  fields: [
    defineField({
      name: "contactEmails",
      title: "Contact Form Recipient Emails",
      type: "array",
      of: [{ type: "string" }],
      description:
        "Where messages submitted through the Contact page are sent — add as many as you like, every address listed receives a copy.",
      validation: (r) => r.unique().min(1).error("Add at least one recipient email."),
    }),
    defineField({
      name: "contactEmail",
      title: "Contact Form Recipient Email (legacy)",
      type: "string",
      description:
        "Deprecated — use \"Contact Form Recipient Emails\" above instead. Kept only so older data isn't lost; ignored once the list above has an entry.",
      validation: (r) => r.email(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Site Settings" };
    },
  },
});
