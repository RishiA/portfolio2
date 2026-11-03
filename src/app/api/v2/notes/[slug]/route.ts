import { NextResponse } from "next/server";
import { getNoteDetail } from "@/lib/profile";
import { parseSlug } from "@/lib/profile/validation";

export const revalidate = 60;

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const parsed = parseSlug(slug);
  if (!parsed.ok) return NextResponse.json({ error: "Invalid note." }, { status: 400 });

  try {
    const note = await getNoteDetail(parsed.value);
    if (!note) return NextResponse.json({ error: "Note not found." }, { status: 404 });
    return NextResponse.json({ note });
  } catch (error) {
    console.error("v2 note detail failed", error);
    return NextResponse.json({ error: "Could not load the note." }, { status: 500 });
  }
}
