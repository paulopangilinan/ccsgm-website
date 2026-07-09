import { defineArrayMember, defineField, defineType } from "sanity";

export const givePageType = defineType({
  name: "givePage",
  title: "Give Page",
  type: "document",
  fields: [
    defineField({
      name: "givingMethods",
      title: "Giving Methods",
      description: "Bank transfers, GCash, and other digital giving options shown under 'How to Give'. The In Person card is always shown first automatically.",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "givingMethod",
          fields: [
            defineField({
              name: "template",
              title: "Card Template",
              type: "string",
              options: {
                list: [
                  { title: "Default", value: "default" },
                  { title: "GCash", value: "gcash" },
                  { title: "BPI", value: "bpi" },
                ],
                layout: "radio",
                direction: "horizontal",
              },
              initialValue: "default",
            }),
            defineField({
              name: "title",
              title: "Title",
              type: "string",
              description: "e.g. BDO, UnionBank, Maya. Not shown on the GCash template.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "accountName",
              title: "Account Name",
              type: "string",
            }),
            defineField({
              name: "accountNumber",
              title: "Account Number / Mobile Number",
              type: "string",
            }),
            defineField({
              name: "bankBranch",
              title: "Bank Branch / User ID",
              type: "string",
              description: "Bank branch for transfers. For GCash, enter the User ID shown on the QR receipt.",
            }),
            defineField({
              name: "notes",
              title: "Additional Notes",
              type: "text",
              rows: 2,
              description: "e.g. 'Transfer fees may apply.' Shown below the QR code.",
            }),
            defineField({
              name: "backgroundColor",
              title: "Card Background Color",
              type: "color",
              description: "Only used for the Default template. GCash template uses its own brand color.",
              options: { disableAlpha: true },
              hidden: ({ parent }) => parent?.template === "gcash" || parent?.template === "bpi",
            }),
            defineField({
              name: "qrCode",
              title: "QR Code",
              type: "image",
              options: { hotspot: false },
              description: "Upload a QR code image for scanning.",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "accountName" },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Give Page" };
    },
  },
});
