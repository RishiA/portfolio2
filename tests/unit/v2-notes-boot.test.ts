// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/profile", () => ({
  getNoteList: vi.fn(),
  getNoteDetail: vi.fn()
}));

import { getNoteDetail, getNoteList } from "@/lib/profile";
import { loadNotesBoot } from "@/lib/v2/notes/boot";
import { aboutDetail, fixtureItems, workDetail } from "./v2-notes-fixtures";

beforeEach(() => {
  vi.mocked(getNoteList).mockResolvedValue(fixtureItems);
  vi.mocked(getNoteDetail).mockReset();
});

describe("loadNotesBoot", () => {
  it("loads the default note when the URL names none", async () => {
    vi.mocked(getNoteDetail).mockResolvedValue(aboutDetail);
    const boot = await loadNotesBoot();
    expect(getNoteDetail).toHaveBeenCalledWith("about-me");
    expect(boot).toEqual({ initialNoteSlug: undefined, initialNotes: fixtureItems, initialNote: aboutDetail });
  });

  it("loads the note named in the URL", async () => {
    vi.mocked(getNoteDetail).mockResolvedValue(workDetail);
    const boot = await loadNotesBoot("rho");
    expect(getNoteDetail).toHaveBeenCalledWith("rho");
    expect(boot.initialNoteSlug).toBe("rho");
    expect(boot.initialNote).toBe(workDetail);
  });

  it("leaves the note undefined for an unknown slug", async () => {
    vi.mocked(getNoteDetail).mockResolvedValue(null);
    expect((await loadNotesBoot("nope")).initialNote).toBeUndefined();
  });
});
