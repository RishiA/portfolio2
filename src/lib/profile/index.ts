import { playgroundItems } from "@/content/playground";
import { workItems } from "@/content/work";
import { getBlogPosts, getNotes } from "@/lib/sanity/loaders";
import type { BlogPost, Note, PlaygroundItem, WorkItem } from "@/types/content";
import {
  assertUniqueSlugs,
  buildContact,
  buildExperience,
  buildLandingItems,
  buildProfile,
  buildQuickLinks,
  noteToListItem,
  postToListItem,
  projectToListItem,
  workToListItem
} from "./adapters";
import type {
  ContactLink,
  Experience,
  NoteDetail,
  NoteListItem,
  Profile,
  SearchHit
} from "./types";

export type * from "./types";
export { assertUniqueSlugs } from "./adapters";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function clampLimit(limit: number | undefined): number {
  if (limit === undefined || !Number.isFinite(limit)) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, Math.floor(limit)));
}

const byDateDescThenSlug = (a: NoteListItem, b: NoteListItem): number =>
  (b.date ? Date.parse(b.date) : 0) - (a.date ? Date.parse(a.date) : 0) || a.slug.localeCompare(b.slug);

interface IndexEntry {
  item: NoteListItem;
  tags: string[];
  detail: () => NoteDetail;
}

async function loadIndex(): Promise<IndexEntry[]> {
  const [notes, posts] = await Promise.all([getNotes(), getBlogPosts()]);
  const publishedNotes = notes.filter((note: Note) => note.isPublished);
  const publishedPosts = posts.filter((post: BlogPost) => post.isPublished);

  const profile = buildProfile();
  const landing = buildLandingItems();
  const [aboutItem, workLanding, projectsLanding, linksLanding] = landing;

  const landingEntries: IndexEntry[] = [
    { item: aboutItem, tags: [], detail: () => ({ kind: "about", item: aboutItem, profile }) },
    {
      item: workLanding,
      tags: [],
      detail: () => ({ kind: "landing", item: workLanding, landing: { id: "proof-of-work", work: getWorkItems() } })
    },
    {
      item: projectsLanding,
      tags: [],
      detail: () => ({ kind: "landing", item: projectsLanding, landing: { id: "playground", projects: getProjectsSync() } })
    },
    {
      item: linksLanding,
      tags: [],
      detail: () => ({ kind: "landing", item: linksLanding, landing: { id: "quick-links", links: buildQuickLinks() } })
    }
  ];

  const pinnedNotes = publishedNotes
    .filter((note) => note.pinned)
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt) || a.slug.localeCompare(b.slug));
  const pinRanks = new Map(pinnedNotes.map((note, index) => [note.slug, landing.length + index]));

  const noteEntries: IndexEntry[] = publishedNotes.map((note) => {
    const item = { ...noteToListItem(note), pinRank: pinRanks.get(note.slug) };
    if (item.pinRank === undefined) delete item.pinRank;
    return { item, tags: note.tags, detail: () => ({ kind: "note", item, source: note }) };
  });
  const postEntries: IndexEntry[] = publishedPosts.map((post) => {
    const item = postToListItem(post);
    return { item, tags: post.tags, detail: () => ({ kind: "post", item, source: post }) };
  });
  const projectEntries: IndexEntry[] = getProjectsSync().map((project) => {
    const item = projectToListItem(project);
    return { item, tags: project.stack, detail: () => ({ kind: "project", item, source: project }) };
  });
  const workEntries: IndexEntry[] = getWorkItems().map((work) => {
    const item = workToListItem(work);
    return { item, tags: work.tags, detail: () => ({ kind: "work", item, source: work }) };
  });

  const entries = [...landingEntries, ...noteEntries, ...postEntries, ...projectEntries, ...workEntries];
  assertUniqueSlugs(entries.map((entry) => entry.item));
  return entries;
}

function getWorkItems(): WorkItem[] {
  return [...workItems].sort((a, b) => a.sortOrder - b.sortOrder);
}

function getProjectsSync(): PlaygroundItem[] {
  return [...playgroundItems];
}

export function getProfile(): Profile {
  return buildProfile();
}

export function getContact(): ContactLink[] {
  return buildContact();
}

export function getExperience(): Experience[] {
  return buildExperience(workItems);
}

export function getWorkItem(slug: string): WorkItem | null {
  return workItems.find((item) => item.slug === slug) ?? null;
}

export function getProjects(): PlaygroundItem[] {
  return getProjectsSync();
}

/** Pinned items first (by pinRank), then dated items newest first, then undated items in experience order. */
export async function getNoteList(): Promise<NoteListItem[]> {
  const entries = await loadIndex();
  const items = entries.map((entry) => entry.item);
  const pinned = items
    .filter((item) => item.pinRank !== undefined)
    .sort((a, b) => (a.pinRank ?? 0) - (b.pinRank ?? 0));
  const rest = items.filter((item) => item.pinRank === undefined);
  const dated = rest.filter((item) => item.date).sort(byDateDescThenSlug);
  const workOrder = new Map(buildExperience(workItems).map((entry, index) => [entry.workSlug, index]));
  const undated = rest
    .filter((item) => !item.date)
    .sort((a, b) => (workOrder.get(a.slug) ?? 0) - (workOrder.get(b.slug) ?? 0) || a.slug.localeCompare(b.slug));
  return [...pinned, ...dated, ...undated];
}

export async function getNoteDetail(slug: string): Promise<NoteDetail | null> {
  const entries = await loadIndex();
  return entries.find((entry) => entry.item.slug === slug)?.detail() ?? null;
}

/** Notes, posts and projects, newest first. Work items and landing notes are excluded. */
export async function getRecent(limit: number = DEFAULT_LIMIT): Promise<NoteListItem[]> {
  const entries = await loadIndex();
  return entries
    .map((entry) => entry.item)
    .filter((item) => item.kind === "note" || item.kind === "post" || item.kind === "project")
    .sort(byDateDescThenSlug)
    .slice(0, clampLimit(limit));
}

function scoreEntry(entry: IndexEntry, query: string): number {
  const title = entry.item.title.toLowerCase();
  if (title === query) return 4;
  if (title.includes(query)) return 3;
  if (entry.tags.some((tag) => tag.toLowerCase().includes(query))) return 2;
  if (entry.item.excerpt.toLowerCase().includes(query)) return 1;
  return 0;
}

export async function searchContent(query: string, limit: number = DEFAULT_LIMIT): Promise<SearchHit[]> {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const entries = await loadIndex();
  return entries
    .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || byDateDescThenSlug(a.entry.item, b.entry.item))
    .slice(0, clampLimit(limit))
    .map(({ entry: { item } }) => ({
      slug: item.slug,
      kind: item.kind,
      title: item.title,
      snippet: item.excerpt,
      url: item.url,
      date: item.date
    }));
}
