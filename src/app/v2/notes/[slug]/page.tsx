import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNoteDetail, getNoteList } from "@/lib/profile";
import { pageMetadata } from "@/lib/seo/page-metadata";
import { AppShellPage } from "@/lib/v2/app-shell-page";
import { loadNotesBoot } from "@/lib/v2/notes/boot";
import { canonicalPathFor } from "@/lib/v2/notes/canonical";

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

export default async function V2NoteDetailPage({ params }: NotePageProps) {
  const { slug } = await params;
  const boot = await loadNotesBoot(slug);
  if (!boot.initialNote) notFound();
  return <AppShellPage appId="notes" {...boot} />;
}
