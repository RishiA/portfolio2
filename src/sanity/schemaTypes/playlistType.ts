import { defineField, defineType } from "sanity";

export const playlistType = defineType({
  name: "playlist",
  title: "Playlist",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (rule) => rule.required() }),
    defineField({ name: "emoji", title: "Emoji", type: "string" }),
    defineField({ name: "description", title: "Description", type: "string" }),
    defineField({
      name: "order",
      title: "Order",
      description: "Lower numbers appear first.",
      type: "number",
      initialValue: 0
    }),
    defineField({ name: "tracks", title: "Tracks", type: "array", of: [{ type: "track" }] })
  ],
  orderings: [{ title: "Order", name: "orderAsc", by: [{ field: "order", direction: "asc" }] }],
  preview: {
    select: { title: "name", subtitle: "emoji" }
  }
});
