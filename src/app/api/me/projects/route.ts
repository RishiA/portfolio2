import { handle, noteUrl, ok, OPTIONS } from "@/lib/api/respond";
import { getProjects } from "@/lib/profile";

export const dynamic = "force-static";
export const revalidate = 60;

export const GET = handle(() => ok(getProjects().map((project) => ({ ...project, url: noteUrl(project.slug) }))));
export { OPTIONS };
