import type { MetadataRoute } from "next";
import { workItems } from "@/content/work";
import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const [notes, posts] = await Promise.all([getNotes(), getBlogPosts()]);

  const staticRoutes = ["", "/about", "/work", "/notes", "/blog", "/playground"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date()
  }));

  const workRoutes = workItems.map((item) => ({
    url: `${baseUrl}/work/${item.slug}`,
    lastModified: new Date()
  }));

  const noteRoutes = notes.map((note) => ({
    url: `${baseUrl}/notes/${note.slug}`,
    lastModified: new Date(note.publishedAt)
  }));

  const blogRoutes = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt || post.publishedAt)
  }));

  return [...staticRoutes, ...workRoutes, ...noteRoutes, ...blogRoutes];
}
