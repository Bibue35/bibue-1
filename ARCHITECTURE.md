# Bibue — Architecture Overview

## What is Bibue?
Bibue is a **manga, manhwa & manhua** discovery and tracking platform. It is **not** an anime platform.

## Tech Stack
- **Frontend:** React 18 + TypeScript + Vite
- **Styling:** Tailwind CSS with shadcn/ui components
- **State:** TanStack React Query (server state), React Context (auth, language, theme)
- **Routing:** React Router v6 with lazy-loaded pages
- **Backend:** Lovable Cloud (Supabase) — auth, database, edge functions, storage
- **APIs:** AniList GraphQL (metadata), MangaDex (chapters/reading), Jikan (supplementary)

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui primitives (button, dialog, card, etc.)
│   ├── skeletons/       # Loading skeleton components
│   ├── admin/           # Admin dashboard components
│   ├── community/       # Community/social components
│   ├── messages/        # Direct messaging components
│   ├── news/            # News feed components
│   └── settings/        # Settings page components
├── contexts/            # React contexts (Auth, Language, Theme, Incognito, etc.)
├── hooks/               # Custom hooks (data fetching, UI helpers)
├── i18n/                # Translations (en, ja, es, fr, de, pt, ko, zh)
├── lib/                 # Utilities (API client, validation, crypto)
├── pages/               # Route-level page components (lazy loaded)
├── integrations/        # Auto-generated Supabase client & types (DO NOT EDIT)
└── assets/              # Static images and media

supabase/
├── functions/           # Edge functions (API proxies, AI features)
├── migrations/          # Database migrations (DO NOT EDIT)
└── config.toml          # Supabase config (DO NOT EDIT)
```

## Key Patterns

### Data Fetching
All API data goes through custom hooks in `src/hooks/` using TanStack Query:
- `useAnimeData.ts` — manga/manhwa/manhua listings (top, trending, seasonal)
- `useMangaDex.ts` — chapter data and reading
- `useWatchlist.ts` — user library management
- `useNotifications.ts` — notification system

### Authentication
- Email/password auth via Lovable Cloud
- Session managed in `AuthContext`
- Protected routes use `<ProtectedRoute>` wrapper

### Internationalization
- 8 languages supported
- English bundled inline, others lazy-loaded
- `useLanguage()` hook provides `t()` function
- Translation files in `src/i18n/`

### Design System
- All colors use HSL design tokens from `index.css`
- **Never use direct Tailwind colors** (no `text-white`, `bg-black`)
- Use semantic tokens: `text-foreground`, `bg-background`, `text-primary`, etc.
- shadcn/ui components are customized via variants

### Edge Functions
Located in `supabase/functions/`:
- `anime-proxy` — proxies AniList/Jikan API calls
- `mangadex-proxy` — proxies MangaDex API
- `seek` / `seek-convince` — AI-powered manga discovery
- `ai-recommendations` — personalized recommendations
- `translate-text` — text translation
- `validate-title` — title validation

## Auto-Generated Files (DO NOT EDIT)
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `supabase/config.toml`
- `.env`

## Database
Tables are defined in Supabase migrations. Key tables:
- `profiles` — user profiles
- `watchlist` — user manga library
- `viewing_history` — reading history
- `discussions` / `discussion_replies` — community
- `series` / `chapters` / `chapter_pages` — creator content
- `notifications` — user notifications

All tables use Row Level Security (RLS).
