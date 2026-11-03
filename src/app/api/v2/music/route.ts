import { handle, ok, OPTIONS } from "@/lib/api/respond";
import { getPlaylists } from "@/lib/sanity/playlist-loaders";

export const revalidate = 3600;

export const GET = handle(async () => ok(await getPlaylists()));
export { OPTIONS };
