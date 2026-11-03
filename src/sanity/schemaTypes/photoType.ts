import { defineField, defineType } from "sanity";

export const PHOTO_ALBUMS = [
  { title: "People", value: "people" },
  { title: "Places", value: "places" },
  { title: "Food", value: "food" },
  { title: "Things", value: "things" }
] as const;

export const photoType = defineType({
  name: "photo",
  title: "Photo",
  type: "document",
  fields: [
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Describes the photo for screen readers.",
      validation: (rule) => rule.required()
    }),
    defineField({ name: "caption", title: "Caption", type: "string" }),
    defineField({ name: "takenAt", title: "Taken At", type: "datetime", validation: (rule) => rule.required() }),
    defineField({
      name: "album",
      title: "Album",
      type: "string",
      options: { list: [...PHOTO_ALBUMS] }
    }),
    defineField({
      name: "useAsWallpaper",
      title: "Use as wallpaper",
      type: "boolean",
      description: "Lists this photo as a wallpaper option on the /v2 desktop.",
      initialValue: false
    })
  ],
  orderings: [
    { title: "Taken, newest first", name: "takenAtDesc", by: [{ field: "takenAt", direction: "desc" }] }
  ],
  preview: {
    select: { title: "caption", subtitle: "takenAt", media: "image", alt: "alt" },
    prepare: ({ title, subtitle, media, alt }) => ({
      title: title || alt || "Untitled photo",
      subtitle: subtitle ? new Date(subtitle).toLocaleDateString("en-US") : undefined,
      media
    })
  }
});
