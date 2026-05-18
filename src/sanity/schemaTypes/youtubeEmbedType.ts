import { defineField, defineType } from "sanity";

const YOUTUBE_ID_RE =
  /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

export const youtubeEmbedType = defineType({
  name: "youtubeEmbed",
  title: "YouTube Embed",
  type: "object",
  fields: [
    defineField({
      name: "url",
      title: "YouTube URL",
      type: "url",
      description:
        "Paste any YouTube URL: youtube.com/watch?v=…, youtu.be/…, or youtube.com/shorts/…",
      validation: (rule) =>
        rule
          .required()
          .custom((value) => {
            if (typeof value !== "string") return true;
            return YOUTUBE_ID_RE.test(value) ? true : "Not a recognized YouTube URL";
          })
    }),
    defineField({
      name: "title",
      title: "Accessible title (optional)",
      type: "string",
      description: "Used as the iframe title for screen readers. Defaults to 'YouTube video'."
    })
  ],
  preview: {
    select: { url: "url", title: "title" },
    prepare({ url, title }) {
      return {
        title: title || "YouTube video",
        subtitle: url || ""
      };
    }
  }
});
