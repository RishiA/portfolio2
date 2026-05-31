import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { PortableTextRenderer } from "@/components/portable-text";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { formatDate } from "@/lib/utils/date";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/sanity/loaders";
import { pageMetadata } from "@/lib/seo/page-metadata";

export const revalidate = 3600;

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return pageMetadata({
      title: "Blog",
      description: "Longer writing from Rishi Athanikar.",
      path: "/blog"
    });
  }

  const ogImage = post.coverImage
    ? { url: post.coverImage, alt: post.title }
    : undefined;

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    ...(ogImage ? { ogImage } : {})
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <Container>
      <Section title={post.title} subtitle={`Published ${formatDate(post.publishedAt)}`}>
        <article className="prose">
          <p>{post.excerpt}</p>
          <PortableTextRenderer value={post.body} />
          {post.tags.length ? (
            <div className="tag-row" aria-label={`Tags: ${post.tags.join(", ")}`}>
              {post.tags.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          ) : null}
        </article>
      </Section>
    </Container>
  );
}
