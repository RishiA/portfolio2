import { handle, ok, OPTIONS } from "@/lib/api/respond";
import { getProfile } from "@/lib/profile";

export const dynamic = "force-static";
export const revalidate = 60;

export const GET = handle(() => ok(getProfile()));
export { OPTIONS };
