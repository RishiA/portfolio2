export type ParsedInput =
  | { ok: true; name: string; args: string[] }
  | { ok: false; reason: "empty" | "not-command"; raw: string };

/** Splits on whitespace. Single or double quotes group words; an unclosed quote runs to the end of the input. */
export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let inToken = false;
  let quote: string | null = null;
  for (const char of input) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === '"' || char === "'") {
      quote = char;
      inToken = true;
    } else if (/\s/.test(char)) {
      if (inToken) tokens.push(current);
      current = "";
      inToken = false;
    } else {
      current += char;
      inToken = true;
    }
  }
  if (inToken) tokens.push(current);
  return tokens;
}

export function parseInput(input: string): ParsedInput {
  const raw = input.trim();
  if (!raw) return { ok: false, reason: "empty", raw };
  if (!raw.startsWith("/")) return { ok: false, reason: "not-command", raw };
  const [head = "", ...args] = tokenize(raw.slice(1));
  const name = head.toLowerCase();
  if (!name) return { ok: false, reason: "not-command", raw };
  return { ok: true, name, args };
}
