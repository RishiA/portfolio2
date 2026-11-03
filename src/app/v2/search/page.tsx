import type { Metadata } from "next";
import Link from "next/link";
import { searchContent } from "@/lib/profile";
import { formatNoteDate } from "@/lib/v2/note-groups";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Search" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string | string[] }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const raw = Array.isArray(q) ? q[0] : q;
  const query = (raw ?? "").trim().slice(0, 200);
  const hits = query ? await searchContent(query, 25) : [];

  return (
    <div className="v2-search-page">
      <Link href="/v2/notes" className="v2-back-inline">
        <span aria-hidden="true">‹ </span>Notes
      </Link>
      <h1>Search</h1>
      <form action="/v2/search" method="get" role="search" className="v2-search">
        <label className="v2-sr" htmlFor="v2-search-page-input">
          Search notes
        </label>
        <input id="v2-search-page-input" name="q" type="search" defaultValue={query} placeholder="Search" autoComplete="off" />
      </form>
      {query ? (
        <p className="v2-meta" role="status">
          {hits.length} {hits.length === 1 ? "result" : "results"} for “{query}”
        </p>
      ) : null}
      {hits.length > 0 ? (
        <ul className="v2-cards">
          {hits.map((hit) => (
            <li key={hit.slug}>
              <h2>
                <Link href={hit.url}>{hit.title}</Link>
              </h2>
              {hit.date ? <p className="v2-meta">{formatNoteDate(hit.date)}</p> : null}
              <p>{hit.snippet}</p>
            </li>
          ))}
        </ul>
      ) : query ? (
        <p>No notes match your search.</p>
      ) : null}
    </div>
  );
}
