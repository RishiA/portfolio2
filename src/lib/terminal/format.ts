import type { ContactLink, Experience, NoteListItem, Profile, SearchHit } from "@/lib/profile/types";
import type { PlaygroundItem, WorkItem } from "@/types/content";
import type { Block, ListItem } from "./types";

/** Only same-site paths and http(s) URLs become links. Anything else (javascript:, data:) is dropped. */
export function safeHref(href: unknown): string | undefined {
  if (typeof href !== "string") return undefined;
  if (href.startsWith("/") && !href.startsWith("//")) return href;
  return /^https?:\/\//i.test(href) ? href : undefined;
}

const day = (iso?: string): string | undefined => (iso ? iso.slice(0, 10) : undefined);
const join = (parts: Array<string | undefined>): string | undefined => {
  const present = parts.filter((part): part is string => Boolean(part));
  return present.length ? present.join(" · ") : undefined;
};

export function formatProfile(data: Profile): Block[] {
  const rows = [{ key: "Location", value: data.location }, ...data.links.map((link) => ({ key: link.label, value: link.href, href: safeHref(link.href) }))];
  return [
    { type: "heading", text: data.name },
    { type: "text", text: data.headline },
    ...data.bio.map((paragraph): Block => ({ type: "text", text: paragraph })),
    { type: "rows", rows }
  ];
}

export function formatExperience(data: Array<Experience & { url: string }>): Block[] {
  if (data.length === 0) return [{ type: "text", text: "No roles to show." }];
  return [
    {
      type: "list",
      items: data.map((entry) => ({
        title: entry.organization,
        meta: join([entry.roleTitle, entry.periodLabel]),
        detail: entry.summary,
        href: safeHref(entry.url)
      }))
    }
  ];
}

export function formatWork(data: WorkItem & { url: string }): Block[] {
  const blocks: Block[] = [
    { type: "heading", text: `${data.organization}, ${data.roleTitle}` },
    {
      type: "rows",
      rows: [
        { key: "Period", value: data.periodLabel },
        ...(data.location ? [{ key: "Location", value: data.location }] : [])
      ]
    },
    { type: "text", text: data.summary }
  ];
  if (data.highlights.length) {
    blocks.push({ type: "heading", text: "Highlights" });
    blocks.push({ type: "list", items: data.highlights.map((title) => ({ title })) });
  }
  if (data.tags.length) blocks.push({ type: "rows", rows: [{ key: "Tags", value: data.tags.join(", ") }] });
  blocks.push({ type: "list", items: [{ title: "Read the full note", href: safeHref(data.url) }] });
  return blocks;
}

const noteItem = (item: { title: string; kind: string; date?: string; url: string; emoji?: string }, detail?: string): ListItem => ({
  title: item.emoji ? `${item.emoji} ${item.title}` : item.title,
  meta: join([item.kind, day(item.date)]),
  detail,
  href: safeHref(item.url)
});

export function formatRecent(data: NoteListItem[]): Block[] {
  if (data.length === 0) return [{ type: "text", text: "Nothing here yet." }];
  return [{ type: "list", items: data.map((item) => noteItem(item, item.excerpt)) }];
}

export function formatSearch(data: SearchHit[]): Block[] {
  if (data.length === 0) return [{ type: "text", text: "No results." }];
  return [{ type: "list", items: data.map((hit) => noteItem(hit, hit.snippet)) }];
}

export function formatProjects(data: Array<PlaygroundItem & { url: string }>): Block[] {
  if (data.length === 0) return [{ type: "text", text: "No projects to show." }];
  return [
    {
      type: "list",
      items: data.map((project) => ({
        title: project.name,
        meta: join([project.status, project.stack.join(", ")]),
        detail: project.oneLiner,
        href: safeHref(project.url)
      }))
    }
  ];
}

export function formatContact(data: ContactLink[]): Block[] {
  if (data.length === 0) return [{ type: "text", text: "No contact links." }];
  return [{ type: "rows", rows: data.map((link) => ({ key: link.label, value: link.href, href: safeHref(link.href) })) }];
}

const FORMATTERS: Record<string, (data: never) => Block[]> = {
  profile: formatProfile,
  experience: formatExperience,
  work: formatWork,
  recent: formatRecent,
  projects: formatProjects,
  search: formatSearch,
  contact: formatContact
};

/** Formats the `data` field of a success response for the given command. Returns null for commands without a formatter. */
export function formatResponse(command: string, data: unknown): Block[] | null {
  const formatter = FORMATTERS[command];
  return formatter ? formatter(data as never) : null;
}

/** Short text for the screen reader status line. */
export function summarize(command: string, blocks: Block[]): string {
  const count = blocks.reduce((total, block) => total + (block.type === "list" ? block.items.length : 0), 0);
  if (count > 0 && command !== "work") return `Loaded ${count} ${count === 1 ? "result" : "results"}`;
  return `Loaded /${command}`;
}
