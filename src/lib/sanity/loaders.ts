import { cache } from "react";
import { fallbackBlogPosts, fallbackNotes } from "@/content/fallback-notes";
import { isSanityConfigured, sanityClient } from "@/lib/sanity/client";
import { mapBlogPost, mapNote } from "@/lib/sanity/mappers";
import { blogPostBySlugQuery, blogPostsQuery, noteBySlugQuery, notesQuery } from "@/lib/sanity/queries";
import type { BlogPost, Note } from "@/types/content";

export const getNotes = cache(async (): Promise<Note[]> => {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackNotes;
  }
  try {
    const data = await sanityClient.fetch<unknown[]>(notesQuery);
    return (data ?? []).map(mapNote);
  } catch {
    return fallbackNotes;
  }
});

export const getNoteBySlug = cache(async (slug: string): Promise<Note | null> => {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackNotes.find((note) => note.slug === slug) ?? null;
  }
  try {
    const data = await sanityClient.fetch<unknown>(noteBySlugQuery, { slug });
    return data ? mapNote(data) : null;
  } catch {
    return fallbackNotes.find((note) => note.slug === slug) ?? null;
  }
});

export const getBlogPosts = cache(async (): Promise<BlogPost[]> => {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackBlogPosts;
  }
  try {
    const data = await sanityClient.fetch<unknown[]>(blogPostsQuery);
    return (data ?? []).map(mapBlogPost);
  } catch {
    return fallbackBlogPosts;
  }
});

export const getBlogPostBySlug = cache(async (slug: string): Promise<BlogPost | null> => {
  if (!isSanityConfigured || !sanityClient) {
    return fallbackBlogPosts.find((post) => post.slug === slug) ?? null;
  }
  try {
    const data = await sanityClient.fetch<unknown>(blogPostBySlugQuery, { slug });
    return data ? mapBlogPost(data) : null;
  } catch {
    return fallbackBlogPosts.find((post) => post.slug === slug) ?? null;
  }
});
