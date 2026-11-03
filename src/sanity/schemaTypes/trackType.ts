import { defineField, defineType } from "sanity";
import { APPLE_MUSIC_URL_MESSAGE, parseAppleMusicTrackId } from "../../lib/v2/music/apple-music-url";

export const trackType = defineType({
  name: "track",
  title: "Track",
  type: "object",
  fields: [
    defineField({
      name: "appleMusicUrl",
      title: "Apple Music link",
      description: "Paste the song's link from Apple Music. Cover art, album and the 30-second preview are looked up from it.",
      type: "url",
      validation: (rule) =>
        rule.required().custom((value) => {
          if (!value) return true;
          return parseAppleMusicTrackId(value) ? true : APPLE_MUSIC_URL_MESSAGE;
        })
    }),
    defineField({ name: "title", title: "Title override", type: "string" }),
    defineField({ name: "artist", title: "Artist override", type: "string" })
  ],
  preview: {
    select: { title: "title", subtitle: "appleMusicUrl" },
    prepare: ({ title, subtitle }) => ({ title: title || "Track", subtitle })
  }
});
