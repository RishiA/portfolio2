import { handle, noteUrl, ok, OPTIONS } from "@/lib/api/respond";
import { getExperience } from "@/lib/profile";

export const dynamic = "force-static";
export const revalidate = 60;

export const GET = handle(() => ok(getExperience().map((entry) => ({ ...entry, url: noteUrl(entry.workSlug) }))));
export { OPTIONS };
