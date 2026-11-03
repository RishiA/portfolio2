import { AppShellPage } from "@/lib/v2/app-shell-page";

export default async function V2NoteDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <AppShellPage appId="notes" initialNoteSlug={slug} />;
}
