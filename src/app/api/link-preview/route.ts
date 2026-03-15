import { createClient } from "@sanity/client";
import { NextRequest, NextResponse } from "next/server";
import { fetchLinkPreview } from "@/lib/link-preview/fetch";

const PRIVATE_HOSTNAME_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^::1$/,
  /^fc[0-9a-f]{2}:/i,
  /^fd[0-9a-f]{2}:/i,
  /^localhost$/i,
  /^0\.0\.0\.0$/
];

function isPrivateHostname(hostname: string): boolean {
  return PRIVATE_HOSTNAME_PATTERNS.some((pattern) => pattern.test(hostname));
}

export async function POST(request: NextRequest) {
  const apiKey = request.headers.get("x-api-key");
  const expectedKey = process.env.LINK_PREVIEW_SECRET;

  if (!expectedKey || apiKey !== expectedKey) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json().catch(() => null);

  if (!payload || typeof payload.url !== "string") {
    return NextResponse.json({ ok: false, error: "Missing url" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(payload.url);
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { status: 400 });
  }

  if (isPrivateHostname(parsedUrl.hostname)) {
    return NextResponse.json({ ok: false, error: "Invalid url" }, { status: 400 });
  }

  const safeHostname = parsedUrl.hostname;

  try {
    const preview = await fetchLinkPreview(payload.url);

    if (
      payload.docId &&
      typeof payload.docId === "string" &&
      process.env.SANITY_PROJECT_ID &&
      process.env.SANITY_DATASET &&
      process.env.SANITY_WRITE_TOKEN
    ) {
      const client = createClient({
        projectId: process.env.SANITY_PROJECT_ID,
        dataset: process.env.SANITY_DATASET,
        apiVersion: process.env.SANITY_API_VERSION || "2025-01-01",
        token: process.env.SANITY_WRITE_TOKEN,
        useCdn: false
      });

      await client.patch(payload.docId).set(preview).commit();
    }

    return NextResponse.json({ ok: true, preview });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to fetch link preview",
        fallback: {
          url: payload.url,
          title: payload.url,
          siteName: safeHostname
        }
      },
      { status: 200 }
    );
  }
}
