import { defineField, defineType } from "sanity";

export const linkPreviewType = defineType({
  name: "linkPreview",
  title: "Link Preview",
  type: "document",
  fields: [
    defineField({ name: "url", title: "URL", type: "url", validation: (rule) => rule.required() }),
    defineField({ name: "canonicalUrl", title: "Canonical URL", type: "url" }),
    defineField({ name: "title", title: "Title", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "siteName", title: "Site Name", type: "string" }),
    defineField({ name: "image", title: "Image URL", type: "url" }),
    defineField({ name: "favicon", title: "Favicon URL", type: "url" }),
    defineField({ name: "publishedTime", title: "Published Time", type: "string" })
  ]
});
