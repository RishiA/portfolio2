import Link from "next/link";
import { LinkPreviewCard } from "@/components/link-preview-card";
import { PortableTextRenderer } from "@/components/portable-text";
import type { LandingContent, NoteDetail } from "@/lib/profile/types";
import { formatNoteDate } from "@/lib/v2/note-groups";
import type { PlaygroundItem, WorkItem } from "@/types/content";

const STATUS_LABEL: Record<PlaygroundItem["status"], string> = { live: "Live", wip: "In progress", archived: "Archived" };

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return isExternal(href) ? (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  ) : (
    // Plain anchor on purpose: v1 routes and redirects must load as separate pages.
    // eslint-disable-next-line @next/next/no-html-link-for-pages
    <a href={href}>{children}</a>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="v2-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export function noteDateLine(detail: NoteDetail): string | null {
  const { item } = detail;
  switch (detail.kind) {
    case "note": {
      return item.date ? `Published ${formatNoteDate(item.date)}` : null;
    }
    case "post": {
      if (!item.date) return null;
      const published = formatNoteDate(item.date);
      const updated = detail.source.updatedAt ? formatNoteDate(detail.source.updatedAt) : "";
      return updated && updated !== published ? `Published ${published} · Updated ${updated}` : `Published ${published}`;
    }
    default: {
      return item.date ? `Updated ${formatNoteDate(item.date)}` : null;
    }
  }
}

export function NoteHeader({ detail }: { detail: NoteDetail }) {
  const { item } = detail;
  const dateLine = noteDateLine(detail);
  return (
    <header className="v2-note-header">
      <h1>
        {item.emoji ? (
          <span className="v2-note-emoji" aria-hidden="true">
            {item.emoji}
          </span>
        ) : null}
        {item.title}
      </h1>
      {dateLine || detail.kind === "post" ? (
        <p className="v2-note-date">
          {dateLine}
          {dateLine && detail.kind === "post" ? " · " : null}
          {detail.kind === "post" ? `${detail.source.readingTimeMinutes} min read` : null}
        </p>
      ) : null}
    </header>
  );
}

function AboutBody({ detail }: { detail: Extract<NoteDetail, { kind: "about" }> }) {
  const { profile } = detail;
  return (
    <>
      <p className="v2-lede">{profile.headline}</p>
      {profile.bio.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      <Section title="Links">
        <ul className="v2-plain-list">
          {profile.links.map((link) => (
            <li key={link.id}>
              <ExternalLink href={link.href}>{link.label}</ExternalLink>
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
      <ul className="v2-cards">
        {landing.work.map((work) => (
          <li key={work.slug}>
            <h2>
              <Link href={`/v2/notes/${work.slug}`}>{work.organization}</Link>
            </h2>
            <p className="v2-meta">
              {work.roleTitle} · {work.periodLabel}
            </p>
            <p>{work.summary}</p>
          </li>
        ))}
      </ul>
    );
  }
  if (landing.id === "playground") {
    return (
      <ul className="v2-cards">
        {landing.projects.map((project) => (
          <li key={project.slug}>
            <h2>
              <Link href={`/v2/notes/${project.slug}`}>{project.name}</Link>{" "}
              <span className="v2-pill">{STATUS_LABEL[project.status]}</span>
            </h2>
            <p>{project.oneLiner}</p>
            <ProjectLinks project={project} />
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className="v2-plain-list">
      {landing.links.map((link) => (
        <li key={`${link.kind}-${link.href}`}>
          {link.kind === "note" ? <Link href={link.href}>{link.label}</Link> : <ExternalLink href={link.href}>{link.label}</ExternalLink>}
        </li>
      ))}
    </ul>
  );
}

function ProjectLinks({ project }: { project: PlaygroundItem }) {
  if (!project.liveUrl && !project.repoUrl && !project.writeupUrl) return null;
  return (
    <p className="v2-inline-links">
      {project.liveUrl ? <ExternalLink href={project.liveUrl}>Demo</ExternalLink> : null}
      {project.repoUrl ? <ExternalLink href={project.repoUrl}>Source</ExternalLink> : null}
      {project.writeupUrl ? <ExternalLink href={project.writeupUrl}>Write-up</ExternalLink> : null}
    </p>
  );
}

function WorkBody({ work }: { work: WorkItem }) {
  return (
    <>
      <p className="v2-meta">
        {work.roleTitle} · {work.organization} · {work.periodLabel}
        {work.location ? ` · ${work.location}` : ""}
      </p>
      <p className="v2-lede">{work.summary}</p>
      {work.problem ? (
        <Section title="Problem">
          <p>{work.problem}</p>
        </Section>
      ) : null}
      {work.approach ? (
        <Section title="Approach">
          <p>{work.approach}</p>
        </Section>
      ) : null}
      {work.outcome ? (
        <Section title="Outcome">
          <p>{work.outcome}</p>
        </Section>
      ) : null}
      {work.impactMetrics?.length ? (
        <Section title="Metrics">
          <dl className="v2-metrics">
            {work.impactMetrics.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>{metric.value}</dd>
              </div>
            ))}
          </dl>
        </Section>
      ) : null}
      {work.highlights.length ? (
        <Section title="Highlights">
          <ul>
            {work.highlights.map((highlight) => (
              <li key={highlight}>{highlight}</li>
            ))}
          </ul>
        </Section>
      ) : null}
      {work.artifacts?.length ? (
        <Section title="Artifacts">
          <ul className="v2-plain-list">
            {work.artifacts.map((artifact) => (
              <li key={artifact.url}>
                <ExternalLink href={artifact.url}>{artifact.label}</ExternalLink>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
      {work.tags.length ? (
        <ul className="v2-tags" aria-label="Tags">
          {work.tags.map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

function ProjectBody({ project }: { project: PlaygroundItem }) {
  return (
    <>
      <p className="v2-lede">{project.oneLiner}</p>
      <p>
        <span className="v2-pill">{STATUS_LABEL[project.status]}</span>
      </p>
      {project.stack.length ? (
        <Section title="Stack">
          <ul className="v2-tags">
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
        <div className="v2-prose">
          {note.kind === "link" && note.linkPreview ? (
            <LinkPreviewCard preview={note.linkPreview} />
          ) : note.kind === "link" && note.sourceUrl ? (
            <p>
              <ExternalLink href={note.sourceUrl}>{note.sourceUrl}</ExternalLink>
            </p>
          ) : null}
          <PortableTextRenderer value={note.body} />
        </div>
      );
    }
    case "post":
      return (
        <div className="v2-prose">
          <PortableTextRenderer value={detail.source.body} />
        </div>
      );
  }
}
