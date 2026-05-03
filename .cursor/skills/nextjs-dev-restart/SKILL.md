---
name: nextjs-dev-restart
description: >-
  Restart the Next.js dev server cleanly to prevent corrupted .next state in the
  portfolio2 repo. Use after finishing any feature, bug fix, dependency change,
  config change (next.config.ts, tsconfig.json, package.json), or when the user
  reports symptoms like "Internal Server Error", "Cannot find module './XXXX.js'",
  ENOENT on .pack.gz/vendor-chunks files, unstyled pages with default browser
  styles, /_next/static/css 404 with HTML 200, blank pages, or "blue underlined
  links". Always use this — never tell the user to run cleanup commands manually.
---

# Next.js dev restart (portfolio2)

This repo's `next dev` cache (`.next/`) corrupts easily when:

- A second `next dev` or `next build` runs while the first is still alive
- Big edits land while dev is hot-reloading (especially layout/header/CSS)
- The user switches branches with active dev running

Symptoms of a corrupted `.next/`:

- `Cannot find module './4687.js'` / `'./8117.js'`
- `ENOENT` on `.next/cache/webpack/**/*.pack.gz`
- `ENOENT` on `.next/server/vendor-chunks/lucide-react@*.js`
- `Internal Server Error` on a page that builds fine in production
- Page returns `200` but `/_next/static/css/app/layout.css` returns `404` → unstyled, default fonts/blue links
- `__webpack_modules__[moduleId] is not a function`

## Trigger this skill automatically

Run the workflow below **without asking** at any of these points:

1. **After a substantive change is committed or about to be tested**:
   - New component, route, layout, or page
   - Edits to `src/app/layout.tsx`, `src/app/globals.css`, header/footer/nav
   - `next.config.ts`, `tsconfig.json`, `package.json` changes (deps, scripts, allowedDevOrigins, env, etc.)
   - Theme provider, font imports, image config
2. **The first time the user reports any symptom above** (do not retry the same broken server).
3. **Before running Playwright e2e** so tests don't attach to a stale dev.

Do not tell the user "run pnpm dev:clean" or "kill 3000 yourself". Run the steps yourself in the agent shell.

## Workflow

Run as a single sequential block in the project root (`/Users/rishi.athanikar/Documents/Github/portfolio2`):

```bash
pkill -9 -f "next dev" 2>/dev/null
pkill -9 -f "next-server" 2>/dev/null
sleep 2
lsof -iTCP:3000 -sTCP:LISTEN -n -P 2>/dev/null || echo "3000 clear"
rm -rf .next node_modules/.cache
pnpm exec next dev --hostname 127.0.0.1 --port 3000
```

Run the `pnpm exec next dev` step as a **backgrounded shell** (`block_until_ms: 0`), then `AwaitShell` until the output matches `Ready` (allow up to 45s for cold start).

## Verify the server is actually serving styled pages

A `200` on `/` does **not** mean the build is healthy — CSS can still be `404`.
After `Ready`, run this check:

```bash
CSS=$(curl -sS "http://127.0.0.1:3000/" | grep -oE '/_next/static/css/[^"]*' | head -1)
curl -sS -o /dev/null -w "css: %{http_code}\nhome: " "http://127.0.0.1:3000${CSS}"
curl -sS -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3000/"
```

Both must be `200`. If `css: 404`, repeat the workflow once. If still `404`, escalate — do not pretend it's working.

## Avoid the footguns that caused this

- **No `prebuild` hook that wipes `.next`.** Wiping the build dir while `next dev` is running is what created the `4687.js` / `vendor-chunks/lucide-react` errors. The `package.json` in this repo intentionally has no `prebuild`.
- **Do not run `pnpm build` while `pnpm dev` is alive on port 3000.** Stop dev first.
- **Do not start a second `pnpm dev`.** `pnpm dev` in this repo already runs `rm -rf .next` first; running it twice in parallel re-creates the race.
- **`next.config.ts` `allowedDevOrigins`** is set to `["127.0.0.1", "localhost", "::1"]` — leave it as hostnames, not full URLs.

## Commit and PR boundary

If you committed during a session, run this workflow **after the commit** before declaring the work done. The user has been burned multiple times by "I committed it" handoffs that left a broken dev server behind.
