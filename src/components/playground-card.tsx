import { Card } from "@/components/card";
import { Tag } from "@/components/tag";
import type { PlaygroundItem } from "@/types/content";

interface PlaygroundCardProps {
  item: PlaygroundItem;
}

export function PlaygroundCard({ item }: PlaygroundCardProps) {
  return (
    <Card>
      <p className="eyebrow">{item.status.toUpperCase()}</p>
      <h3>{item.name}</h3>
      <p>{item.oneLiner}</p>
      <div className="tag-row">
        {item.stack.map((tool) => (
          <Tag key={tool}>{tool}</Tag>
        ))}
      </div>
      <div className="action-row">
        {item.liveUrl ? (
          <a href={item.liveUrl} target="_blank" rel="noopener noreferrer">
            Live ↗
          </a>
        ) : null}
        {item.repoUrl ? (
          <a href={item.repoUrl} target="_blank" rel="noopener noreferrer">
            Repo ↗
          </a>
        ) : null}
        {item.writeupUrl ? (
          <a href={item.writeupUrl} target="_blank" rel="noopener noreferrer">
            Write-up ↗
          </a>
        ) : null}
      </div>
    </Card>
  );
}
