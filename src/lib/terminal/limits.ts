/** Mirrors src/lib/profile/validation.ts. Duplicated so zod stays out of the client bundle; a unit test keeps them equal. */
export const LIMIT_MIN = 1;
export const LIMIT_MAX = 25;
export const QUERY_MIN = 1;
export const QUERY_MAX = 200;
export const SLUG_MAX = 120;
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
