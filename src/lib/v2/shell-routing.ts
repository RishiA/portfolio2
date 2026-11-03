// Adapted from github.com/alanagoyal/alanagoyal, Copyright (c) 2024 Alana Goyal, MIT License.
import { APPS } from "./app-config";
import { getMobileShellFallbackAppId } from "./app-availability";

export const SHELL_BASE_PATH = "/v2";
export const SHELL_DEFAULT_APP_ID = "notes";
export const SHELL_NOTES_ROOT_PATH = `${SHELL_BASE_PATH}/notes`;

const APP_ROUTE_SEGMENTS = new Set<string>(APPS.map((app) => app.id));

type ShellContext = "desktop" | "mobile";

interface ShellUrlOptions {
  context?: ShellContext;
  noteSlug?: string;
  currentPathname?: string;
}

interface ParsedShellLocation {
  normalizedPathname: string;
  appId: string;
  noteSlug?: string;
}

interface ParseShellLocationOptions {
  fallbackAppId?: string;
  context?: ShellContext;
}

/** Returns the path segments after /v2, or an empty list when the path is outside /v2. */
function getShellSegments(pathname: string): string[] {
  if (pathname !== SHELL_BASE_PATH && !pathname.startsWith(`${SHELL_BASE_PATH}/`)) return [];
  return pathname.slice(SHELL_BASE_PATH.length).split("/").filter(Boolean);
}

export function normalizeShellPathname(pathname: string): string {
  return pathname === SHELL_BASE_PATH || pathname === `${SHELL_BASE_PATH}/` ? SHELL_NOTES_ROOT_PATH : pathname;
}

export function isNotesDetailPathname(pathname: string): boolean {
  return pathname.startsWith(`${SHELL_NOTES_ROOT_PATH}/`);
}

export function getShellAppIdFromPathname(pathname: string, fallbackAppId = SHELL_DEFAULT_APP_ID): string {
  const firstSegment = getShellSegments(pathname)[0];
  if (firstSegment && APP_ROUTE_SEGMENTS.has(firstSegment)) return firstSegment;
  return fallbackAppId;
}

export function getNoteSlugFromShellPathname(pathname: string): string | undefined {
  if (!isNotesDetailPathname(pathname)) return undefined;

  const slug = pathname.slice(`${SHELL_NOTES_ROOT_PATH}/`.length).split("/")[0];
  if (!slug) return undefined;

  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function getNotesRoute(noteSlug?: string): string {
  if (!noteSlug) return SHELL_NOTES_ROOT_PATH;
  return `${SHELL_NOTES_ROOT_PATH}/${encodeURIComponent(noteSlug)}`;
}

export function getShellAppIdForContext(appId: string, context: ShellContext = "desktop"): string {
  return context === "mobile" ? getMobileShellFallbackAppId(appId) : appId;
}

/** Returns the URL for an app, or null for windows with no route (Trash). */
export function getShellUrlForApp(appId: string, options: ShellUrlOptions = {}): string | null {
  const context = options.context ?? "desktop";
  const contextualAppId = getShellAppIdForContext(appId, context);

  if (contextualAppId !== appId) return `${SHELL_BASE_PATH}/${contextualAppId}`;
  if (!APP_ROUTE_SEGMENTS.has(appId)) return null;

  if (appId === "notes") {
    if (context === "mobile") return SHELL_NOTES_ROOT_PATH;
    if (options.noteSlug) return getNotesRoute(options.noteSlug);
    if (options.currentPathname && isNotesDetailPathname(options.currentPathname)) return options.currentPathname;
    return SHELL_NOTES_ROOT_PATH;
  }

  return `${SHELL_BASE_PATH}/${appId}`;
}

export function parseShellLocation(pathname: string, options: ParseShellLocationOptions = {}): ParsedShellLocation {
  const context = options.context ?? "desktop";
  const fallbackAppId = getShellAppIdForContext(options.fallbackAppId ?? SHELL_DEFAULT_APP_ID, context);
  const rawNormalizedPathname = normalizeShellPathname(pathname);
  const rawAppId = getShellAppIdFromPathname(rawNormalizedPathname, fallbackAppId);
  const appId = getShellAppIdForContext(rawAppId, context);

  const normalizedPathname =
    appId === rawAppId ? rawNormalizedPathname : (getShellUrlForApp(appId, { context }) ?? rawNormalizedPathname);

  const noteSlug = appId === "notes" ? getNoteSlugFromShellPathname(rawNormalizedPathname) : undefined;

  return { normalizedPathname, appId, noteSlug };
}
