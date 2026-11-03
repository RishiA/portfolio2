import { NextResponse } from "next/server";
import { getPhotos } from "@/lib/sanity/photo-loaders";

export const revalidate = 60;

export async function GET() {
  try {
    const data = await getPhotos();
    return NextResponse.json({ version: 1, data });
  } catch (error) {
    console.error("photos route failed", error);
    return NextResponse.json({ error: "Unable to load photos" }, { status: 500 });
  }
}
