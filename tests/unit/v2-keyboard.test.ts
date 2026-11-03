import { describe, expect, it } from "vitest";
import { isEditableTarget, listKeyAction, nextRowIndex } from "@/components/v2/notes/keyboard";

const press = (key: string, target: EventTarget | null = document.body, mods: Partial<{ ctrlKey: boolean; metaKey: boolean; altKey: boolean }> = {}) => ({
  key,
  ctrlKey: false,
  metaKey: false,
  altKey: false,
  target,
  ...mods
});
const inList = { inList: true, inReader: false };

describe("listKeyAction", () => {
  it("maps j, k, arrows and slash", () => {
    expect(listKeyAction(press("j"), inList)).toBe("next");
    expect(listKeyAction(press("k"), inList)).toBe("prev");
    expect(listKeyAction(press("ArrowDown"), inList)).toBe("next");
    expect(listKeyAction(press("ArrowUp"), inList)).toBe("prev");
    expect(listKeyAction(press("/"), inList)).toBe("search");
  });

  it("ignores keys typed into inputs, textareas, selects and contenteditable", () => {
    for (const tag of ["input", "textarea", "select"]) {
      expect(listKeyAction(press("j", document.createElement(tag)), inList)).toBeNull();
      expect(listKeyAction(press("/", document.createElement(tag)), inList)).toBeNull();
    }
    const editable = document.createElement("div");
    editable.setAttribute("contenteditable", "true");
    expect(isEditableTarget(editable)).toBe(true);
    expect(listKeyAction(press("k", editable), inList)).toBeNull();
  });

  it("ignores modified keys and unrelated keys", () => {
    expect(listKeyAction(press("j", document.body, { metaKey: true }), inList)).toBeNull();
    expect(listKeyAction(press("/", document.body, { ctrlKey: true }), inList)).toBeNull();
    expect(listKeyAction(press("x"), inList)).toBeNull();
    expect(listKeyAction(press("Enter"), inList)).toBeNull();
  });

  it("leaves arrow keys alone outside the list and j/k alone inside the reader", () => {
    expect(listKeyAction(press("ArrowDown"), { inList: false, inReader: false })).toBeNull();
    expect(listKeyAction(press("j"), { inList: false, inReader: true })).toBeNull();
    expect(listKeyAction(press("j"), { inList: false, inReader: false })).toBe("next");
  });
});

describe("nextRowIndex", () => {
  it("starts at the first or last row when nothing is current", () => {
    expect(nextRowIndex("next", -1, 5)).toBe(0);
    expect(nextRowIndex("prev", -1, 5)).toBe(4);
  });

  it("clamps at both ends and handles an empty list", () => {
    expect(nextRowIndex("next", 4, 5)).toBe(4);
    expect(nextRowIndex("prev", 0, 5)).toBe(0);
    expect(nextRowIndex("next", 1, 5)).toBe(2);
    expect(nextRowIndex("next", -1, 0)).toBe(-1);
  });
});
