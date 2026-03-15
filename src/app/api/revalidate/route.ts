import { timingSafeEqual } from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_PATHS = new Set(["/", "/notes", "/blog", "/work"]);

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const secretBuf = Buffer.from(secret ?? "");
  const expectedBuf = Buffer.from(expected);

  if (secretBuf.length !== expectedBuf.length || !timingSafeEqual(secretBuf, expectedBuf)) {
    return NextResponse.json({ ok: false, error: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const path = typeof body.path === "string" ? body.path : "/";

  if (!ALLOWED_PATHS.has(path)) {
    return NextResponse.json({ ok: false, error: "Path not allowed" }, { status: 400 });
  }

  revalidatePath(path);

  return NextResponse.json({ ok: true, revalidated: path, at: new Date().toISOString() });
}
