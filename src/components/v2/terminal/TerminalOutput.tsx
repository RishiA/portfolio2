"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { Block } from "@/lib/terminal/types";

function SmartLink({ href, children }: { href: string; children: React.ReactNode }) {
  if (href.startsWith("/v2/")) {
    return (
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("/")) {
    // Server-side redirect such as /Resume; a full page load is intended.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    return <a href={href}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
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
    navigator.clipboard.writeText(text).then(
      () => setNote("Copied"),
      fallback
    );
  }

  return (
    <div className="v2t-code">
      <code ref={codeRef}>{text}</code>
      {copyable ? (
        <button type="button" className="v2t-copy" onClick={copy}>
          Copy
        </button>
      ) : null}
      {note ? <span className="v2t-code-note">{note}</span> : null}
    </div>
  );
}

export function TerminalBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading":
            return (
              <p key={index} className="v2t-heading">
                {block.text}
              </p>
            );
          case "text":
            return (
              <p key={index} className="v2t-text">
                {block.text}
              </p>
            );
          case "error":
            return (
              <p key={index} className="v2t-error">
                {block.text}
              </p>
            );
          case "code":
            return <CodeBlock key={index} text={block.text} copyable={block.copyable} />;
          case "rows":
            return (
              <dl key={index} className="v2t-rows">
                {block.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="v2t-row">
                    <dt>{row.key}</dt>
                    <dd>{row.href ? <SmartLink href={row.href}>{row.value}</SmartLink> : row.value}</dd>
                  </div>
                ))}
              </dl>
            );
          case "list":
            return (
              <ul key={index} className="v2t-list">
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <span className="v2t-item-title">
                      {item.href ? <SmartLink href={item.href}>{item.title}</SmartLink> : item.title}
                    </span>
                    {item.meta ? <span className="v2t-meta">{item.meta}</span> : null}
                    {item.detail ? <span className="v2t-detail">{item.detail}</span> : null}
                  </li>
                ))}
              </ul>
            );
        }
      })}
    </>
  );
}
