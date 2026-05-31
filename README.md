# portfolio2

Personal site for Rishi Athanikar. Minimal editorial aesthetic. Next.js App Router rendering a small set of static pages and a Sanity-backed notes and blog.

Live at https://rishiathanikar.com.

## Stack

- Next.js 15 (App Router), React 19, TypeScript
- Sanity CMS, GROQ queries, Zod-validated mappers
- Vanilla CSS with CSS variables, `next-themes` for light/dark
- Crimson Pro (headings), Manrope (body), Shadows Into Light (handwritten greeting)
- Hosted on Vercel, DNS through Netlify, mail through Zoho
- pnpm, Vitest for unit tests, Playwright for end-to-end, GitHub Actions for CI

## Local development

```bash
pnpm install
cp .env.example .env.local   # fill in values
pnpm dev
```

Site runs at http://localhost:3000. Studio mounts at /studio.

## Project layout

```
src/
  app/             Routes (site pages, API handlers, embedded Studio)
  components/      UI primitives, portable-text renderer
  content/         Code-managed content (work, playground, about, home)
  lib/             Sanity client, GROQ queries, Zod mappers, link-preview utils
  sanity/          Sanity schema types
  types/           Shared TypeScript types
tests/
  unit/            Vitest
  e2e/             Playwright
```

## Content

Work, playground, about, and home live in `src/content/` and `src/app/`. Edit a file and ship.

Notes and blog posts are managed in Sanity Studio (mounted at `/studio`). New posts publish without a redeploy.

## Scripts

```bash
pnpm dev          Dev server
pnpm build        Production build
pnpm start        Run the production build locally
pnpm lint         Lint
pnpm test         Unit tests
pnpm test:e2e     End-to-end tests
```

## License

Personal project. Code is not licensed for reuse.
