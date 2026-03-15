# Migration Plan: `RishiA.github.io` + Netlify/GitHub Pages -> `portfolio2` on Vercel

## Summary
This plan migrates `rishiathanikar.com` from the current stack (GitHub Pages + Netlify) to the new `portfolio2` Next.js site on Vercel, with staged cutover and rollback.
Locked decisions:
- Use a new production repo for `portfolio2`.
- Use Vercel as the only production host.
- Keep `rishiathanikar.com` serving the new site directly (no domain-level redirect elsewhere).
- Preserve key legacy URLs with redirects.
- Preserve Zoho mail delivery on the same domain.
- Use personal Vercel account ownership.

## Current State (Grounded)
- Existing public repo: `https://github.com/RishiA/RishiA.github.io`
- Current hosting/deploy: GitHub Pages + Netlify
- Domain DNS managed in Squarespace
- Existing repo contains legacy static structure and at least one `_redirects` rule:
  - `/Resume /Resume/Resume.pdf`

## Target State
- New codebase in dedicated repo (recommended: `RishiA/portfolio2`).
- Production deploy from Vercel linked to that repo.
- Domain mapping:
  - `rishiathanikar.com` (apex) -> Vercel
  - `www.rishiathanikar.com` -> redirect to apex (handled by Vercel domain settings)
- Notes/blog content managed in Sanity, rendered by Next.js app.
- Netlify and GitHub Pages no longer serving production traffic after verification.

## Important Interface / Config Changes
1. Repository architecture
- Keep old repo read-only/archive after cutover.
- New repo becomes source of truth for site.

2. DNS ownership
- Squarespace remains DNS provider.
- DNS records updated to Vercel targets.
- Do not remove Zoho MX/SPF/DKIM records.

3. Hosting
- Remove dependency on Netlify build/deploy and GitHub Pages publishing for production domain.
- Vercel handles build + runtime + edge routing.

4. Redirect contract
- `/Resume` → `/Resume/Resume.pdf` implemented in `next.config.ts` (permanent 301). ✅
- www → apex handled via Vercel domain settings (not Next.js).

## Pre-Phase: Code Prerequisites (Before Pushing to GitHub)

These must be done before Phase 1.

- [x] Add `/Resume` redirect to `next.config.ts`
- [x] Update `.env.example` to apex URL (`https://rishiathanikar.com`)
- [x] Update `src/content/playground.ts` liveUrl to apex
- [x] Confirm all dynamic pages have `description` + `og:image` metadata (SEO health)
- [x] Add try/catch to Sanity loaders (reliability)
- [x] Add `LINK_PREVIEW_SECRET` to `.env.example`

## Phase 0: Preflight and Risk Controls

### 0.1 Backups / snapshots
- Export and store:
  - Full Squarespace DNS zone screenshot/export (save as image + text copy).
  - Note current A record IP and CNAME targets.
  - Netlify site settings screenshot/export.
  - GitHub Pages settings screenshot/export.
- Create a migration checklist issue in new repo.

### 0.2 Security setup
- Enable 2FA on GitHub + Vercel.
- Use least-privilege tokens only.
- Keep all secrets in Vercel env vars; never commit secrets.
- Rotate any previously exposed API keys before production.

### 0.3 Rollback criteria
Define explicit rollback trigger:
- Homepage unavailable > 5 minutes after DNS propagation window.
- Major route failures (work/about/notes/blog) in production.
- Email delivery issues from Zoho checks.

## Phase 1: Stand Up New Production Repo

1. Create repo: `RishiA/portfolio2` (public or private based on preference).
2. Push local code from:
   - `/Users/rishi.athanikar/Documents/Github/portfolio2`
3. Protect `main`:
   - Require PRs (optional if solo, but recommended).
   - Require passing checks: lint/test/build (CI workflow is in `.github/workflows/ci.yml`).
4. Add repository docs:
   - Setup instructions.
   - Env vars list.
   - Deployment and rollback notes.

## Phase 2: App Hardening Before Cutover

### 2.1 Environment variable contract
Set in Vercel (Production + Preview as needed):
- `SANITY_PROJECT_ID`
- `SANITY_DATASET`
- `SANITY_API_VERSION`
- `SANITY_READ_TOKEN`
- `SANITY_WRITE_TOKEN` (only if needed by server mutation paths)
- `REVALIDATE_SECRET`
- `LINK_PREVIEW_SECRET`
- `NEXT_PUBLIC_SITE_URL` = `https://rishiathanikar.com` (apex, no www)

### 2.2 Redirects/legacy routes
Redirect from `next.config.ts` — already implemented:
- `/Resume` → `/Resume/Resume.pdf` (301 permanent)

### 2.3 SEO and crawl controls
- Ensure `robots.txt`, sitemap, canonical URLs, OpenGraph defaults are correct.
- Ensure no staging domain is canonicalized over production.
- Confirm `NEXT_PUBLIC_SITE_URL` is apex in Vercel production env vars.

