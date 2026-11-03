import { fail, handle, noteUrl, ok, OPTIONS } from "@/lib/api/respond";
import { getWorkItem } from "@/lib/profile";
import { parseSlug } from "@/lib/profile/validation";

export const revalidate = 60;

export const GET = handle(async (_request: Request, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const parsed = parseSlug(slug);
  if (!parsed.ok) return fail("invalid_request", parsed.message);
  const item = getWorkItem(parsed.value);
  if (!item) return fail("not_found");
  return ok({ ...item, url: noteUrl(item.slug) });
});
export { OPTIONS };
