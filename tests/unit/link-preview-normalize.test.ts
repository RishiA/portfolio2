import { describe, expect, it } from "vitest";
import { normalizeLinkPreview } from "@/lib/link-preview/normalize";

describe("normalizeLinkPreview", () => {
  it("keeps required URL and trims text fields", () => {
    const preview = normalizeLinkPreview({
      url: "https://example.com",
      title: "   Example title   ",
      description: "  Example description  "
    });

    expect(preview.url).toBe("https://example.com");
    expect(preview.title).toBe("Example title");
    expect(preview.description).toBe("Example description");
  });

  it("throws when URL is invalid", () => {
    expect(() => normalizeLinkPreview({ url: "notaurl" })).toThrow();
  });
});
