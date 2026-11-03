import { COMMANDS } from "./commands";

export interface Suggestion {
  /** Text shown in the menu. */
  label: string;
  description?: string;
  /** The full input text after completing this suggestion. */
  value: string;
  /** True when the suggestion is a command that needs an argument, so Enter should complete rather than run. */
  needsArgument: boolean;
}

/**
 * Suggestions for the current input. While typing the first token, matching command names.
 * After `/work `, matching work slugs. Otherwise none.
 */
export function autocomplete(input: string, slugs: readonly string[] = []): Suggestion[] {
  if (!input.startsWith("/")) return [];
  const body = input.slice(1);

  if (!/\s/.test(body)) {
    const prefix = body.toLowerCase();
    return COMMANDS.filter((command) => command.name.startsWith(prefix)).map((command) => ({
      label: command.usage,
      description: command.description,
      value: command.args === "none" ? `/${command.name}` : `/${command.name} `,
      needsArgument: command.args === "required"
    }));
  }

  const match = /^work\s+(\S*)$/i.exec(body);
  if (!match) return [];
  const partial = match[1].toLowerCase();
  return slugs
    .filter((slug) => slug.startsWith(partial))
    .map((slug) => ({ label: slug, value: `/work ${slug}`, needsArgument: false }));
}

/** What Enter should do while the menu is open with `item` highlighted. */
export function resolveEnter(input: string, item: Suggestion): { action: "run" | "complete"; value: string } {
  const typed = input.trim();
  const chosen = item.value.trim();
  if (typed === chosen) return { action: "run", value: typed };
  if (item.needsArgument) return { action: "complete", value: item.value };
  return { action: "run", value: chosen };
}
