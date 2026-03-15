import React from "react";
import { Container } from "@/components/container";
import { NoteCard } from "@/components/note-card";
import { Section } from "@/components/section";
import { getNotes } from "@/lib/sanity/loaders";

export const metadata = {
  title: "Notes",
  description: "Short writing and links from Rishi Athanikar."
};

export const revalidate = 60;

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <Container>
      <Section title="Notes" subtitle="Short writing and links I find interesting.">
        {notes.length ? (
          <div className="grid cols-2">
            {notes.map((note) => (
              <NoteCard key={note.slug} note={note} />
            ))}
          </div>
        ) : (
          <p>No notes published yet.</p>
        )}
      </Section>
    </Container>
  );
}
