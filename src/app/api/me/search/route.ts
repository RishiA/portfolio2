import { fail, handle, ok, OPTIONS } from "@/lib/api/respond";
import { searchContent } from "@/lib/profile";
import { parseLimit, parseQuery } from "@/lib/profile/validation";

export const GET = handle(async (request: Request) => {
  const params = new URL(request.url).searchParams;
  const query = parseQuery(params.get("q"));
  if (!query.ok) return fail("invalid_request", query.message);
  const limit = parseLimit(params.get("limit"));
  if (!limit.ok) return fail("invalid_request", limit.message);
  return ok(await searchContent(query.value, limit.value));
});
export { OPTIONS };
