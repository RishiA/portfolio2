import React from "react";
import Link from "next/link";
import { BlogCard } from "@/components/blog-card";
import { Container } from "@/components/container";
import { Section } from "@/components/section";
import { getBlogPosts } from "@/lib/sanity/loaders";

const PAGE_SIZE = 6;

export const metadata = {
  title: "Blog",
  description: "Longer writing on product, technology, and building things by Rishi Athanikar."
};

export const revalidate = 60;

interface BlogPageProps {
  searchParams?: Promise<{ page?: string }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = (await searchParams) ?? {};
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const posts = await getBlogPosts();

  if (!posts.length) {
    return (
      <Container>
        <Section title="Blog" subtitle="Longer writing on product, technology, and building things.">
          <p>No blog posts published yet.</p>
        </Section>
      </Container>
    );
  }

  const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
  const paginated = posts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Container>
      <Section title="Blog" subtitle="Longer writing on product, technology, and building things.">
        <div className="grid cols-2">
          {paginated.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>

        <div className="action-row" aria-label="Blog pagination">
          {page > 1 ? <Link href={`/blog?page=${page - 1}`}>← Previous</Link> : null}
          {page < totalPages ? <Link href={`/blog?page=${page + 1}`}>Next →</Link> : null}
        </div>
      </Section>
    </Container>
  );
}
