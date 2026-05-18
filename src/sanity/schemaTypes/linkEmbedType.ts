import { defineField, defineType } from "sanity";

export const linkEmbedType = defineType({
  name: "linkEmbed",
  title: "Link Embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "URL",
      type: "url",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "displayAs",
      title: "Display as",
      type: "string",
      options: {
        list: [
          { title: "Card (unfurl preview)", value: "card" },
          { title: "Inline link", value: "inline" }
        ],
        layout: "radio"
      },
      initialValue: "card",
      validation: (rule) => rule.required()
    })
  ],
  preview: {
    select: { url: "url", displayAs: "displayAs" },
    prepare({ url, displayAs }) {
      return {
        title: url || "(no URL)",
        subtitle: displayAs === "inline" ? "Inline link" : "Card preview"
      };
    }
  }
});
