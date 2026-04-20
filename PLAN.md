# PLAN.md — bibue-1 Vite→Next.js Migration

**Owner:** Louis Tenant de La Tour
**Branch:** `next-migration`
**Goal:** Rewrite the production bibue-1 app from Vite+React+React Router to Next.js 16 App Router, preserving bibue.net's existing visual design with selective polish + micro/macro animations. Merge to `main` only at feature-parity.

## Phases

### Phase 1 — Foundation (current)
- [x] Clone repo, create branch, archive Vite config
- [x] Install Next.js 16 + React 19 + Tailwind 4 + framer-motion
- [x] Port design tokens from v1's `index.css` to new `src/app/globals.css` with Tailwind 4 `@theme`
- [x] `src/app/layout.tsx` with Cinzel + Inter + metadata
- [x] Supabase SSR clients + proxy middleware
- [x] Nav component with theme toggle
- [ ] HeroSection (in-flight agent)
- [ ] MangaCard + MangaCarousel (in-flight agent)
- [ ] Home page composition with placeholder data (in-flight agent)
- [ ] Scripts + husky + CI + tsconfig (in-flight agent)
- [ ] Integration review + build verification
- [ ] Commit + push

**Acceptance:** `npm run dev` → `http://localhost:3000` shows home page with v1's design, Nav, hero with animations, 4 carousel sections of placeholder manga. `npm run build` succeeds.

### Phase 2 — Data layer (AniList + Supabase)
- [ ] Port `src/lib/api.ts` (AniList GraphQL queries) — works as-is in RSC
- [ ] Port `src/hooks/use*ManhwaData.ts` etc. — add `"use client"` where needed
- [ ] Convert top-fold fetches to Server Components (RSC fetch AniList → stream to client)
- [ ] Replace placeholder data in home page with real AniList fetches
- [ ] Cache strategy: RSC `cache: 'force-cache'` with revalidation, plus React Query for client-side updates
- [ ] Generate Supabase types from production schema → `src/lib/supabase/types.generated.ts`
- [ ] Update client/server Supabase wrappers to use typed client

**Acceptance:** Home page shows real manga cover art from AniList. Page is SSR'd, first paint <1s on good connection.

### Phase 3 — Auth + core routes
- [ ] Port `src/contexts/AuthContext.tsx` — adapt for App Router (use Supabase SSR in layout, not context)
- [ ] `/sign-in`, `/sign-up`, `/auth/callback` routes
- [ ] Port `/account`, `/settings` pages
- [ ] Port `/manga/[slug]` detail page
- [ ] Port `/read/[chapter_id]` reader page
- [ ] Middleware (proxy.ts) — enforce auth on protected routes

**Acceptance:** User can sign up, sign in, view a manga detail page, start reading a chapter.

### Phase 4 — Discovery surfaces
- [ ] `/manga` browse page
- [ ] `/anime` browse page
- [ ] `/classics`, `/originals`, `/rankings` pages
- [ ] Search page
- [ ] Filter system

**Acceptance:** Complete discovery flow — browse → filter → read.

### Phase 5 — Billing
- [ ] Port Stripe setup from v3 (already have products created + IDs)
- [ ] `/pricing` page
- [ ] `/api/checkout` route
- [ ] `/api/webhooks/stripe` route
- [ ] Apply schema migrations (profiles, subscriptions, stripe_events) to prod Supabase
- [ ] `/account` shows subscription state

**Acceptance:** User can subscribe Premium via Stripe Checkout, see tier on /account, cancel via portal.

### Phase 6 — Creator + admin
- [ ] Port creator dashboard
- [ ] Port admin dashboard
- [ ] Studio upload surface (for M3 AI generation later)

### Phase 7 — i18n + secondary surfaces
- [ ] Port i18n system for 10 languages
- [ ] Port community, messages, watchlist pages
- [ ] Offline/PWA support

### Phase 8 — Cutover
- [ ] Preview deploy of `next-migration` to `next.bibue.net`
- [ ] User QA on preview — compare to production feature-by-feature
- [ ] Merge `next-migration` → `main`
- [ ] Deploy to bibue.net (replacing Vite)
- [ ] Monitor, rollback-ready for 48h

## Parallel execution strategy

Break each phase into bounded file-scope tasks. Spawn N parallel Claude agents with explicit, non-overlapping file targets. Parent session reviews + integrates outputs. Commit in checkpoints.

Guidelines:
- Each agent gets one narrow job (e.g., "port MangaCard with these exact props" or "build /sign-in page")
- Agents never modify the same file
- Agents share conventions via CLAUDE.md (each reads on task start)
- After agents finish, parent runs `npm run typecheck` + `npm run build`, fixes integration issues, commits

## Security gates (non-negotiable, every PR)

- [x] Pre-commit hook: typecheck + build + `</tag>tag>` corruption grep + secret pattern grep
- [x] CI: typecheck + build + same greps on push/PR
- [ ] Branch protection on `main` requires CI green + PR review
- [ ] No `SUPABASE_SERVICE_ROLE_KEY` in client-invoked routes
- [ ] Zod validation + rate limits on every API route
- [ ] CSP + HSTS in `next.config.ts` headers

## Abort conditions per phase

- Build fails twice in a row on same error → stop, diagnose
- Production data mutation attempted → stop, require explicit approval
- Browser-side client code imports service role key → hard block (pre-commit catches)
- Git history shows files I didn't touch → stop, investigate
- Agent output quality drops (e.g., hallucinated APIs) → revert + retry with tighter scope
