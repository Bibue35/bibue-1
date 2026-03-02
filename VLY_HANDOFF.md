# Bibue — vly.ai Handoff Guide

## What is Bibue?
Bibue is a **manga, manhwa & manhua** discovery and tracking platform. It is **not** an anime platform.

**Live URL:** https://bibue-1.lovable.app

---

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui components |
| State | TanStack React Query (server), React Context (auth/language/theme) |
| Routing | React Router v6, lazy-loaded pages |
| Backend | Supabase (auth, database, edge functions, storage) |
| APIs | AniList GraphQL (metadata), MangaDex (chapters/reading), Jikan (supplementary) |

---

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
├── contexts/            # React contexts (Auth, Language, Theme, Incognito, SpoilerFree, MiniPlayer)
├── hooks/               # Custom hooks (data fetching, UI helpers)
├── i18n/                # Translations (en, ja, es, fr, de, pt, ko, zh)
├── lib/                 # Utilities (API client, validation, crypto)
├── pages/               # Route-level page components (lazy loaded)
├── integrations/        # Auto-generated Supabase client & types (DO NOT EDIT)
└── assets/              # Static images and media

supabase/
├── functions/           # Edge functions (API proxies, AI features)
└── migrations/          # Database migrations (DO NOT EDIT)
```

---

## Routes

| Path | Component | Auth? | Description |
|------|-----------|-------|-------------|
| `/` | `Index` | No | Landing page with trending sections |
| `/manga` | `MangaPage` | No | Browse all manga/manhwa/manhua |
| `/manga/:id` | `MangaDetail` | No | Individual title detail page |
| `/genres` | `GenresPage` | No | Genre browser |
| `/genre/:genre` | `GenreDetailPage` | No | Titles in a specific genre |
| `/rankings` | `Rankings` | No | Top rated/popular rankings |
| `/seasonal` | `SeasonalPage` | No | Seasonal releases |
| `/news` | `NewsPage` | No | News feed |
| `/community` | `CommunityPage` | No | Discussions & polls |
| `/seek` | `SeekPage` | No | AI-powered manga discovery |
| `/recommendations` | `RecommendationsPage` | No | AI recommendations |
| `/classics` | `ClassicsPage` | No | Classic titles |
| `/for-creators` | `ForCreatorsPage` | No | Creator landing page |
| `/originals` | `OriginalsPage` | No | User-uploaded originals |
| `/watchlist` | `WatchlistPage` | **Yes** | User's reading list |
| `/history` | `HistoryPage` | **Yes** | Reading history |
| `/settings` | `SettingsPage` | **Yes** | User settings |
| `/messages` | `MessagesPage` | **Yes** | Direct messages (E2E encrypted) |
| `/stats` | `StatsPage` | **Yes** | User stats dashboard |
| `/admin` | `AdminPage` | **Yes** | Admin panel |
| `/creator/dashboard` | `CreatorDashboard` | **Yes** | Creator content management |
| `/user/:userId` | `UserProfile` | No | Public user profile |
| `/anime`, `/anime/:id` | Redirect → `/manga` | — | Legacy redirects |

---

## Design System

### Color Strategy
All colors use **HSL design tokens** defined in `src/index.css`. There are two themes:

- **Light (Sunlight Mode):** Warm gold/honey palette, primary = `hsl(42 88% 38%)`
- **Dark (Moonlight Mode):** Cool blue/indigo palette, primary = `hsl(218 80% 56%)`

### Critical Rules
- **NEVER use direct Tailwind colors** (no `text-white`, `bg-black`, `text-gray-500`)
- **ALWAYS use semantic tokens:** `text-foreground`, `bg-background`, `text-primary`, `bg-card`, `text-muted-foreground`, etc.
- Custom glass morphism tokens: `--glass-bg`, `--glass-border`, `--glass-blur`
- Custom divine glow tokens: `--divine-glow`, `--divine-radiance`

### Component Variants
shadcn/ui components are customized via `class-variance-authority` variants. Create new variants instead of inline style overrides.

---

## Data Fetching Patterns

All API calls go through custom hooks using TanStack React Query:

```tsx
// Example: fetching top manga
const { data, isLoading, isError } = useTopManga(page, perPage, sort);
```

Key hooks:
- `useAnimeData.ts` — manga/manhwa/manhua listings (useTopManga, useTrendingManhwa, useTrendingManhua, etc.)
- `useMangaDex.ts` — chapter data and reading via MangaDex API
- `useWatchlist.ts` — user library CRUD
- `useViewingHistory.ts` — reading history tracking
- `useNotifications.ts` — notification system
- `useFollow.ts` — social follow system
- `useMessages.ts` — E2E encrypted direct messages
- `useRecommendations.ts` — AI-powered recommendations

Query defaults: `staleTime: 5min`, `gcTime: 1hr`, no refetch on focus/mount/reconnect.

---

## Authentication

- Email/password auth via Supabase Auth
- Session managed in `AuthContext` (`src/contexts/AuthContext.tsx`)
- Protected routes wrapped with `<ProtectedRoute>` component
- User roles: `admin`, `moderator`, `user` (via `user_roles` table + `has_role()` function)
- Linked accounts support (AniList, MAL OAuth)

---

## Internationalization

- 8 languages: English, Japanese, Spanish, French, German, Portuguese, Korean, Chinese
- English bundled inline, others lazy-loaded from `src/i18n/`
- `useLanguage()` hook provides `t(key)` function
- Language persisted in `localStorage` as `bibue-language`

---

## Database Tables (Supabase)

### Core
- `profiles` — user profiles (display_name, avatar, bio, banner)
- `watchlist` — user manga library with status/progress tracking
- `viewing_history` — reading history with chapter tracking

### Social
- `discussions` / `discussion_replies` — community discussions
- `user_follows` — follow system
- `direct_messages` — E2E encrypted DMs
- `user_reputation` — karma/reputation system
- `user_badges` / `badges` — achievement badges

### Creator Platform
- `creator_profiles` — creator accounts
- `series` — creator-uploaded manga series
- `chapters` / `chapter_pages` — chapter content
- `series_analytics` — view/earning analytics
- `payouts` — creator payouts
- `content_moderation_queue` — moderation pipeline

### Admin
- `user_roles` — role assignments
- `user_bans` — ban records
- `content_reports` / `chapter_reports` — user reports
- `dmca_requests` — DMCA takedown requests
- `support_tickets` / `ticket_replies` — support system

All tables use **Row Level Security (RLS)**.

---

## Edge Functions

| Function | Purpose |
|----------|---------|
| `anime-proxy` | Proxies AniList GraphQL & Jikan REST calls |
| `mangadex-proxy` | Proxies MangaDex API for chapter data |
| `seek` / `seek-convince` | AI-powered manga discovery chatbot |
| `ai-recommendations` | Personalized manga recommendations |
| `translate-text` | Text translation |
| `validate-title` | Title validation for creator uploads |
| `anilist-proxy` | AniList API proxy |
| `anilist-oauth-callback` / `mal-oauth-callback` | OAuth callbacks for linked accounts |
| `watchlist-sync` | Sync watchlist with external services |
| `vibe-check` | Mood-based recommendations |

---

## Key Components

### Layout
- `CollapsibleNavbar` — main navigation bar (collapses on scroll)
- `Footer` — site footer
- `FloatingHelpButton` — floating support button
- `ContextualBottomStrip` — contextual mobile bottom bar
- `BackToTop` — scroll-to-top button

### Content
- `MangaCard` — manga cover card with hover effects
- `MangaDetailModal` — full detail modal
- `ContentSection` — section wrapper with title/icon/link
- `HorizontalScroll` — horizontal scrollable row
- `ContinueReadingRow` — continue reading section
- `FeaturedCarousel` — featured content carousel

### Interaction
- `SearchModal` — global search with Fuse.js
- `AuthModal` — login/signup modal
- `MangaReader` — chapter reading view
- `ShareButton` — social sharing
- `WatchlistButton` — add to reading list

---

## DO NOT EDIT
- `src/integrations/supabase/client.ts` (auto-generated)
- `src/integrations/supabase/types.ts` (auto-generated)
- `supabase/config.toml` (auto-generated)
- `.env` (auto-generated)
- `supabase/migrations/` (managed by migration tool)
