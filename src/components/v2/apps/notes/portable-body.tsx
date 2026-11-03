"use client";

import { Fragment, useMemo } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import type { PortableTextBodyBlock, PortableTextValue } from "@/types/content";
import { CollapsibleSection } from "./collapsible-section";
import { NoteLink } from "./note-link";

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => <p>{children}</p>
  },
  marks: {
    link: ({ value, children }) => {
      const href = value?.href as string | undefined;
      if (!href) return <>{children}</>;
      return <NoteLink href={href}>{children}</NoteLink>;
    }
  },
  types: {
    linkEmbed: ({ value }) => {
      if (!value?.url) return null;
      return (
        <p>
          <NoteLink href={value.url}>{value.displayAs === "inline" ? value.url : hostnameOf(value.url)}</NoteLink>
        </p>
      );
    },
    youtubeEmbed: ({ value }) => {
      if (!value?.url) return null;
      return (
        <p>
          <NoteLink href={value.url}>{value.title || value.url}</NoteLink>
        </p>
      );
    }
  }
};

function headingText(block: PortableTextBodyBlock): string {
  if (block._type !== "block") return "";
  return block.children.map((child) => child.text).join("");
}

const isSectionHeading = (block: PortableTextBodyBlock): boolean => block._type === "block" && block.style === "h2";

interface Segment {
  heading?: PortableTextBodyBlock;
  blocks: PortableTextValue;
}

/** Splits a body at each h2, so every h2 becomes a collapsible section. Blocks before the first h2 stay at the top. */
export function splitAtHeadings(value: PortableTextValue): Segment[] {
  const segments: Segment[] = [{ blocks: [] }];
  for (const block of value) {
    if (isSectionHeading(block)) {
      segments.push({ heading: block, blocks: [] });
    } else {
      segments[segments.length - 1].blocks.push(block);
    }
  }
  return segments.filter((segment) => segment.heading || segment.blocks.length > 0);
}

export function PortableBody({ value }: { value: PortableTextValue }) {
  const segments = useMemo(() => splitAtHeadings(value), [value]);
  return (
    <>
      {segments.map((segment, index) => {
        const key = segment.heading?._key ?? `segment-${index}`;
        if (!segment.heading) {
          return (
            <Fragment key={key}>
              <PortableText value={segment.blocks} components={components} />
            </Fragment>
          );
        }
        const label = headingText(segment.heading).trim() || "section";
        return (
          <CollapsibleSection key={key} title={label} label={label}>
            <PortableText value={segment.blocks} components={components} />
          </CollapsibleSection>
        );
      })}
    </>
  );
}
