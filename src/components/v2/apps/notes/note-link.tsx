"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { noteSlugFromHref } from "@/lib/v2/notes/note-href";
import { useSelectNote } from "./note-link-context";

type NoteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { href: string };

export function NoteLink({ href, children, onClick, ...rest }: NoteLinkProps) {
  const selectNote = useSelectNote();
  const slug = noteSlugFromHref(href);

  if (slug) {
    const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(event);
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
      selectNote(slug);
    };
    return (
      <a {...rest} href={href} onClick={handleClick}>
        {children}
      </a>
    );
  }

  if (/^https?:\/\//i.test(href)) {
    return (
      <a {...rest} href={href} target="_blank" rel="noopener noreferrer" onClick={onClick}>
        {children}
      </a>
    );
  }

  return (
    // Plain anchor on purpose: v1 routes and redirects load as separate pages.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a {...rest} href={href} onClick={onClick}>
      {children}
    </a>
  );
}
