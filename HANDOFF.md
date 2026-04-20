# HANDOFF — next-migration branch

**⚠️ Read this FIRST. Then `CLAUDE.md` for standing context, then `PLAN.md` for phases.**

---

## Last updated

2026-04-20 — Phase 1 in progress (in-flight agent work)

## What's the state?

**This branch migrates bibue-1 from Vite → Next.js 16 in-place.** `main` stays on Vite (serves bibue.net) throughout. When feature-parity is reached, `next-migration` merges to `main` and the repo is now Next.js.

## Completed this session (so far)

- ✅ Cloned `Bibue35/bibue-1` → `~/Downloads/bibue-1-clone/`
- ✅ Created branch `next-migration`
- ✅ Archived Vite files to `_vite-archive/` (vite.config, index.html, main.tsx, App.tsx, App.css)
- ✅ Uninstalled `vite`, `@vitejs/plugin-react-swc`, `lovable-tagger`, `vitest`
- ✅ Installed `next@16`, `react@19`, `react-dom@19`, `@supabase/ssr`, `zod`, `framer-motion`, `tailwindcss@4`, `@tailwindcss/postcss@4`
- ✅ Wrote `next.config.ts` with security headers, image remote domains, turbopack root
- ✅ Wrote `postcss.config.mjs` for Tailwind 4
- ✅ Wrote `src/app/globals.css` with v1's amber/cream/Cinzel+Inter tokens + motion utilities
- ✅ Wrote `src/app/layout.tsx` with Cinzel + Inter via `next/font`, Open Graph metadata
- ✅ Wrote `src/components/next/Nav.tsx` — scroll-aware glass nav with theme toggle + mobile drawer
- ✅ Ported Supabase SSR clients (`src/lib/supabase/{client,server,middleware}.ts`) + `src/proxy.ts`
- ✅ Checkpoint commit

## In-flight right now (4 parallel agents running)

1. `src/components/next/HeroSection.tsx` — cinematic hero with scroll parallax + text reveal
2. `src/components/next/MangaCard.tsx` + `MangaCarousel.tsx` — cover card + horizontal scroll row
3. `src/app/page.tsx` + `src/app/_home/FadeInSection.tsx` — home page composition with placeholder data
4. `package.json` scripts + husky pre-commit + `.github/workflows/ci.yml` + `tsconfig.json` updates

When all four finish, parent will: review diffs, run `npm run build`, fix any integration issues, commit + push.

## What to do next (if continuing in a new session)

1. Check if the 4 agents finished cleanly. Look at `git status` — you should see new files in:
   - `src/components/next/HeroSection.tsx`
   - `src/components/next/MangaCard.tsx`
   - `src/components/next/MangaCarousel.tsx`
   - `src/app/page.tsx`
   - `src/app/_home/FadeInSection.tsx`
   - `.husky/pre-commit`
   - `.github/workflows/ci.yml`
   - Modified `package.json`, `tsconfig.json`
2. Run `npm run typecheck` — fix any errors
3. Run `npm run build` — fix any build issues
4. Commit `phase1(next-migration): scaffold complete, home page + design system live`
5. Push to `origin/next-migration`
6. Then move to Phase 2 — see PLAN.md for the full migration roadmap

## Env vars needed

The ported Supabase client reads these (in `.env.local`):
```
NEXT_PUBLIC_SUPABASE_URL=https://dsquhilpqcwqydsfhooi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<prod anon key>
```

⚠️ **This is the PRODUCTION Supabase project.** Read-only operations only from this branch for now. Do not run migrations against this project without explicit user approval.

Stripe + other credentials: add incrementally as each feature (billing, translation, generation) is ported. See v3's `.env` structure as reference.

## Known caveats

- `_vite-archive/` is excluded from tsconfig.json (do not typecheck archived files)
- `src/pages/*.tsx` is still present (Vite-era pages) — excluded from Next.js routing because Next uses `src/app/`. Treat as reference material. Port page-by-page to `src/app/`.
- `@supabase/ssr` peer-dep warnings during install due to radix-ui expecting React 18 — install used `--legacy-peer-deps`. Runtime is fine.

## Security gate status

- Pre-commit hook: ⏳ being set up by in-flight agent
- CI workflow: ⏳ being set up by in-flight agent  
- Branch protection on main: not yet configured (set up via `gh api ... repos/.../branches/main/protection`)

## Last commit

`phase1(next-migration): scaffold Next.js 16 + v1 design tokens + Nav + Supabase client (WIP)`

## Do not touch list

- `main` branch (production Vite)
- Supabase project `dsquhilpqcwqydsfhooi` user data
- `Bibue35/bibue-v3` (archived reference)
- DNS records for bibue.net
