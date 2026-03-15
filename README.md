# Portfolio2

Minimal editorial personal site built with Next.js App Router + Sanity.

## Product Shape

- Home is linear and intentionally simple: greeting, portrait, short blurb, compact link row.
- Top nav is hidden on home and shown on subpages.
- Static pages: `work`, `about`, `playground`.
- Sanity pages: `notes`, `blog`.
- Theme toggle is icon-only light/dark.

## Typography

- Body/UI: `Source Serif 4`
- Handwritten greeting: `Caveat`

Font loading lives in:
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/app/layout.tsx`

## Content Ownership

Code-managed (in repo):
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/content/work.ts`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/content/playground.ts`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/app/(site)/about/page.tsx`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/app/(site)/page.tsx`

Sanity-managed:
- Notes (`note` schema)
- Blog (`blogPost` schema)

Fallback behavior:
- `/Users/rishi.athanikar/Documents/Github/portfolio2/src/content/fallback-notes.ts` stays intentionally empty.
- If Sanity env vars are missing, notes/blog show explicit empty states.

## Portrait Assets

Source and generated files:
- `/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-source.jpg`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-drawn-primary.png`

Optional variants:
- `/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-drawn-ai-1.png`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-drawn-ai-2.png`
- `/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-drawn-ai-3.png`

Home uses `rishi-drawn-primary.png`.

## True Image Generation (Key-Gated)

Before running image generation, verify key visibility in shell:

```bash
printenv OPENAI_API_KEY | wc -c
```

The check must be greater than `20`. If not, stop and set the key in the active shell.

Run identity-preserving edit generation with the exact prompt:

```bash
python3 /Users/rishi.athanikar/.codex/skills/imagegen/scripts/image_gen.py edit \
  --model gpt-image-1 \
  --image /Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-source.jpg \
  --use-case identity-preserve \
  --prompt "Loose pen and ink sketch with watercolor wash, portrait illustration, expressive cross-hatching, clear white background, editorial portrait style, traditional media, translucent watercolor shading, loose lines, architectural sketch style." \
  --quality high \
  --size 1024x1024 \
  --out-dir /Users/rishi.athanikar/Documents/Github/portfolio2/public/images
```

Generate 3-5 variants by repeating with small composition/style constraints, then set the chosen output as:

```text
/Users/rishi.athanikar/Documents/Github/portfolio2/public/images/rishi-drawn-primary.png
```

## Environment Variables

Copy `.env.example` to `.env.local` and set:

- `NEXT_PUBLIC_SITE_URL`
- `REVALIDATE_SECRET`
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `SANITY_WRITE_TOKEN`

## Local Development

```bash
pnpm install
pnpm dev
```

## Validation

```bash
pnpm lint
pnpm test
pnpm build
```

## Deploy (Vercel)

1. Import repo into Vercel.
2. Add env vars.
3. Configure Sanity webhook:

```text
https://<your-domain>/api/revalidate?secret=<REVALIDATE_SECRET>
```

4. Point `rishiathanikar.com` to Vercel.
