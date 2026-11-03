import { z } from "zod";

export const LIMIT_DEFAULT = 10;
export const LIMIT_MIN = 1;
export const LIMIT_MAX = 25;
export const QUERY_MIN = 1;
export const QUERY_MAX = 200;
export const SLUG_MAX = 120;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INTEGER_PATTERN = /^\d+$/;

export const limitSchema = z
  .number()
  .int()
  .min(LIMIT_MIN)
  .max(LIMIT_MAX);

export const querySchema = z.string().trim().min(QUERY_MIN).max(QUERY_MAX);

export const slugSchema = z.string().min(1).max(SLUG_MAX).regex(SLUG_PATTERN);

export type ParseResult<T> = { ok: true; value: T } | { ok: false; message: string };

function toResult<T>(result: z.SafeParseReturnType<unknown, T>, message: string): ParseResult<T> {
  return result.success ? { ok: true, value: result.data } : { ok: false, message };
}

/** Missing or null input yields the default. Anything else must be an integer string or number in range. */
export function parseLimit(input: string | number | null | undefined): ParseResult<number> {
  const message = `limit must be an integer from ${LIMIT_MIN} to ${LIMIT_MAX}`;
  if (input === undefined || input === null) return { ok: true, value: LIMIT_DEFAULT };
  if (typeof input === "string" && !INTEGER_PATTERN.test(input)) return { ok: false, message };
  return toResult(limitSchema.safeParse(typeof input === "string" ? Number(input) : input), message);
}

export function parseQuery(input: string | null | undefined): ParseResult<string> {
  return toResult(querySchema.safeParse(input ?? ""), `q must be ${QUERY_MIN} to ${QUERY_MAX} characters`);
}

export function parseSlug(input: string | null | undefined): ParseResult<string> {
  return toResult(slugSchema.safeParse(input ?? ""), "slug is not valid");
}
