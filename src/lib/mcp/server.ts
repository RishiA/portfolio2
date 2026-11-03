import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ToolAnnotations } from "@modelcontextprotocol/sdk/types.js";
import { noteUrl } from "@/lib/api/respond";
import {
  getContact,
  getExperience,
  getProfile,
  getProjects,
  getRecent,
  getWorkItem,
  searchContent
} from "@/lib/profile";
import { LIMIT_DEFAULT, LIMIT_MAX, LIMIT_MIN, limitSchema, querySchema, slugSchema } from "@/lib/profile/validation";
import packageJson from "../../../package.json";

const READ_ONLY: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false
};

const limitInput = limitSchema
  .default(LIMIT_DEFAULT)
  .describe(`Number of results, ${LIMIT_MIN} to ${LIMIT_MAX}. Defaults to ${LIMIT_DEFAULT}.`);

function result(structuredContent: Record<string, unknown>): CallToolResult {
  return { content: [{ type: "text", text: JSON.stringify(structuredContent) }], structuredContent };
}

function items<T>(list: T[]): Record<string, unknown> {
  return { items: list };
}

export function createProfileMcpServer(): McpServer {
  const server = new McpServer({ name: "rishi", version: packageJson.version ?? "1.0.0" });

  server.registerTool(
    "get_profile",
    {
      title: "Get profile",
      description: "Rishi Athanikar's name, headline, location, bio and links.",
      annotations: READ_ONLY
    },
    async () => result({ ...getProfile() })
  );

  server.registerTool(
    "get_experience",
    {
      title: "Get experience",
      description: "Roles, newest first. Each role includes the url of its note.",
      annotations: READ_ONLY
    },
    async () => result(items(getExperience().map((entry) => ({ ...entry, url: noteUrl(entry.workSlug) }))))
  );

  server.registerTool(
    "get_work_item",
    {
      title: "Get work item",
      description: "One work item (a past role or engagement) by slug. Slugs come from get_experience.",
      inputSchema: { slug: slugSchema.describe("Lowercase letters, digits and hyphens.") },
      annotations: READ_ONLY
    },
    async ({ slug }) => {
      const item = getWorkItem(slug);
      if (!item) return { isError: true, content: [{ type: "text", text: "No work item with that slug." }] };
      return result({ ...item, url: noteUrl(item.slug) });
    }
  );

  server.registerTool(
    "get_recent",
    {
      title: "Get recent content",
      description: "Newest notes, posts and projects.",
      inputSchema: { limit: limitInput },
      annotations: READ_ONLY
    },
    async ({ limit }) => result(items(await getRecent(limit)))
  );

  server.registerTool(
    "get_projects",
    {
      title: "Get projects",
      description: "Side projects. Each project includes the url of its note.",
      annotations: READ_ONLY
    },
    async () => result(items(getProjects().map((project) => ({ ...project, url: noteUrl(project.slug) }))))
  );

  server.registerTool(
    "search_content",
    {
      title: "Search content",
      description: "Search titles, tags and excerpts of notes, posts, projects and work.",
      inputSchema: { query: querySchema.describe("Text to search for."), limit: limitInput },
      annotations: READ_ONLY
    },
    async ({ query, limit }) => result(items(await searchContent(query, limit)))
  );

  server.registerTool(
    "get_contact",
    {
      title: "Get contact links",
      description: "Ways to contact Rishi.",
      annotations: READ_ONLY
    },
    async () => result(items(getContact()))
  );

  return server;
}
