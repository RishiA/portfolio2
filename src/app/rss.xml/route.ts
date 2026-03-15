import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

export async function GET() {
  const [notes, posts] = await Promise.all([getNotes(), getBlogPosts()]);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const noteItems = notes.map(
    (note) => `<item>
  <title>${escapeXml(note.title ?? "Note")}</title>
  <link>${baseUrl}/notes/${note.slug}</link>
  <guid>${baseUrl}/notes/${note.slug}</guid>
  <pubDate>${new Date(note.publishedAt).toUTCString()}</pubDate>
</item>`
  );

  const postItems = posts.map(
    (post) => `<item>
  <title>${escapeXml(post.title)}</title>
  <link>${baseUrl}/blog/${post.slug}</link>
  <guid>${baseUrl}/blog/${post.slug}</guid>
  <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
</item>`
  );

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
<channel>
  <title>Rishi Athanikar</title>
  <link>${baseUrl}</link>
  <description>Notes and blog feed</description>
  ${[...noteItems, ...postItems].join("\n")}
</channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}
