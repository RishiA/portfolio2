import { NextResponse } from "next/server";
import { getNoteList } from "@/lib/profile";

export const revalidate = 60;

export async function GET() {
  try {
    const notes = await getNoteList();
    return NextResponse.json({ notes });
  } catch (error) {
    console.error("v2 notes list failed", error);
    return NextResponse.json({ error: "Could not load notes." }, { status: 500 });
  }
}
