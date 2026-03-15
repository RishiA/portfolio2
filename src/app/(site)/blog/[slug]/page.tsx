import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { PortableTextRenderer } from "@/components/portable-text";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { formatDate } from "@/lib/utils/date";
import { getBlogPostBySlug, getBlogPosts } from "@/lib/sanity/loaders";

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
    return { title: "Blog" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      type: "article" as const,
      title: post.title,
      description: post.excerpt,
      ...(post.coverImage ? { images: [{ url: post.coverImage }] } : {})
    },
    ...(post.coverImage
      ? {
          twitter: {
            card: "summary_large_image" as const,
            title: post.title,
            description: post.excerpt,
            images: [post.coverImage]
          }
        }
      : {})
  };
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
          <div className="tag-row">
            {post.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </article>
      </Section>
    </Container>
  );
}
