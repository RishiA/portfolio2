"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import { WorkCard } from "@/components/work-card";
import type { WorkItem } from "@/types/content";

const REVEAL_MS = 680;
const REVEAL_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

export function WorkTimeline({ items }: { items: WorkItem[] }) {
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root || items.length < 2) return;

    const nodes = Array.from(root.querySelectorAll<HTMLLIElement>("li[data-timeline-follow]"));

    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -12% 0px",
        threshold: 0.08
      }
    );

    for (const node of nodes) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, [items]);

  return (
    <ol
      ref={listRef}
      className="work-timeline work-timeline--scroll"
      aria-label="Work history"
      style={
        {
          "--work-timeline-reveal-ms": `${REVEAL_MS}ms`,
          "--work-timeline-reveal-ease": REVEAL_EASE
        } as CSSProperties
      }
    >
      {items.map((item, index) => {
        const isLead = index === 0;
        return (
          <li
            key={item.slug}
            className={`work-timeline-item${isLead ? " work-timeline-item--lead" : ""}`}
            data-timeline-follow={isLead ? undefined : ""}
          >
            <span className="work-timeline-rail" aria-hidden="true">
              <span className="work-timeline-rail-fill" />
              <span className="work-timeline-dot" />
            </span>
            <div className="work-timeline-item-body">
              <WorkCard item={item} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}
