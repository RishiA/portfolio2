import { LIMIT_MAX, LIMIT_MIN, QUERY_MAX, QUERY_MIN, SLUG_MAX, SLUG_PATTERN } from "./limits";
import type { Block } from "./types";

export interface CommandSpec {
  name: string;
  usage: string;
  description: string;
  args: "none" | "optional" | "required";
  /** True when running the command fetches an /api/me route. */
  api: boolean;
}

export const COMMANDS: readonly CommandSpec[] = [
  { name: "help", usage: "/help", description: "List all commands.", args: "none", api: false },
  { name: "profile", usage: "/profile", description: "Name, headline, location, bio and links.", args: "none", api: true },
  { name: "experience", usage: "/experience", description: "Roles, newest first.", args: "none", api: true },
  { name: "work", usage: "/work <slug>", description: "Details for one role.", args: "required", api: true },
  { name: "recent", usage: "/recent [limit]", description: "Newest notes, posts and projects.", args: "optional", api: true },
  { name: "projects", usage: "/projects", description: "Side projects.", args: "none", api: true },
  { name: "search", usage: "/search <query>", description: "Search titles, tags and excerpts.", args: "required", api: true },
  { name: "contact", usage: "/contact", description: "Contact links.", args: "none", api: true },
  { name: "resume", usage: "/resume", description: "Open the resume.", args: "none", api: false },
  { name: "api", usage: "/api", description: "How to use the JSON API.", args: "none", api: false },
  { name: "mcp", usage: "/mcp", description: "Connect an MCP client to this site.", args: "none", api: false },
  { name: "clear", usage: "/clear", description: "Clear the screen.", args: "none", api: false }
];

export function findCommand(name: string): CommandSpec | undefined {
  return COMMANDS.find((command) => command.name === name);
}

/** Commands offered as tappable chips on the welcome screen. They all run without arguments. */
export const SUGGESTED_COMMANDS = ["/help", "/experience", "/recent", "/projects", "/profile", "/contact", "/mcp"] as const;

export type RequestResult = { ok: true; path: string } | { ok: false; message: string };

/** Validates arguments against the API limits and builds the relative URL. Only for commands with `api: true`. */
export function buildRequest(name: string, args: string[]): RequestResult {
  switch (name) {
    case "profile":
    case "experience":
    case "projects":
    case "contact":
      return { ok: true, path: `/api/me/${name}` };
    case "work": {
      if (args.length !== 1) return { ok: false, message: "Usage: /work <slug>. Try /experience to see the slugs." };
      const slug = args[0];
      if (slug.length > SLUG_MAX || !SLUG_PATTERN.test(slug)) {
        return { ok: false, message: `The slug must be lowercase letters, digits and hyphens, up to ${SLUG_MAX} characters.` };
      }
      return { ok: true, path: `/api/me/work/${slug}` };
    }
    case "recent": {
      if (args.length === 0) return { ok: true, path: "/api/me/recent" };
      const raw = args[0];
      const limit = /^\d+$/.test(raw) ? Number(raw) : NaN;
      if (args.length > 1 || !(limit >= LIMIT_MIN && limit <= LIMIT_MAX)) {
        return { ok: false, message: `The limit must be a whole number from ${LIMIT_MIN} to ${LIMIT_MAX}.` };
      }
      return { ok: true, path: `/api/me/recent?limit=${limit}` };
    }
    case "search": {
      const query = args.join(" ").trim();
      if (query.length < QUERY_MIN) return { ok: false, message: "Usage: /search <query>" };
      if (query.length > QUERY_MAX) {
        return { ok: false, message: `The query must be ${QUERY_MIN} to ${QUERY_MAX} characters.` };
      }
      return { ok: true, path: `/api/me/search?q=${encodeURIComponent(query)}` };
    }
    default:
      return { ok: false, message: "Unknown command. Type /help to see what is available." };
  }
}

const ENDPOINTS: ReadonlyArray<readonly [string, string]> = [
  ["GET /api/me", "Index of endpoints."],
  ["GET /api/me/profile", "Name, headline, location, bio and links."],
  ["GET /api/me/experience", "Roles, newest first."],
  ["GET /api/me/work/{slug}", "One role."],
  ["GET /api/me/recent?limit=", `Newest notes, posts and projects. limit ${LIMIT_MIN} to ${LIMIT_MAX}.`],
  ["GET /api/me/projects", "Side projects."],
  ["GET /api/me/search?q=&limit=", `Search. q is ${QUERY_MIN} to ${QUERY_MAX} characters.`],
  ["GET /api/me/contact", "Contact links."]
];

/** Output for commands that do not call the API. `origin` is window.location.origin. */
export function localOutput(name: string, origin: string): Block[] | null {
  switch (name) {
    case "help":
      return [
        { type: "heading", text: "Commands" },
        { type: "list", items: COMMANDS.map((command) => ({ title: command.usage, detail: command.description })) }
      ];
    case "resume":
      return [{ type: "list", items: [{ title: "Open the resume", href: "/Resume" }] }];
    case "api":
      return [
        { type: "heading", text: "JSON API" },
        { type: "text", text: "Read-only, public, no key needed. Try it:" },
        { type: "code", text: `curl ${origin}/api/me/experience` },
        { type: "rows", rows: ENDPOINTS.map(([key, value]) => ({ key, value })) }
      ];
    case "mcp":
      return [
        { type: "heading", text: "MCP server" },
        { type: "text", text: "Add this site as a read-only MCP server in your client:" },
        { type: "code", text: `claude mcp add --transport http rishi ${origin}/api/mcp`, copyable: true }
      ];
    default:
      return null;
  }
}
