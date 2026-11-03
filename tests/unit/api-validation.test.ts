import { describe, expect, it } from "vitest";
import {
  LIMIT_DEFAULT,
  LIMIT_MAX,
  QUERY_MAX,
  SLUG_MAX,
  parseLimit,
  parseQuery,
  parseSlug
} from "@/lib/profile/validation";

describe("constants", () => {
  it("match the documented limits", () => {
    expect([LIMIT_DEFAULT, LIMIT_MAX, QUERY_MAX, SLUG_MAX]).toEqual([10, 25, 200, 120]);
  });
});

describe("parseLimit", () => {
  it("defaults when missing", () => {
    expect(parseLimit(null)).toEqual({ ok: true, value: 10 });
    expect(parseLimit(undefined)).toEqual({ ok: true, value: 10 });
  });
  it("accepts integers 1..25 as strings or numbers", () => {
    expect(parseLimit("1")).toEqual({ ok: true, value: 1 });
    expect(parseLimit("25")).toEqual({ ok: true, value: 25 });
    expect(parseLimit(7)).toEqual({ ok: true, value: 7 });
  });
  it.each(["0", "26", "abc", "2.5", "", "-1", " 3", "1e1", "0x5"])("rejects %j", (input) => {
    expect(parseLimit(input).ok).toBe(false);
  });
  it.each([0, 26, 2.5, NaN, Infinity])("rejects number %s", (input) => {
    expect(parseLimit(input).ok).toBe(false);
  });
});

describe("parseQuery", () => {
  it("trims", () => {
    expect(parseQuery("  rho ")).toEqual({ ok: true, value: "rho" });
  });
  it("accepts exactly the max length", () => {
    expect(parseQuery("a".repeat(QUERY_MAX)).ok).toBe(true);
  });
  it.each([null, undefined, "", "   ", "a".repeat(QUERY_MAX + 1)])("rejects %j", (input) => {
    expect(parseQuery(input as string | null).ok).toBe(false);
  });
});

describe("parseSlug", () => {
  it.each(["rho", "a-b-c", "abc123", "a1-2b"])("accepts %s", (slug) => {
    expect(parseSlug(slug)).toEqual({ ok: true, value: slug });
  });
  it("accepts exactly the max length", () => {
    expect(parseSlug("a".repeat(SLUG_MAX)).ok).toBe(true);
  });
  it.each(["", "Rho", "a_b", "-a", "a-", "a--b", "a b", "a/b", "../x", "a".repeat(SLUG_MAX + 1)])(
    "rejects %j",
    (slug) => {
      expect(parseSlug(slug).ok).toBe(false);
    }
  );
  it("rejects missing input", () => {
    expect(parseSlug(undefined).ok).toBe(false);
  });
});
