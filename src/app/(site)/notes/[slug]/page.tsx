import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { LinkPreviewCard } from "@/components/link-preview-card";
import { PortableTextRenderer } from "@/components/portable-text";
import { Section } from "@/components/section";
import { Tag } from "@/components/tag";
import { formatDate } from "@/lib/utils/date";
import { getNoteBySlug, getNotes } from "@/lib/sanity/loaders";

export const revalidate = 3600;

interface NoteDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const notes = await getNotes();
  return notes.map((note) => ({ slug: note.slug }));
}

export async function generateMetadata({ params }: NoteDetailPageProps) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    return { title: "Note" };
  }

  const description = (note.body ?? [])
    .flatMap((block) => (block._type === "block" ? block.children : []))
    .map((child) => child.text)
    .join(" ")
    .slice(0, 160)
    .trim();

  const ogImage = note.linkPreview?.image;

  return {
    title: note.title ?? "Note",
    ...(description ? { description } : {}),
    openGraph: {
      type: "article" as const,
      title: note.title ?? "Note",
      ...(description ? { description } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {})
    }
  };
}

export default async function NoteDetailPage({ params }: NoteDetailPageProps) {
  const { slug } = await params;
  const note = await getNoteBySlug(slug);

  if (!note) {
    notFound();
  }

  return (
    <Container>
      <Section title={note.title ?? "Note"} subtitle={formatDate(note.publishedAt)}>
        <article className="prose">
          <PortableTextRenderer value={note.body} />
          {note.linkPreview ? <LinkPreviewCard preview={note.linkPreview} /> : null}
          <div className="tag-row">
            {note.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </article>
      </Section>
    </Container>
  );
}
