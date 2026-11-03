import { handle, ok, OPTIONS } from "@/lib/api/respond";
import { LIMIT_DEFAULT, LIMIT_MAX, QUERY_MAX, SLUG_MAX } from "@/lib/profile/validation";

export const dynamic = "force-static";
export const revalidate = 60;

const index = {
  description: "Read-only JSON API for Rishi Athanikar's portfolio. All data is public.",
  mcp: "/api/mcp",
  endpoints: [
    { path: "/api/me", method: "GET", description: "This index." },
    { path: "/api/me/profile", method: "GET", description: "Name, headline, location, bio and links." },
    { path: "/api/me/experience", method: "GET", description: "Roles, newest first, each with a link to its note." },
    {
      path: "/api/me/work/{slug}",
      method: "GET",
      description: "One work item.",
      params: { slug: `Lowercase letters, digits and hyphens, up to ${SLUG_MAX} characters.` }
    },
    {
      path: "/api/me/recent",
      method: "GET",
      description: "Newest notes, posts and projects.",
      params: { limit: `Optional integer from 1 to ${LIMIT_MAX}. Defaults to ${LIMIT_DEFAULT}.` }
    },
    { path: "/api/me/projects", method: "GET", description: "Projects, each with a link to its note." },
    {
      path: "/api/me/search",
      method: "GET",
      description: "Search titles, tags and excerpts.",
      params: {
        q: `Required. 1 to ${QUERY_MAX} characters.`,
        limit: `Optional integer from 1 to ${LIMIT_MAX}. Defaults to ${LIMIT_DEFAULT}.`
      }
    },
    { path: "/api/me/contact", method: "GET", description: "Contact links." }
  ]
};

export const GET = handle(() => ok(index));
export { OPTIONS };