### 2.4 Sanity readiness
- Validate Studio access and publish flow.
- Validate ISR/revalidation webhook endpoint security (`REVALIDATE_SECRET`).

### 2.5 Sanity Admin Pre-flight
- Log into Sanity dashboard → Settings → API → CORS origins.
- Add `https://rishiathanikar.com` and `https://www.rishiathanikar.com` to CORS allowlist.
- Add Vercel preview domain pattern (e.g., `*.vercel.app`) for Studio preview access.
- Add revalidation webhook: `https://rishiathanikar.com/api/revalidate?secret=<REVALIDATE_SECRET>`
  - Trigger: "on publish" for `note` and `blogPost` document types.
- Test webhook fires on preview Vercel URL **before** DNS cutover.

## Phase 3: Vercel Project Setup (No DNS Cutover Yet)

1. Import `RishiA/portfolio2` into Vercel.
2. Configure:
   - Framework: Next.js (auto-detected)
   - Install/build output defaults (Vercel defaults unless custom needed)
3. Add all env vars (see 2.1 above).
4. Deploy Preview and Production on Vercel default domain: `*.vercel.app`
5. Validate functionality on Vercel URL:
   - Home, About, Work list/detail, Notes, Blog
   - Theme toggle
   - Sanity-backed pages (or expected empty states)
   - `/Resume` redirect: `curl -I https://<project>.vercel.app/Resume` → expect 301
6. Validate Sanity publish → webhook → page update on `*.vercel.app` URL.

### 3.1 TTL Reduction Timing
- **24 hours before** planned DNS cutover: lower DNS TTL at Squarespace:
  - A record TTL: `300` (5 minutes)
  - CNAME TTL: `300` (5 minutes)
- After 48-72h stable on Vercel: raise TTL back to `3600` (1 hour).
- **Do not lower** MX/SPF/DKIM/DMARC record TTLs to avoid mail delivery disruption.

### 3.2 CI/CD
- GitHub Actions CI is in `.github/workflows/ci.yml`: runs lint, test, build on every PR and push to main.
- Enable required status checks on `main` branch before cutover to prevent broken deploys.

## Phase 4: Domain Attach + DNS Migration in Squarespace

### 4.1 Add domains in Vercel
- Add `rishiathanikar.com`
- Add `www.rishiathanikar.com`
- Set primary domain to apex (`rishiathanikar.com`)
- Configure Vercel to redirect `www` → apex (Vercel dashboard setting)

### 4.2 Update DNS at Squarespace
Use values Vercel provides in dashboard (authoritative at migration time). Typical pattern:
- Apex (`@`) A record(s) → Vercel target IP(s)
- `www` CNAME → Vercel CNAME target
- Keep existing Zoho records unchanged:
  - MX
  - SPF TXT
  - DKIM TXT/CNAME
  - DMARC TXT

### 4.3 HTTPS Cert Provisioning
- After pointing DNS to Vercel: wait **5-15 minutes** for Vercel's HTTPS cert to be provisioned.
- Do NOT declare cutover complete until `https://rishiathanikar.com` returns 200 with valid TLS.
- Vercel dashboard will show "Valid Configuration" when cert is ready.

## Phase 5: Cutover Verification (First 24h)

### 5.1 Functional checks
- `https://rishiathanikar.com` loads new portfolio.
- `https://www.rishiathanikar.com` redirects to apex.
- Core routes: `/`, `/about`, `/work`, `/notes`, `/blog`
- Legacy redirects: `curl -I https://rishiathanikar.com/Resume` → expect 301 to `/Resume/Resume.pdf`

### 5.2 CMS checks
- Publish one note + one blog post in Sanity.
- Confirm they appear on live site within ~60s (ISR revalidation).
- Confirm webhook-driven revalidation works.

### 5.3 Email checks (critical)
- Send/receive test with Zoho mailbox.
- Verify SPF/DKIM/DMARC alignment in headers.
- Confirm no MX drift occurred during DNS edits.

### 5.4 Observability
- Check Vercel deployment logs and function errors.
- Validate no sustained 404/500 spikes.
- Configure Vercel Analytics (built-in, zero-config) or add Sentry (`@sentry/nextjs`) for error tracking.
- Set up Vercel email alerts for error rate spikes (Vercel dashboard → Notifications).

## Phase 6: Decommission Legacy Hosting (After Stability Window)

After 48-72h stable production on Vercel:

1. Netlify:
   - Disable auto-deploy.
   - Optionally keep site as emergency backup for 1-2 weeks.
2. GitHub Pages:
   - Remove custom domain binding from old Pages config.
   - Disable Pages publish on old repo (or leave repo archived only).
3. Old repo:
   - Add README banner:
     - "Deprecated: production moved to `RishiA/portfolio2` on Vercel."
