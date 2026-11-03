// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/profile", () => ({
  getNoteList: vi.fn(),
  getNoteDetail: vi.fn()
}));

import { getNoteDetail, getNoteList } from "@/lib/profile";
import { GET as listNotes } from "@/app/api/v2/notes/route";
import { GET as readNote } from "@/app/api/v2/notes/[slug]/route";
import { aboutDetail, fixtureItems } from "./v2-notes-fixtures";

const request = new Request("http://localhost/api/v2/notes");
const slugParams = (slug: string) => ({ params: Promise.resolve({ slug }) });

beforeEach(() => {
  vi.spyOn(console, "error").mockImplementation(() => {});
  vi.mocked(getNoteList).mockReset();
  vi.mocked(getNoteDetail).mockReset();
});

describe("GET /api/v2/notes", () => {
  it("returns the note list", async () => {
    vi.mocked(getNoteList).mockResolvedValue(fixtureItems);
    const response = await listNotes();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ notes: fixtureItems });
  });

  it("returns a generic error when loading fails", async () => {
    vi.mocked(getNoteList).mockRejectedValue(new Error("sanity token abc123 rejected"));
    const response = await listNotes();
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(JSON.stringify({ error: "Could not load notes." }));
    expect(text).not.toContain("abc123");
  });
});

describe("GET /api/v2/notes/[slug]", () => {
  it("returns the note detail", async () => {
    vi.mocked(getNoteDetail).mockResolvedValue(aboutDetail);
    const response = await readNote(request, slugParams("about-me"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ note: aboutDetail });
    expect(getNoteDetail).toHaveBeenCalledWith("about-me");
  });

  it("returns 404 for an unknown note", async () => {
    vi.mocked(getNoteDetail).mockResolvedValue(null);
    const response = await readNote(request, slugParams("nope"));
    expect(response.status).toBe(404);
    expect(await response.json()).toEqual({ error: "Note not found." });
  });

  it("returns 400 for a malformed slug without loading anything", async () => {
    const response = await readNote(request, slugParams("../etc/passwd"));
    expect(response.status).toBe(400);
    expect(getNoteDetail).not.toHaveBeenCalled();
  });

  it("returns a generic error when loading fails", async () => {
    vi.mocked(getNoteDetail).mockRejectedValue(new Error("db password leaked"));
    const response = await readNote(request, slugParams("about-me"));
    expect(response.status).toBe(500);
    const text = await response.text();
    expect(text).toBe(JSON.stringify({ error: "Could not load the note." }));
    expect(text).not.toContain("leaked");
  });
});
