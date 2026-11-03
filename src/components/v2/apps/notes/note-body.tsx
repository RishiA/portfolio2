"use client";

import type { ReactNode } from "react";
import type { LandingContent, NoteDetail } from "@/lib/profile/types";
import type { LinkPreview, PlaygroundItem, WorkItem } from "@/types/content";
import { CollapsibleSection } from "./collapsible-section";
import { NoteLink } from "./note-link";
import { PortableBody } from "./portable-body";

const STATUS_LABEL: Record<PlaygroundItem["status"], string> = { live: "Live", wip: "In progress", archived: "Archived" };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <CollapsibleSection title={title} label={title}>
      {children}
    </CollapsibleSection>
  );
}

function AboutBody({ detail }: { detail: Extract<NoteDetail, { kind: "about" }> }) {
  const { profile } = detail;
  return (
    <>
      <p>{profile.headline}</p>
      {profile.bio.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <Section title="links">
        <ul>
          {profile.links.map((link) => (
            <li key={link.id}>
              <NoteLink href={link.href}>{link.label}</NoteLink>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function LandingBody({ landing }: { landing: LandingContent }) {
  if (landing.id === "proof-of-work") {
    return (
      <ul>
        {landing.work.map((work) => (
          <li key={work.slug}>
            <NoteLink href={`/v2/notes/${work.slug}`}>{work.organization}</NoteLink>
            {`, ${work.roleTitle} (${work.periodLabel}). ${work.summary}`}
          </li>
        ))}
      </ul>
    );
  }
  if (landing.id === "playground") {
    return (
      <ul>
        {landing.projects.map((project) => (
          <li key={project.slug}>
            <NoteLink href={`/v2/notes/${project.slug}`}>{project.name}</NoteLink>
            {` (${STATUS_LABEL[project.status]}). ${project.oneLiner}`}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul>
      {landing.links.map((link) => (
        <li key={`${link.kind}-${link.href}`}>
          <NoteLink href={link.href}>{link.label}</NoteLink>
        </li>
      ))}
    </ul>
  );
}

function ProjectLinks({ project }: { project: PlaygroundItem }) {
  const links = [
    project.liveUrl ? { label: "Demo", href: project.liveUrl } : null,
    project.repoUrl ? { label: "Source", href: project.repoUrl } : null,
    project.writeupUrl ? { label: "Write-up", href: project.writeupUrl } : null
  ].filter((link): link is { label: string; href: string } => link !== null);
  if (links.length === 0) return null;
  return (
    <Section title="links">
      <ul>
        {links.map((link) => (
          <li key={link.href}>
            <NoteLink href={link.href}>{link.label}</NoteLink>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function WorkBody({ work }: { work: WorkItem }) {
  return (
    <>
      <p>
        {work.roleTitle} at {work.organization}
        {work.location ? `, ${work.location}` : ""}
      </p>
      <p>{work.summary}</p>
      {work.problem ? (
        <Section title="problem">
          <p>{work.problem}</p>
        </Section>
      ) : null}
      {work.approach ? (
        <Section title="approach">
          <p>{work.approach}</p>
        </Section>
      ) : null}
      {work.outcome ? (
        <Section title="outcome">
          <p>{work.outcome}</p>
        </Section>
      ) : null}
      {work.impactMetrics?.length ? (
        <Section title="metrics">
          <ul>
            {work.impactMetrics.map((metric) => (
              <li key={metric.label}>
                {metric.label}: {metric.value}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {work.highlights.length ? (
        <Section title="highlights">
          <ul>
            {work.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {work.artifacts?.length ? (
        <Section title="artifacts">
          <ul>
            {work.artifacts.map((artifact) => (
              <li key={artifact.url}>
                <NoteLink href={artifact.url}>{artifact.label}</NoteLink>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {work.tags.length ? <p className="text-muted-foreground">{work.tags.join(" · ")}</p> : null}
    </>
  );
}

function ProjectBody({ project }: { project: PlaygroundItem }) {
  return (
    <>
      <p>{project.oneLiner}</p>
      <Section title="status">
        <p>{STATUS_LABEL[project.status]}</p>
      </Section>
      {project.stack.length ? (
        <Section title="stack">
          <ul>
            {project.stack.map((entry) => (
              <li key={entry}>{entry}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      <ProjectLinks project={project} />
    </>
  );
}

function LinkPreviewCard({ preview }: { preview: LinkPreview }) {
  const host = preview.siteName || new URL(preview.canonicalUrl || preview.url).hostname.replace(/^www\./, "");
  return (
    <NoteLink
      href={preview.url}
      className="mb-4 block rounded-lg border border-muted-foreground/20 px-3 py-2 no-underline"
    >
      <span className="block text-xs text-muted-foreground">{host}</span>
      {preview.title ? <span className="block font-semibold text-foreground">{preview.title}</span> : null}
      {preview.description ? <span className="block text-muted-foreground">{preview.description}</span> : null}
    </NoteLink>
  );
}

export function NoteBody({ detail }: { detail: NoteDetail }) {
  switch (detail.kind) {
    case "about":
      return <AboutBody detail={detail} />;
    case "landing":
      return <LandingBody landing={detail.landing} />;
    case "work":
      return <WorkBody work={detail.source} />;
    case "project":
      return <ProjectBody project={detail.source} />;
    case "note": {
      const note = detail.source;
      return (
        <>
          {note.kind === "link" && note.linkPreview ? (
            <LinkPreviewCard preview={note.linkPreview} />
          ) : note.kind === "link" && note.sourceUrl ? (
            <p>
              <NoteLink href={note.sourceUrl}>{note.sourceUrl}</NoteLink>
            </p>
          ) : null}
          <PortableBody value={note.body} />
        </>
      );
    }
    case "post":
      return <PortableBody value={detail.source.body} />;
  }
}
