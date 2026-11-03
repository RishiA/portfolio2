import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Notes",
  description: "Work, projects and writing by Rishi Athanikar."
};

export default function NotesIndexPage() {
  return (
    <div className="v2-empty-pane">
      <p>Select a note</p>
    </div>
  );
}
