import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NoteBody, NoteHeader } from "@/components/v2/notes/note-view";
import { getNoteDetail, getNoteList } from "@/lib/profile";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { canonicalPathFor } from "@/lib/v2/canonical";

export const revalidate = 60;

interface NotePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const items = await getNoteList();
  return items.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: NotePageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getNoteDetail(slug);
  if (!detail) return { title: "Not found" };
  return pageMetadata({
    title: detail.item.title,
    description: detail.item.excerpt,
    path: canonicalPathFor(detail.item)
  });
}

export default async function NotePage({ params }: NotePageProps) {
  const { slug } = await params;
  const detail = await getNoteDetail(slug);
  if (!detail) notFound();

  return (
    <article className="v2-note" data-v2-reader="">
      <Link href="/v2/notes" className="v2-back" aria-label="Back to Notes">
        <span aria-hidden="true">‹ </span>Notes
      </Link>
      <NoteHeader detail={detail} />
      <NoteBody detail={detail} />
    </article>
  );
}
