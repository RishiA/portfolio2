import { describe, expect, it } from "vitest";
import { autocomplete, resolveEnter } from "@/lib/terminal/autocomplete";
import { parseInput, tokenize } from "@/lib/terminal/parse";
import { CommandHistory, HISTORY_LIMIT } from "@/lib/terminal/history";

describe("tokenize and parseInput", () => {
  it("splits on whitespace and trims", () => {
    expect(parseInput("   /work   rho-fintech  ")).toEqual({ ok: true, name: "work", args: ["rho-fintech"] });
  });

  it("lowercases the command name only", () => {
    expect(parseInput("/Search Foo")).toEqual({ ok: true, name: "search", args: ["Foo"] });
  });

  it("keeps quoted arguments together", () => {
    expect(parseInput('/search "design systems" extra')).toEqual({ ok: true, name: "search", args: ["design systems", "extra"] });
    expect(tokenize("a 'b c' d")).toEqual(["a", "b c", "d"]);
    expect(tokenize('a ""')).toEqual(["a", ""]);
  });

  it("treats an unclosed quote as running to the end", () => {
    expect(tokenize('"open ended')).toEqual(["open ended"]);
  });

  it("flags empty and non-slash input", () => {
    expect(parseInput("   ")).toMatchObject({ ok: false, reason: "empty" });
    expect(parseInput("hello")).toMatchObject({ ok: false, reason: "not-command", raw: "hello" });
    expect(parseInput("/")).toMatchObject({ ok: false, reason: "not-command" });
  });
});

describe("autocomplete", () => {
  it("lists every command for a bare slash", () => {
    const labels = autocomplete("/").map((item) => item.label);
    expect(labels).toContain("/help");
    expect(labels).toContain("/work <slug>");
    expect(labels.length).toBeGreaterThanOrEqual(12);
  });

  it("filters command names by prefix, case-insensitively", () => {
    expect(autocomplete("/ex").map((item) => item.value)).toEqual(["/experience"]);
    expect(autocomplete("/PRO").map((item) => item.value)).toEqual(["/profile", "/projects"]);
  });

  it("adds a trailing space only for commands that take arguments", () => {
    expect(autocomplete("/wor")[0]).toMatchObject({ value: "/work ", needsArgument: true });
    expect(autocomplete("/rec")[0]).toMatchObject({ value: "/recent ", needsArgument: false });
    expect(autocomplete("/hel")[0]).toMatchObject({ value: "/help", needsArgument: false });
  });

  it("suggests work slugs after /work", () => {
    const slugs = ["rho-fintech", "stash-invest", "rho-cards"];
    expect(autocomplete("/work ", slugs).map((item) => item.value)).toEqual([
      "/work rho-fintech",
      "/work stash-invest",
      "/work rho-cards"
    ]);
    expect(autocomplete("/work rho", slugs).map((item) => item.label)).toEqual(["rho-fintech", "rho-cards"]);
    expect(autocomplete("/work zzz", slugs)).toEqual([]);
  });

  it("offers nothing for plain text or other commands' arguments", () => {
    expect(autocomplete("hello")).toEqual([]);
    expect(autocomplete("/search ab", ["ab"])).toEqual([]);
    expect(autocomplete("/nope")).toEqual([]);
  });

  it("resolveEnter runs when complete, completes when an argument is needed", () => {
    const [work] = autocomplete("/wor");
    expect(resolveEnter("/wor", work)).toEqual({ action: "complete", value: "/work " });
    const [experience] = autocomplete("/ex");
    expect(resolveEnter("/ex", experience)).toEqual({ action: "run", value: "/experience" });
    expect(resolveEnter("/experience", experience)).toEqual({ action: "run", value: "/experience" });
  });
});

describe("CommandHistory", () => {
  it("walks back and forward and restores the draft", () => {
    const history = new CommandHistory();
    history.push("/a");
    history.push("/b");
    expect(history.previous("draft")).toBe("/b");
    expect(history.previous("ignored")).toBe("/a");
    expect(history.previous("ignored")).toBe("/a");
    expect(history.next()).toBe("/b");
    expect(history.next()).toBe("draft");
    expect(history.next()).toBeNull();
  });

  it("returns null with no history", () => {
    expect(new CommandHistory().previous("x")).toBeNull();
  });

  it("is bounded to 50 entries by default", () => {
    const history = new CommandHistory();
    for (let i = 0; i < HISTORY_LIMIT + 10; i += 1) history.push(`/c${i}`);
    expect(history.size).toBe(50);
    expect(history.toArray()[0]).toBe("/c10");
  });

  it("ignores blanks and consecutive duplicates", () => {
    const history = new CommandHistory();
    history.push("  ");
    history.push("/a");
    history.push("/a");
    expect(history.toArray()).toEqual(["/a"]);
  });
});
