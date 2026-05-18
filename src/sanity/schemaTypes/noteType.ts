import { defineField, defineType } from "sanity";

export const noteType = defineType({
  name: "note",
  title: "Note",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({
      name: "kind",
      title: "Kind",
      type: "string",
      options: {
        list: [
          { title: "Text", value: "text" },
          { title: "Link", value: "link" }
        ],
        layout: "radio"
      },
      initialValue: "text",
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [{ type: "block" }, { type: "linkEmbed" }, { type: "youtubeEmbed" }],
      validation: (rule) => rule.required()
    }),
    defineField({ name: "sourceUrl", title: "Source URL", type: "url" }),
    defineField({ name: "linkPreview", title: "Link Preview", type: "reference", to: [{ type: "linkPreview" }] }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: false })
  ]
});
