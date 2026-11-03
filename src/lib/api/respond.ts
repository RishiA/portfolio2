export const API_VERSION = 1;

export type ApiErrorCode = "invalid_request" | "not_found" | "internal_error";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  invalid_request: 400,
  not_found: 404,
  internal_error: 500
};

const GENERIC_MESSAGES: Record<ApiErrorCode, string> = {
  invalid_request: "The request is not valid.",
  not_found: "Not found.",
  internal_error: "Something went wrong."
};

const CORS_ORIGIN = { "Access-Control-Allow-Origin": "*" };
const SUCCESS_CACHE = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

export function ok<T>(data: T): Response {
  return Response.json(
    { version: API_VERSION, data },
    { status: 200, headers: { ...CORS_ORIGIN, "Cache-Control": SUCCESS_CACHE } }
  );
}

/** `message` should be a short, generic sentence. Never pass error details or stack traces. */
export function fail(code: ApiErrorCode, message: string = GENERIC_MESSAGES[code]): Response {
  return Response.json(
    { version: API_VERSION, error: { code, message } },
    { status: STATUS_BY_CODE[code], headers: { ...CORS_ORIGIN, "Cache-Control": "no-store" } }
  );
}

export function preflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...CORS_ORIGIN,
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

export const OPTIONS = preflight;

/** Turns unexpected throws into a generic 500. */
export function handle<Args extends unknown[]>(
  handler: (...args: Args) => Response | Promise<Response>
): (...args: Args) => Promise<Response> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error("api error", error instanceof Error ? error.name : "unknown");
      return fail("internal_error");
    }
  };
}

export function noteUrl(slug: string): `/v2/notes/${string}` {
  return `/v2/notes/${slug}`;
}
