import Link from "next/link";
import { Card } from "@/components/card";
import { Tag } from "@/components/tag";
import { LinkPreviewCard } from "@/components/link-preview-card";
import { formatDate } from "@/lib/utils/date";
import type { Note } from "@/types/content";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const firstTextBlock = note.body.find((block) => block._type === "block");
  const text = firstTextBlock?.children.map((child) => child.text).join(" ") ?? "";

  return (
    <Card>
      <p className="eyebrow">{formatDate(note.publishedAt)}</p>
      <h3>
        <Link href={`/notes/${note.slug}`}>{note.title ?? "Note"}</Link>
      </h3>
      <p>{text}</p>
      {note.linkPreview ? <LinkPreviewCard preview={note.linkPreview} /> : null}
      <div className="tag-row">
        {note.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </div>
    </Card>
  );
}
