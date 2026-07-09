import { defineField, defineType } from "sanity";

export const contactPageType = defineType({
  name: "contactPage",
  title: "Contact Page",
  type: "document",
  fields: [
    defineField({
      name: "mainOfficeLabel",
      title: "Main Office Label",
      type: "string",
      initialValue: "Main Office",
    }),
    defineField({
      name: "mainOfficeAddress",
      title: "Main Office Address",
      type: "string",
      initialValue: "213 Don Pedro Subdivision, Kaingen, Kawit, Cavite",
    }),
    defineField({
      name: "phone",
      title: "Phone",
      type: "string",
      initialValue: "(046) 472-9443",
    }),
    defineField({
      name: "email",
      title: "Email",
      type: "string",
      initialValue: "ccsgm.kawit@gmail.com",
      validation: (r) => r.email(),
    }),
    defineField({
      name: "officeHours",
      title: "Office Hours",
      type: "string",
      initialValue: "Monday – Friday, 9:00 am – 5:00 pm",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Contact Page" };
    },
  },
});
