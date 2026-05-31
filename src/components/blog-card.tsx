import Link from "next/link";
import { Card } from "@/components/card";
import { Tag } from "@/components/tag";
import { formatDate } from "@/lib/utils/date";
import type { BlogPost } from "@/types/content";

interface BlogCardProps {
  post: BlogPost;
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <Card>
      <p className="eyebrow">
        {formatDate(post.publishedAt)} · {post.readingTimeMinutes} min read
      </p>
      <h3>
        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt}</p>
      {post.tags.length ? (
        <div className="tag-row" aria-label={`Tags: ${post.tags.join(", ")}`}>
          {post.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}
    </Card>
  );
}