4. Raise DNS TTL back to `3600` if not already done.

## Rollback Plan (Executable)

Have the Phase 0 DNS snapshot open and ready before cutover begins.

1. In Squarespace DNS: restore A record to `[old-ip]` and CNAME to `[old-target]` (from snapshot).
2. Expected propagation with TTL=300: **5-10 minutes** globally.
3. Confirm old site responds at apex: `curl -I https://rishiathanikar.com`
4. Confirm Zoho mail: send test email within 15 minutes of rollback.
5. **Do not** remove Vercel project — keep live for debugging.
6. Fix blocking issue, run smoke checks on Vercel preview URL, then retry cutover.

Rollback SLO:
- DNS rollback initiated within 10 minutes of confirmed incident.
- Public recovery expected within DNS TTL window (5-10 min with TTL=300).

## Updated Execution Checklist

**Pre-Phase (Code Prerequisites — done before pushing to GitHub):**
- [x] Add `/Resume` redirect to `next.config.ts`
- [x] Update `.env.example` to apex URL (`https://rishiathanikar.com`)
- [x] Update `src/content/playground.ts` liveUrl to apex
- [x] All dynamic pages have `description` + `og:image` metadata
- [x] Try/catch added to Sanity loaders
- [x] `LINK_PREVIEW_SECRET` in `.env.example`

**Phase 0:**
- [ ] Screenshot full Squarespace DNS zone (save as image + text copy)
- [ ] Note current A record IP and CNAME targets
- [ ] Screenshot Netlify + GitHub Pages settings
- [ ] Enable 2FA on GitHub and Vercel

**Phase 1:**
- [ ] Create + push `RishiA/portfolio2`
- [ ] Protect `main` branch (require CI checks)

**Phase 2:**
- [ ] Set all env vars in Vercel (Production + Preview)
- [ ] Verify `NEXT_PUBLIC_SITE_URL=https://rishiathanikar.com` (apex, no www)
- [ ] Add Sanity CORS origins (`rishiathanikar.com`, `www.rishiathanikar.com`, `*.vercel.app`)
- [ ] Register Sanity webhook for ISR revalidation
- [ ] Test webhook on `*.vercel.app` preview URL

**Phase 3:**
- [ ] Import repo to Vercel; deploy to `*.vercel.app`
- [ ] Validate all routes (home, about, work, notes, blog, /studio)
- [ ] Validate Sanity publish → webhook → page update on `*.vercel.app`
- [ ] Verify `/Resume` redirect on Vercel preview URL
- [ ] Lower Squarespace DNS TTL to 300 (24h before planned cutover)

**Phase 4:**
- [ ] Add domains in Vercel: `rishiathanikar.com` + `www`
- [ ] Configure www → apex redirect in Vercel
- [ ] Update Squarespace A record to Vercel IPs
- [ ] Update Squarespace CNAME for www
- [ ] Keep all Zoho MX/SPF/DKIM/DMARC records unchanged
- [ ] Wait 5-15 min for Vercel HTTPS cert provisioning
- [ ] Confirm Vercel dashboard shows "Valid Configuration"

**Phase 5:**
- [ ] Confirm `https://rishiathanikar.com` loads new portfolio
- [ ] Confirm `https://www.rishiathanikar.com` redirects to apex
- [ ] Confirm `/Resume` redirect resolves correctly
- [ ] Publish one note + one blog post; confirm webhook revalidation
- [ ] Send/receive test email via Zoho
- [ ] Check Vercel logs for errors
- [ ] Enable Vercel Analytics or Sentry error monitoring
- [ ] Set up Vercel email alerts

**Phase 6 (after 48-72h stable):**
- [ ] Disable Netlify auto-deploy
- [ ] Remove custom domain binding from GitHub Pages
- [ ] Add deprecation banner to `RishiA/RishiA.github.io` README
- [ ] Raise DNS TTL back to `3600`

## Test Cases and Acceptance Scenarios

1. Infra
   - Vercel project linked to new repo; production deploy succeeds.
   - Domain verification passes in Vercel.

2. Routing
   - New site serves apex domain.
   - `www` redirects to apex.
   - `/Resume` redirect resolves correctly (301 → `/Resume/Resume.pdf`).

3. Content
   - Sanity publish flow works for first note and first blog post.
   - Revalidation updates content without full redeploy.

4. Email continuity
   - Zoho inbound/outbound mail unaffected after DNS change.

5. Security
   - No secrets committed.
   - 2FA enabled and deployment access scoped.

6. Rollback readiness
   - DNS snapshot confirmed before cutover.
   - Rollback procedure reviewed with TTL=300 propagation expectation.

## Assumptions
- Squarespace remains DNS host.
- You want apex canonical (`rishiathanikar.com`).
- You want to keep key legacy links operational.
- Zoho remains mail provider.
- No additional edge platform (Cloudflare) in front of Vercel for this migration.
