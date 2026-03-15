import { groq } from "next-sanity";

export const notesQuery = groq`*[_type == "note" && isPublished == true] | order(publishedAt desc){
  "slug": slug.current,
  kind,
  title,
  body,
  sourceUrl,
  tags[]-> {"title": title, "slug": slug.current},
  linkPreview->{
    url,
    canonicalUrl,
    title,
    description,
    siteName,
    image,
    favicon,
    publishedTime
  },
  publishedAt,
  isPublished
}`;

export const noteBySlugQuery = groq`*[_type == "note" && slug.current == $slug][0]{
  "slug": slug.current,
  kind,
  title,
  body,
  sourceUrl,
  tags[]-> {"title": title, "slug": slug.current},
  linkPreview->{
    url,
    canonicalUrl,
    title,
    description,
    siteName,
    image,
    favicon,
    publishedTime
  },
  publishedAt,
  isPublished
}`;

export const blogPostsQuery = groq`*[_type == "blogPost" && isPublished == true] | order(publishedAt desc){
  "slug": slug.current,
  title,
  excerpt,
  body,
  "coverImage": coverImage.asset->url,
  tags[]-> {"title": title, "slug": slug.current},
  publishedAt,
  updatedAt,
  isPublished
}`;

export const blogPostBySlugQuery = groq`*[_type == "blogPost" && slug.current == $slug][0]{
  "slug": slug.current,
  title,
  excerpt,
  body,
  "coverImage": coverImage.asset->url,
  tags[]-> {"title": title, "slug": slug.current},
  publishedAt,
  updatedAt,
  isPublished
}`;
