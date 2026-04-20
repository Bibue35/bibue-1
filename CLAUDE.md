# CLAUDE.md — Bibue (next-migration branch)

**Standing context. Loaded automatically at every session. Read HANDOFF.md next.**

## What this is

`Bibue35/bibue-1` on branch `next-migration`. Active work: migrating the Vite + React production app (serves bibue.net) to Next.js 16 App Router, preserving the Lovable UI design language with selective polish.

**main branch** = production Vite app, live on bibue.net. DO NOT TOUCH.
**next-migration** = the rewrite, in progress. Will replace main when feature-complete.

## Stack (this branch)

- Next.js 16 App Router (public, not any "custom fork")
- React 19
- TypeScript 5
- Tailwind CSS 4 (with `@theme` directive in `globals.css`, not a v3 config file)
- Supabase (existing production project `dsquhilpqcwqydsfhooi` — BE CAREFUL, real user data)
- framer-motion for animations
- @supabase/ssr for SSR auth
- Existing v1 components in `src/components/*.tsx` (Vite-era, reference only)
- New Next.js components in `src/components/next/*.tsx`
- New routes in `src/app/`

## Archived Vite artifacts (do not resurrect)

- `_vite-archive/` — vite.config.ts, index.html, old App.tsx/main.tsx
- v1 pages still at `src/pages/*.tsx` — reference material; port to `src/app/` routes as you go. Do NOT delete them until every route is migrated.

## Design tokens (locked)

Defined in `src/app/globals.css`:
- Primary: amber/gold `hsl(42 100% 50%)` in light, blue `hsl(217 80% 56%)` in dark
- Background: cream `hsl(40 30% 95%)` in light, near-black in dark
- Fonts: Inter (body), Cinzel (editorial headings)
- Radius: 0.75rem base
- Both themes supported via `.dark` class on `<html>`

## Hard rules

1. Pre-commit gate (typecheck + build + corruption grep + secret scan) — never bypass with `--no-verify`.
2. Never push to `main`. Always `next-migration` or a PR branch.
3. Never touch the live Supabase project's user data. Schema migrations go through branches.
4. No secrets in code. `.env.local` only. Gitignored.
5. Every commit: scoped, imperative, linked to the phase.
6. Migrate routes one at a time. Don't batch unrelated page ports.
7. Each new component under `src/components/next/` should be explicit about RSC vs Client. Prefer RSC, add `'use client'` only when hooks or framer-motion are used.
8. All manga cover images use `next/image` with proper remote domains (see `next.config.ts` `images.remotePatterns`).

## Security

- CSP + HSTS headers in `next.config.ts`
- Supabase RLS on every user table — never use service role in a client-invoked route
- Stripe webhooks mandatory signature verification
- Rate limits on every mutation API route
- See v3's `SECURITY.md` for the full OWASP-aligned posture — same principles apply here

## Parallel work pattern (this session)

The initial Next.js scaffold was built by 4 parallel Claude agents spawned concurrently, each writing non-overlapping files. After all four finished, parent session did a review+integrate pass. Repeat this pattern for multi-component work: spawn agents with bounded file scopes, integrate, commit.

## Checkpoint protocol

Every phase boundary:
1. `git add -A && git commit -m "phase-N(scope): imperative"`
2. Update HANDOFF.md with: current phase, last task, next task, blockers, timestamp
3. If blocked: write BLOCKED.md with exact unblocker steps for Louis
4. `git push origin next-migration`

## Not working on migration? Go here instead

- v3 greenfield: `Bibue35/bibue-v3` (archived — reference for auth/Stripe/pricing patterns)
- v3 schema migrations apply identically to prod Supabase (port when ready)
- v3 `docs/UNIT_ECONOMICS.md` is authoritative pricing + margin research
- v3 `src/lib/pricing/tiers.ts` has real Stripe price IDs — port to this branch when integrating billing
