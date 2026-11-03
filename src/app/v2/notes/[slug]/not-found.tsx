import Link from "next/link";

export default function NoteNotFound() {
  return (
    <article className="v2-note" data-v2-reader="">
      <Link href="/v2/notes" className="v2-back" aria-label="Back to Notes">
        <span aria-hidden="true">‹ </span>Notes
      </Link>
      <h1>Note not found</h1>
      <p>This note does not exist.</p>
    </article>
  );
}
