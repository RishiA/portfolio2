import Link from "next/link";
import { Tag } from "@/components/tag";
import type { WorkItem } from "@/types/content";

interface WorkCardProps {
  item: WorkItem;
}

export function WorkCard({ item }: WorkCardProps) {
  return (
    <article className="work-entry">
      <p className="eyebrow">{item.periodLabel}</p>
      <h3>
        <Link href={`/work/${item.slug}`} className="annotated-link">
          {item.organization}
        </Link>
      </h3>
      <p className="work-role">
        {item.roleTitle}
        {item.location ? ` · ${item.location}` : ""}
      </p>
      <p>{item.summary}</p>

      {item.highlights.length ? (
        <ul className="work-highlights-compact">
          {item.highlights.slice(0, 2).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
      ) : null}

      {item.tags.length ? (
        <div className="tag-row" aria-label={`Tags: ${item.tags.join(", ")}`}>
          {item.tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
      ) : null}
    </article>
  );
}
