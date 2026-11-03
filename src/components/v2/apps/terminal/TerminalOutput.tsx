"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Block } from "@/lib/terminal/types";

const NOTE_HREF = /^\/v2\/notes\/[^/?#]+$/;
const linkClass = "underline underline-offset-2 hover:text-muted-foreground";

interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  onOpenNote?: (href: string) => void;
}

function SmartLink({ href, children, onOpenNote }: SmartLinkProps) {
  if (href.startsWith("/v2/")) {
    const opensNote = onOpenNote !== undefined && NOTE_HREF.test(href);
    return (
      <Link
        href={href}
        prefetch={false}
        className={linkClass}
        onClick={
          opensNote
            ? (event) => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                event.preventDefault();
                onOpenNote(href);
              }
            : undefined
        }
      >
        {children}
      </Link>
    );
  }
  if (href.startsWith("/")) {
    // Server-side redirect such as /Resume; a full page load is intended.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    return (
      <a href={href} className={linkClass}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
      {children}
    </a>
  );
}

function selectContents(node: HTMLElement | null) {
  if (!node) return;
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function CodeBlock({ text, copyable }: { text: string; copyable?: boolean }) {
  const codeRef = useRef<HTMLElement>(null);
  const [note, setNote] = useState("");

  function copy() {
    const fallback = () => {
      selectContents(codeRef.current);
      setNote("Press Ctrl+C or Cmd+C to copy");
    };
    if (!navigator.clipboard?.writeText) {
      fallback();
      return;
    }
    navigator.clipboard.writeText(text).then(() => setNote("Copied"), fallback);
  }

  return (
    <div className="my-1 flex flex-wrap items-center gap-2 rounded-md border bg-muted px-2 py-1.5">
      <code ref={codeRef} className="min-w-0 flex-1 basis-48 select-all break-all font-mono">
        {text}
      </code>
      {copyable ? (
        <button type="button" className="rounded border px-2 py-0.5 hover:bg-background max-sm:min-h-11" onClick={copy}>
          Copy
        </button>
      ) : null}
      {note ? <span className="basis-full text-muted-foreground">{note}</span> : null}
    </div>
  );
}

interface TerminalBlocksProps {
  blocks: Block[];
  onOpenNote?: (href: string) => void;
}

export function TerminalBlocks({ blocks, onOpenNote }: TerminalBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <p key={index} className="mt-1 font-bold">
                {block.text}
              </p>
            );
          case "text":
            return <p key={index}>{block.text}</p>;
          case "error":
            return (
              <p key={index} className="text-red-600 dark:text-red-400">
                {block.text}
              </p>
            );
          case "code":
            return <CodeBlock key={index} text={block.text} copyable={block.copyable} />;
          case "rows":
            return (
              <dl key={index} className="my-1">
                {block.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="flex gap-4 max-sm:flex-col max-sm:gap-0">
                    <dt className="min-w-[9ch] shrink-0 text-muted-foreground">{row.key}</dt>
                    <dd className="m-0 min-w-0">
                      {row.href ? (
                        <SmartLink href={row.href} onOpenNote={onOpenNote}>
                          {row.value}
                        </SmartLink>
                      ) : (
                        row.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            );
          case "list":
            return (
              <ul key={index} className="my-1 space-y-1">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex flex-col">
                    <span className="font-bold">
                      {item.href ? (
                        <SmartLink href={item.href} onOpenNote={onOpenNote}>
                          {item.title}
                        </SmartLink>
                      ) : (
                        item.title
                      )}
                    </span>
                    {item.meta ? <span className="text-muted-foreground">{item.meta}</span> : null}
                    {item.detail ? <span>{item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </>
  );
}
