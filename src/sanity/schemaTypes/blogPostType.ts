import { defineField, defineType } from "sanity";

export const blogPostType = defineType({
  name: "blogPost",
  title: "Blog Post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (rule) => rule.required() }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (rule) => rule.required() }),
    defineField({ name: "coverImage", title: "Cover Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "body", title: "Body", type: "array", of: [{ type: "block" }], validation: (rule) => rule.required() }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "reference", to: [{ type: "tag" }] }] }),
    defineField({ name: "publishedAt", title: "Published At", type: "datetime", validation: (rule) => rule.required() }),
    defineField({ name: "updatedAt", title: "Updated At", type: "datetime" }),
    defineField({ name: "isPublished", title: "Published", type: "boolean", initialValue: false })
  ]
});
