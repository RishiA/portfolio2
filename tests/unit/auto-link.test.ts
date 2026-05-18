import { describe, expect, it } from "vitest";
import { autoLinkBody } from "@/lib/portable-text/auto-link";
import type { PortableTextValue } from "@/types/content";

function block(text: string): PortableTextValue {
  return [
    {
      _type: "block",
      _key: "b1",
      style: "normal",
      children: [{ _type: "span", _key: "s1", text, marks: [] }],
      markDefs: []
    }
  ];
}

describe("autoLinkBody", () => {
  it("wraps a bare URL in a link mark", () => {
    const result = autoLinkBody(block("see https://example.com here"));
    const out = result[0];
    if (out._type !== "block") throw new Error("expected block");

    expect(out.children.map((c) => c.text)).toEqual([
      "see ",
      "https://example.com",
      " here"
    ]);

    const urlSpan = out.children[1];
    if (urlSpan._type !== "span") throw new Error("expected span");
    const linkKey = urlSpan.marks?.[0];
    expect(linkKey).toBeTruthy();
    const def = out.markDefs?.find((d) => d._key === linkKey);
    expect(def?._type).toBe("link");
    expect(def?.href).toBe("https://example.com");
  });

  it("strips trailing punctuation off detected URLs", () => {
    const result = autoLinkBody(block("see https://example.com."));
    const out = result[0];
    if (out._type !== "block") throw new Error("expected block");

    const linked = out.children.find(
      (c) => c._type === "span" && c.text === "https://example.com"
    );
    expect(linked).toBeTruthy();

    const period = out.children.find(
      (c) => c._type === "span" && c.text === "."
    );
    expect(period).toBeTruthy();
  });

  it("leaves spans alone when they already carry a link mark", () => {
    const input: PortableTextValue = [
      {
        _type: "block",
        _key: "b1",
        style: "normal",
        children: [
          { _type: "span", _key: "s1", text: "https://example.com", marks: ["m1"] }
        ],
        markDefs: [{ _key: "m1", _type: "link", href: "https://example.com" }]
      }
    ];

    const result = autoLinkBody(input);
    expect(result).toEqual(input);
  });

  it("passes through linkEmbed blocks untouched", () => {
    const input: PortableTextValue = [
      { _type: "linkEmbed", _key: "e1", url: "https://example.com", displayAs: "card" }
    ];
    const result = autoLinkBody(input);
    expect(result).toEqual(input);
  });

  it("handles multiple URLs in one span", () => {
    const result = autoLinkBody(block("a https://x.com and https://y.com end"));
    const out = result[0];
    if (out._type !== "block") throw new Error("expected block");

    const linkDefs = out.markDefs?.filter((d) => d._type === "link") ?? [];
    expect(linkDefs.map((d) => d.href).sort()).toEqual([
      "https://x.com",
      "https://y.com"
    ]);
  });
});
