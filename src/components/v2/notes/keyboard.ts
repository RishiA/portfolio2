export type ListKeyAction = "next" | "prev" | "search";

interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  target: EventTarget | null;
}

export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof (target as Element).tagName !== "string") return false;
  const element = target as HTMLElement;
  const tag = element.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return element.isContentEditable === true || element.getAttribute?.("contenteditable") === "true";
}

/**
 * Maps a key press to a list action. Returns null when the press should be left alone: modifier keys,
 * editable targets, and arrow keys outside the list (they scroll the page there). Enter is not handled
 * because rows are links and the browser already opens the focused one.
 */
export function listKeyAction(event: KeyLike, context: { inList: boolean; inReader: boolean }): ListKeyAction | null {
  if (event.ctrlKey || event.metaKey || event.altKey) return null;
  if (isEditableTarget(event.target)) return null;
  switch (event.key) {
    case "/":
      return "search";
    case "j":
      return context.inReader ? null : "next";
    case "k":
      return context.inReader ? null : "prev";
    case "ArrowDown":
      return context.inList ? "next" : null;
    case "ArrowUp":
      return context.inList ? "prev" : null;
    default:
      return null;
  }
}

/** Index to focus after a move. With nothing focused, "next" starts at the first row and "prev" at the last. */
export function nextRowIndex(action: "next" | "prev", current: number, count: number): number {
  if (count === 0) return -1;
  if (current < 0) return action === "next" ? 0 : count - 1;
  return action === "next" ? Math.min(count - 1, current + 1) : Math.max(0, current - 1);
}
