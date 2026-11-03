import { fail, handle, ok, OPTIONS } from "@/lib/api/respond";
import { getRecent } from "@/lib/profile";
import { parseLimit } from "@/lib/profile/validation";

export const GET = handle(async (request: Request) => {
  const limit = parseLimit(new URL(request.url).searchParams.get("limit"));
  if (!limit.ok) return fail("invalid_request", limit.message);
  return ok(await getRecent(limit.value));
});
export { OPTIONS };
