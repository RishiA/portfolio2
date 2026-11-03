import type { ReactNode } from "react";
import { NotesSidebar } from "@/components/v2/notes/notes-sidebar";
import { getNoteList } from "@/lib/profile";

export const revalidate = 60;

export default async function NotesLayout({ children }: Readonly<{ children: ReactNode }>) {
  const items = await getNoteList();
  return (
    <div className="v2-notes">
      <NotesSidebar items={items} nowIso={new Date().toISOString()} />
      <section className="v2-reader" aria-label="Note">
        {children}
      </section>
    </div>
  );
}
