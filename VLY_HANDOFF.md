# Bibue — Complete vly.ai Handoff Guide

> **Last updated:** 2026-03-09  
> **Live URL:** https://bibue-1.lovable.app  
> **Platform:** Manga, Manhwa & Manhua discovery and tracking. **Not** an anime platform.

---

## Table of Contents

1. [Tech Stack & Dependencies](#tech-stack--dependencies)
2. [Project Structure](#project-structure)
3. [Bootstrapping & Entry Points](#bootstrapping--entry-points)
4. [Routing (All Routes)](#routing-all-routes)
5. [Provider Hierarchy](#provider-hierarchy)
6. [Design System (In Depth)](#design-system-in-depth)
7. [Data Layer & API Architecture](#data-layer--api-architecture)
8. [Authentication System](#authentication-system)
9. [Database Schema (All Tables)](#database-schema-all-tables)
10. [Row-Level Security (RLS)](#row-level-security-rls)
11. [Database Functions & Triggers](#database-functions--triggers)
12. [Edge Functions (Backend)](#edge-functions-backend)
13. [Internationalization (i18n)](#internationalization-i18n)
14. [Feature Deep Dives](#feature-deep-dives)
15. [Performance Optimizations](#performance-optimizations)
16. [Storage Buckets](#storage-buckets)
17. [Secrets & Environment Variables](#secrets--environment-variables)
18. [Auto-Generated Files (DO NOT EDIT)](#auto-generated-files-do-not-edit)
19. [Known Gotchas & Pitfalls](#known-gotchas--pitfalls)

---

## 1. Tech Stack & Dependencies

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React + TypeScript | 18.3.x |
| Build | Vite | 5.4.x |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) | 3.4.x |
| State (server) | TanStack React Query | 5.83.x |
| State (client) | React Context (auth, language, theme, incognito, spoiler-free, mini-player) | — |
| Routing | React Router v6 | 6.30.x |
| Backend | Supabase (PostgreSQL, Auth, Edge Functions, Storage) | 2.93.x |
| Forms | React Hook Form + Zod | 7.61.x / 3.25.x |
| Search | Fuse.js (client-side fuzzy search) | 7.1.x |
| Charts | Recharts | 2.15.x |
| Markdown | react-markdown | 10.1.x |
| 3D | Three.js + React Three Fiber + Drei | 0.170.x |
| Theme | next-themes (dark/light class toggling) | 0.3.x |
| SEO | react-helmet-async | 2.0.x |
| Carousel | Embla Carousel | 8.6.x |
| Virtualization | @tanstack/react-virtual | 3.13.x |
| Crypto | Web Crypto API (E2E encrypted DMs) | Native |
| PWA | Custom service worker (`public/sw.js`) | — |

### Key Dev Dependencies
- Vitest (testing), ESLint, TypeScript 5.8, PostCSS, Autoprefixer

---

## 2. Project Structure

```
src/
├── App.tsx                  # Route definitions, provider composition, lazy loading
├── main.tsx                 # React root, theme bootstrap, SW registration
├── index.css                # Full design system (2355 lines — HSL tokens, glass morphism, animations, theme flavors)
├── App.css                  # Additional app styles
│
├── components/              # ~130+ reusable UI components
│   ├── ui/                  # shadcn/ui primitives (40+ components: button, dialog, card, tabs, etc.)
│   ├── skeletons/           # Loading skeleton components (CardSkeleton, HeroSkeleton)
│   ├── admin/               # Admin panel (UserManagement, ReportQueue, StudioSubmissionsTab, SupportTicketsTab)
│   ├── community/           # Social (DiscussionCard, FollowButton, Leaderboard, UserBadge, FollowersModal)
│   ├── creator/             # Creator features (FollowersTab)
│   ├── messages/            # DM system (MessageInbox, SendMessageDialog)
│   ├── news/                # News (FeaturedNewsCard, NewsCard, NewsSkeleton)
│   └── settings/            # Settings (AvatarPicker, LinkedAccounts)
│
├── contexts/                # React contexts
│   ├── AuthContext.tsx       # User session, profile, sign up/in/out
│   ├── LanguageContext.tsx   # i18n with lazy-loaded translations
│   ├── ThemeContext.tsx      # Theme mode + flavor (9 theme variants)
│   ├── IncognitoContext.tsx  # Incognito browsing mode
│   ├── SpoilerFreeContext.tsx # Spoiler-free mode
│   └── MiniPlayerContext.tsx # Floating video mini-player state
│
├── hooks/                   # 30+ custom hooks
│   ├── useAnimeData.ts      # All AniList data hooks (manga listings, search, details, recommendations)
│   ├── useMangaDex.ts       # MangaDex chapter/reading integration
│   ├── useWatchlist.ts      # User library CRUD with optimistic updates
│   ├── useViewingHistory.ts # Reading history tracking
│   ├── useNotifications.ts  # Notification system
│   ├── useFollow.ts         # Social follow/unfollow
│   ├── useMessages.ts       # E2E encrypted direct messages
│   ├── useRecommendations.ts # AI recommendations
│   ├── useVoting.ts         # Upvote/downvote system
│   ├── useModeration.ts     # Content moderation
│   ├── useAdminData.ts      # Admin dashboard data
│   ├── useReferral.ts       # Referral program logic
│   ├── useSeriesFollow.ts   # Original series follow
│   ├── useReadingProgress.ts # Chapter progress tracking
│   ├── useEncryptionKeys.ts # E2E encryption key management
│   ├── useUserBadges.ts     # Achievement badge system
│   ├── useUserReputation.ts # Karma/reputation
│   ├── useDeferredSection.ts # Intersection observer for lazy sections
│   ├── useDebounce.ts       # Input debouncing
│   ├── useInView.ts         # Viewport detection
│   └── use-mobile.tsx       # Mobile breakpoint detection
│
├── i18n/                    # Translation files
│   ├── index.ts             # Lazy loader for non-English translations
│   ├── en.ts                # English (bundled inline, ~200 keys)
│   ├── ja.ts, es.ts, fr.ts, de.ts, pt.ts, ko.ts, zh.ts  # Lazy-loaded
│
├── lib/                     # Utilities
│   ├── api.ts               # AniList GraphQL client (1144 lines — all API functions)
│   ├── utils.ts             # cn() helper, misc utils
│   ├── validation.ts        # Zod schemas
│   ├── e2e-crypto.ts        # Web Crypto API helpers for encrypted DMs
│   ├── contentType.ts       # Content type utilities
│   ├── imageStandardizer.ts # Image processing for creator uploads
│   ├── news.ts              # News data helpers
│   └── swipeNavFlag.ts      # Swipe navigation state
│
├── pages/                   # 30+ route-level components (all lazy-loaded)
├── integrations/            # Auto-generated (DO NOT EDIT)
│   └── supabase/
│       ├── client.ts        # Supabase client instance
│       └── types.ts         # Database type definitions
│
├── assets/                  # Static images
│   ├── bibue-logo.jpg
│   ├── bibue-tower.png
│   ├── creators-hero-bg.jpg
│   └── hero-bg.jpg
│
└── data/
    └── watchOrderGuides.ts  # Static watch order guide data

supabase/
├── functions/               # 12 edge functions (Deno runtime)
│   ├── ai-recommendations/  # AI-powered manga recommendations
│   ├── anilist-proxy/       # AniList GraphQL proxy with caching
│   ├── anilist-oauth-callback/ # AniList OAuth flow
│   ├── anime-proxy/         # Legacy proxy
│   ├── mal-oauth-callback/  # MyAnimeList OAuth flow
│   ├── mangadex-proxy/      # MangaDex REST API proxy
│   ├── seek/                # AI manga discovery chatbot
│   ├── seek-convince/       # AI persuasion for recommendations
│   ├── translate-text/      # Text translation
│   ├── validate-title/      # Title validation for uploads
│   ├── vibe-check/          # Mood-based recommendations
│   └── watchlist-sync/      # External service sync
├── migrations/              # SQL migrations (DO NOT EDIT)
└── config.toml              # Edge function config (DO NOT EDIT)

public/
├── sw.js                    # Service worker for offline caching
├── manifest.json            # PWA manifest
├── robots.txt, sitemap.xml  # SEO
├── ads.txt                  # Ad verification
├── og-image.jpg             # Social sharing image
└── offline.html             # Offline fallback page
```

---

## 3. Bootstrapping & Entry Points

### `src/main.tsx` — Application Root
```
HelmetProvider (SEO)
  └── NextThemesProvider (dark/light class on <html>, storageKey: "bibue-theme", default: "dark")
       └── ThemeProvider (flavor system: celestial, mocha, latte, frappe, macchiato, crimson-scroll, monochrome, contrast)
            └── <App />
```

**Before React mounts:**
1. Reads `localStorage("theme-flavor")` and applies `theme-{flavor}` class to `<html>` (prevents flash)
2. Registers service worker from `/sw.js`

### `src/App.tsx` — App Shell
- Creates `QueryClient` with global defaults: `staleTime: 5min`, `gcTime: 1hr`, no refetch on focus/mount/reconnect, retry: 1
- Wraps everything in providers (see Provider Hierarchy below)
- All 30+ page components are **lazy-loaded** via `React.lazy()` with dynamic `import()`
- Non-critical shell components (BackToTop, MiniPlayer, PWAInstallPrompt, etc.) also lazy-loaded
- `<PageLoader />` skeleton shown during route transitions

---

## 4. Routing (All Routes)

| Path | Component | Auth | Description |
|------|-----------|------|-------------|
| `/` | `Index` | No | Landing page — cinematic hero, trending manga/manhwa/manhua sections, continue reading |
| `/manga` | `MangaPage` | No | Browse all manga/manhwa/manhua with filters, search, sort |
| `/manga/:id` | `MangaDetail` | No | Title detail — synopsis, chapters (MangaDex), recommendations, comments |
| `/anime` | Redirect → `/manga` | — | Legacy redirect |
| `/anime/:id` | Redirect → `/manga/:id` | — | Legacy redirect preserving ID |
| `/genres` | `GenresPage` | No | Genre browser grid |
| `/genre/:genre` | `GenreDetailPage` | No | Titles filtered by genre |
| `/rankings` | `Rankings` | No | Top rated / popular rankings with pagination |
| `/seasonal` | `SeasonalPage` | No | Current season releases |
| `/seasonal/:seasonParam` | `SeasonalPage` | No | Specific season (e.g., `winter-2026`) |
| `/schedule` | `SchedulePage` | No | Weekly release schedule |
| `/news` | `NewsPage` | No | News feed |
| `/community` | `CommunityPage` | No | Discussions, polls, leaderboards |
| `/classics` | `ClassicsPage` | No | Classic titles by decade |
| `/recommendations` | `RecommendationsPage` | No | AI-powered personalized recommendations |
| `/seek` | Redirect → `/manga` | — | Legacy AI discovery redirect |
| `/compare` | `ComparePage` | No | Side-by-side manga comparison |
| `/guides` | `GuidesPage` | No | Reading order guides |
| `/guide/:slug` | `GuideDetailPage` | No | Specific guide |
| `/for-creators` | `ForCreatorsPage` | No | Creator landing/onboarding page |
| `/originals` | `OriginalsPage` | No | User-uploaded original manga |
| `/originals/:id` | `OriginalSeriesDetail` | No | Original series detail with chapters |
| `/studio` | `StudioPage` | No | Studio submission form |
| `/refer` | `ReferAndEarnPage` | No | Referral program |
| `/privacy` | `PrivacyPage` | No | Privacy policy |
| `/terms` | `TermsPage` | No | Terms of service |
| `/user/:userId` | `UserProfile` | No | Public user profile |
| `/creator/:identifier` | `CreatorProfile` | No | Creator public profile |
| `/party/:code` | `WatchPartyPage` | No | Watch party room |
| `/watchlist` | `WatchlistPage` | **Yes** | User's reading list (watching/completed/plan-to-read) |
| `/history` | `HistoryPage` | **Yes** | Reading history |
| `/settings` | `SettingsPage` | **Yes** | User settings (profile, avatar, linked accounts, preferences) |
| `/messages` | `MessagesPage` | **Yes** | Direct messages (E2E encrypted) |
| `/messages/:partnerId` | `MessagesPage` | **Yes** | DM conversation with specific user |
| `/stats` | `StatsPage` | **Yes** | User stats dashboard (charts, reading analytics) |
| `/admin` | `AdminPage` | **Yes** | Admin panel (users, reports, moderation, support tickets, DMCA) |
| `/support` | `SupportPage` | **Yes** | Submit support tickets |
| `/creator/dashboard` | `CreatorDashboard` | **Yes** | Creator content management (series, chapters, analytics, payouts) |
| `*` | `NotFound` | No | 404 page |

**Protected routes** use `<ProtectedRoute>` which checks `useAuth().user` and redirects to `/` if not authenticated.

---

## 5. Provider Hierarchy

```
HelmetProvider
  NextThemesProvider (class-based dark/light)
    ThemeProvider (flavor system)
      QueryClientProvider (TanStack Query)
        LanguageProvider (i18n)
          AuthProvider (Supabase auth session + profile)
            IncognitoProvider (incognito mode flag)
              SpoilerFreeProvider (spoiler hiding)
                MiniPlayerProvider (floating player state)
                  TooltipProvider
                    BrowserRouter
                      Routes...
```

---

## 6. Design System (In Depth)

### Color Architecture
All colors defined as **HSL CSS custom properties** in `src/index.css` (2355 lines).

**Two base themes:**
- `:root` (Light / "Sunlight Mode") — Warm gold/honey: `--primary: 42 88% 38%`
- `.dark` (Dark / "Midnight Mode") — Electric blue on pure black: `--primary: 204 89% 53%`, `--background: 0 0% 0%`

**Nine theme flavors** (applied as `.theme-{name}` class on `<html>`):
1. `default` — Base light/dark
2. `celestial` — Default active flavor (enhanced light/dark)
3. `mocha` — Catppuccin Mocha (dark chocolate)
4. `latte` — Catppuccin Latte (cream)
5. `frappe` — Catppuccin Frappé (muted pastel)
6. `macchiato` — Catppuccin Macchiato (deep muted)
7. `crimson-scroll` — Deep red/crimson manga theme
8. `monochrome` — Grayscale
9. `contrast` — High contrast accessibility

### Token Categories
```css
/* Core semantic tokens */
--background, --foreground
--card, --card-foreground
--popover, --popover-foreground
--primary, --primary-foreground
--secondary, --secondary-foreground
--muted, --muted-foreground
--accent, --accent-foreground
--destructive, --destructive-foreground
--border, --input, --ring

/* Liquid Glass system */
--glass-bg, --glass-border, --glass-highlight, --glass-shadow, --glass-blur, --glass-refraction
--specular-color, --specular-inner
--reflection-start, --reflection-mid, --reflection-end

/* Divine glow effects */
--divine-glow, --divine-radiance, --divine-halo

/* Chart colors */
--chart-1 through --chart-5

/* Sidebar */
--sidebar-background, --sidebar-foreground, --sidebar-primary, etc.
```

### Critical Rules
- **NEVER use direct Tailwind colors** (no `text-white`, `bg-black`, `text-gray-500`)
- **ALWAYS use semantic tokens**: `text-foreground`, `bg-background`, `text-primary`, `bg-card`, `text-muted-foreground`
- Glass effects use custom CSS classes: `.glass-card`, `.glass-morphism`, etc.
- Border radius: `--radius: 1rem` (used via `rounded-lg`, `rounded-md`, etc.)
- Font: Inter (primary), Hiragino/Yu Gothic/Noto Sans CJK JP (Japanese), Cinzel (sacred/display)

### Tailwind Config Additions
```ts
// tailwind.config.ts extends:
colors: { neon: { gold, blue, magenta, crimson } }
fontFamily: { sans: ["Inter", ...], jp: [...], sacred: ["Cinzel", ...] }
screens: { xs: "400px", ... }  // Added xs breakpoint
```

---

## 7. Data Layer & API Architecture

### Primary Data Source: AniList GraphQL API
All manga/manhwa/manhua metadata comes from **AniList** (not MAL). The app uses AniList IDs everywhere.

**Data flow:**
```
Frontend (src/lib/api.ts)
  → POST to edge function: anilist-proxy
    → POST to https://graphql.anilist.co
    → Response cached in-memory (15min TTL, max 500 entries)
  ← Transformed to Anime/Manga interface
← Consumed by React Query hooks (src/hooks/useAnimeData.ts)
```

**Key interfaces** (from `src/lib/api.ts`):
```typescript
interface Anime {
  anilist_id: number;     // PRIMARY ID — AniList ID
  mal_id: number;         // ALSO AniList ID (legacy compat, NOT MAL ID)
  idMal?: number;         // Real MAL ID (only used for Jikan calls)
  title: string;          // Language-aware title
  title_romaji?: string;
  title_english?: string;
  title_japanese?: string;
  images: { jpg/webp: { large_image_url, image_url } };
  synopsis?: string;
  score?: number;         // Out of 10 (AniList is /100, divided by 10)
  genres?: Array<{ mal_id: number; name: string }>;
  // ... episodes, status, year, season, etc.
}

interface Manga extends Anime {
  chapters?: number;
  volumes?: number;
  countryOfOrigin?: string;  // "JP" | "KR" | "CN"
  authors?: Array<{ mal_id: number; name: string }>;
  bannerImage?: string;
}
```

**ID System Warning:** `mal_id` in the codebase is actually the AniList ID. The field `idMal` is the real MyAnimeList ID. This is a historical naming issue — be very careful.

### AniList GraphQL Fragment
All queries use a shared `MEDIA_FRAGMENT` that fetches: id, idMal, title (3 languages), coverImage (3 sizes), bannerImage, description, averageScore, popularity, favourites, episodes, chapters, volumes, status, season, genres, tags, countryOfOrigin, trailer, dates, studios, staff, rankings, nextAiringEpisode, streamingEpisodes.

### Secondary Data Source: MangaDex API
Used for **chapter data and reading**. Accessed via `mangadex-proxy` edge function.

**Data flow:**
```
useMangaDex hook
  → GET edge function: mangadex-proxy?action=search&title=...
    → GET https://api.mangadex.org/manga?title=...
  ← Chapters, page URLs
```

**Actions supported:** `search`, `search-by-tags`, `chapters`, `pages`, `manga` (by ID)

**Content filtering:** Only `safe` and `suggestive` ratings allowed (no erotica/pornographic).

### React Query Configuration
```typescript
// Global defaults (App.tsx):
staleTime: 5 * 60 * 1000,    // 5 min
gcTime: 60 * 60 * 1000,       // 1 hour cache
refetchOnWindowFocus: false,
refetchOnMount: false,
refetchOnReconnect: false,
retry: 1,

// Per-hook overrides:
// List data: staleTime 10min, gcTime 30min
// Detail data: staleTime 15min, gcTime 1hr
```

### API Error Handling
- Rate limit (429): Exponential backoff with Retry-After header, max 3 retries
- Server errors (5xx): Exponential backoff, max 3 retries
- Network errors: Retry with backoff
- Custom `RateLimitError` class for user-facing messages

### Supabase Client Usage
```typescript
import { supabase } from "@/integrations/supabase/client";

// All CRUD operations use typed Supabase client
const { data, error } = await supabase.from("watchlist").select("*").eq("user_id", userId);
```

---

## 8. Authentication System

### Implementation
- **Email/password** auth via Supabase Auth
- Session managed in `AuthContext` (`src/contexts/AuthContext.tsx`)
- Auth state listener + initial session check on mount
- Profile auto-created via `handle_new_user()` database trigger on `auth.users` INSERT

### Auth Flow
1. User signs up → `supabase.auth.signUp()` with email redirect
2. `handle_new_user()` trigger creates `profiles` row with sanitized username/avatar
3. Auth state change fires → `fetchProfile()` loads profile data
4. Session stored in localStorage, auto-refreshed

### Profile Data
```typescript
interface Profile {
  id: string;
  user_id: string;       // References auth.users(id)
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  location: string | null;
  website: string | null;
  is_public: boolean;
  is_founder: boolean;
  founder_tier: string | null;
  referral_code: string | null;
  referred_by: string | null;
  created_at: string;
  updated_at: string;
}
```

### User Roles
Roles stored in separate `user_roles` table (NOT on profiles):
```sql
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Checked via security-definer function:
public.has_role(_user_id uuid, _role app_role) → boolean
```

### Linked Accounts (OAuth)
- AniList OAuth: `anilist-oauth-callback` edge function
- MyAnimeList OAuth: `mal-oauth-callback` edge function
- Tokens stored in `linked_accounts` table (encrypted)

---

## 9. Database Schema (All Tables)

### Core User Tables
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `profiles` | User profiles | user_id, username, display_name, avatar_url, bio, is_founder, referral_code |
| `user_roles` | Role assignments | user_id, role (app_role enum) |
| `user_preferences` | User settings | user_id, theme, incognito_mode, notify_* flags |
| `user_coins` | Virtual currency | user_id, balance, lifetime_earned |
| `user_encryption_keys` | E2E encryption public keys | user_id, public_key |
| `user_bans` | Ban records | user_id, banned_by, reason, expires_at |

### Content Tracking
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `watchlist` | User manga library | user_id, mal_id (AniList ID), media_type, status, score, chapters_read, episodes_watched, category, notes |
| `viewing_history` | Reading history | user_id, media_id, last_chapter, last_episode, title, image_url |
| `activity_logs` | Activity feed | user_id, activity_type, mal_id, title, details (JSON) |
| `user_categories` | Custom library categories | user_id, name, color |

### Social
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `discussions` | Community threads | user_id, title, content, category, manga_id |
| `discussion_replies` | Thread replies | discussion_id, user_id, content |
| `user_follows` | Follow system | follower_id, following_id |
| `direct_messages` | E2E encrypted DMs | sender_id, recipient_id, content, is_encrypted, encryption_metadata |
| `user_reputation` | Karma system | user_id, karma, posts_count, comments_count, helpful_votes |
| `badges` | Badge definitions | name, icon, color, requirement_type, requirement_value |
| `user_badges` | Awarded badges | user_id, badge_id |
| `community_polls` | Polls | user_id, title, options (JSON), is_multiple_choice, ends_at |
| `poll_votes` | Poll votes | poll_id, user_id, option_index |
| `user_lists` | Public curated lists | user_id, title, slug, is_public, likes_count |
| `list_entries` | List items | list_id, mal_id, title, position, note |
| `list_likes` | List likes | list_id, user_id |

### Engagement
| Table | Purpose |
|-------|---------|
| `media_votes` | Upvote/downvote on media |
| `media_reactions` | Emoji reactions on media |
| `episode_votes` | Chapter-level voting |
| `episode_comments` | Chapter discussion comments |
| `comment_likes` | Comment like tracking |
| `chapter_votes` | Original chapter voting |
| `chapter_comments` | Original chapter comments |
| `chapter_comment_likes` | Original chapter comment likes |
| `notification_preferences` | Per-media notification toggles |
| `notifications` | User notification inbox |

### Creator Platform
| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `creator_profiles` | Creator accounts | user_id, display_name, bio, is_verified, total_earned, strike_count, referral_code |
| `series` | Original manga series | creator_id, title, description, cover_image_url, genre_tags[], content_rating, language, reading_direction, status |
| `chapters` | Series chapters | series_id, creator_id, chapter_number, title, status (draft/pending/published), format_type |
| `chapter_pages` | Chapter page images | chapter_id, page_number, image_url, file_size, is_standardized |
| `series_analytics` | Monthly view/earning stats | series_id, month, views, likes, earnings |
| `series_follows` | Users following a series | series_id, user_id |
| `payouts` | Creator payout records | creator_id, amount, method, status |
| `creator_referrals` | Creator referral tracking | referrer_id, referred_user_id, referral_code, has_uploaded |
| `content_moderation_queue` | Moderation pipeline | content_type, series_id, chapter_id, creator_id, status, flagged_reason |
| `chapter_reports` | User reports on chapters | chapter_id, reporter_id, report_type |

### Admin & Support
| Table | Purpose |
|-------|---------|
| `content_reports` | General content reports |
| `dmca_requests` | DMCA takedown requests |
| `support_tickets` | User support tickets |
| `ticket_replies` | Support ticket replies |
| `studio_submissions` | External creator submissions |

### Referral System
| Table | Purpose |
|-------|---------|
| `user_referrals` | User referral tracking |
| `referral_rewards` | Reward distribution log |
| `referral_leaderboard` | Materialized view for leaderboard |

### Social Features
| Table | Purpose |
|-------|---------|
| `watch_parties` | Watch party rooms |
| `watch_party_members` | Party membership |
| `linked_accounts` | OAuth linked accounts (AniList, MAL) |

---

## 10. Row-Level Security (RLS)

**All tables have RLS enabled.** Key patterns:

### Self-access pattern (most user tables):
```sql
-- SELECT: auth.uid() = user_id
-- INSERT: auth.uid() = user_id
-- UPDATE: auth.uid() = user_id
-- DELETE: auth.uid() = user_id
```
Used by: `watchlist`, `viewing_history`, `user_preferences`, `user_coins`, `notification_preferences`, `linked_accounts`

### Public read, authenticated write:
```sql
-- SELECT: auth.role() = 'authenticated' (or true for fully public)
-- INSERT: auth.uid() = user_id
```
Used by: `discussions`, `discussion_replies`, `user_follows`, `media_reactions`, `badges`

### Admin-only:
```sql
-- ALL: has_role(auth.uid(), 'admin')
```
Used by: `user_roles`, `dmca_requests`, `payouts`

### Creator pattern:
```sql
-- SELECT: status = 'published' OR creator_id = auth.uid()
-- INSERT: creator_id = auth.uid()
-- UPDATE: creator_id = auth.uid()
-- Admin override: has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'moderator')
```
Used by: `chapters`, `chapter_pages`, `series`

### Content moderation pattern:
```sql
-- SELECT: admin/moderator OR creator_id = auth.uid()
-- UPDATE: admin/moderator only
-- INSERT: authenticated
```

**Important: RESTRICTIVE policies.** All policies use `Permissive: No` (RESTRICTIVE), meaning they DENY unless explicitly allowed. This is more secure than the default PERMISSIVE.

---

## 11. Database Functions & Triggers

### Auto-profile creation
```sql
handle_new_user() -- TRIGGER on auth.users INSERT
-- Creates profile with sanitized username, validates avatar URL against whitelist
-- (Google, Apple, GitHub, Gravatar, Discord, Imgur domains only)
```

### Reputation system (automatic)
```sql
increment_posts_count()     -- +1 post, +5 karma on discussion create
decrement_posts_count()     -- Reverse on delete
increment_comments_count()  -- +1 comment, +2 karma on reply create
decrement_comments_count()  -- Reverse on delete
update_helpful_votes_on_like() -- +1 helpful, +3 karma when someone else likes your comment
ensure_user_reputation()    -- Auto-create reputation row
```

### Badge system
```sql
check_and_award_badges() -- TRIGGER on user_reputation UPDATE
-- Checks all badges, awards any the user newly qualifies for
-- Types: posts_count, comments_count, karma, helpful_votes
```

### Comment likes (atomic)
```sql
update_comment_likes_count()         -- Increment/decrement on comment_likes INSERT/DELETE
update_chapter_comment_likes_count() -- Same for chapter_comments
prevent_likes_manipulation()         -- Blocks direct UPDATE of likes field
```

### Content moderation pipeline
```sql
auto_queue_series_moderation()  -- Queue series on submit, flag mature content
auto_queue_chapter_moderation() -- Queue chapter, auto-approve after 3 approved chapters
increment_approved_chapters()   -- Track approved count per series
```

### Notifications
```sql
notify_followers_on_chapter_publish() -- Notify user_follows + series_follows when chapter goes live
```

### Referral system
```sql
generate_user_referral_code()   -- Auto-generate BIBUE-FOUNDER-XXXXXX code for profiles
generate_referral_code()        -- Same for creator_profiles
distribute_referral_coins()     -- Award coins to user_coins + log to referral_rewards
```

### Utility
```sql
update_updated_at_column()  -- Generic updated_at trigger
update_list_likes_count()   -- Atomic likes count for user_lists
```

---

## 12. Edge Functions (Backend)

All edge functions run on **Deno** runtime. JWT verification is disabled for all functions (`verify_jwt = false` in config.toml) — authentication is handled in code where needed.

| Function | Purpose | AI Model | Auth |
|----------|---------|----------|------|
| `anilist-proxy` | Proxies AniList GraphQL with 15min in-memory cache, rate limit handling, retry logic | None | None |
| `mangadex-proxy` | Proxies MangaDex REST API (search, chapters, pages, tags) with content rating filter | None | None |
| `seek` | AI manga discovery chatbot — takes vibes/moods, returns 5-8 recommendations | google/gemini-2.5-flash | None |
| `seek-convince` | AI persuasion — convinces user why a recommendation is good | google/gemini-2.5-flash | None |
| `ai-recommendations` | Personalized recommendations based on watchlist | google/gemini-2.5-flash | None |
| `vibe-check` | Mood-based recommendation engine | google/gemini-2.5-flash | None |
| `translate-text` | Text translation between languages | AI via Lovable gateway | None |
| `validate-title` | Validates series titles for creator uploads | AI via Lovable gateway | None |
| `anilist-oauth-callback` | Handles AniList OAuth code exchange | None | OAuth flow |
| `mal-oauth-callback` | Handles MAL OAuth code exchange | None | OAuth flow |
| `watchlist-sync` | Syncs watchlist with external services (AniList, MAL) | None | Bearer token |

### AI Gateway
AI functions use the Lovable AI gateway:
```typescript
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
  body: JSON.stringify({ model: "google/gemini-2.5-flash", messages, temperature: 0.8 }),
});
```

### Edge Function Calling Convention
```typescript
// From frontend — two patterns used:

// Pattern 1: supabase.functions.invoke()
const { data } = await supabase.functions.invoke("seek", { body: { prompt, watchlist } });

// Pattern 2: Direct fetch with project ID
const res = await fetch(
  `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mangadex-proxy?action=search&title=...`,
  { headers: { apikey: anonKey, Authorization: `Bearer ${anonKey}` } }
);

// Pattern 3: Via VITE_SUPABASE_URL
const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-proxy`, {
  method: "POST",
  headers: { apikey: anonKey },
  body: JSON.stringify({ query, variables }),
});
```

---

## 13. Internationalization (i18n)

### Architecture
- **8 languages:** English, Japanese, Spanish, French, German, Portuguese, Korean, Chinese
- English translations bundled inline in `src/i18n/en.ts` (~200 keys)
- All other languages **lazy-loaded** from `src/i18n/{lang}.ts` on demand
- Language persisted in `localStorage` as `bibue-language`
- `document.documentElement.lang` updated on change

### Usage
```tsx
const { t, language, setLanguage } = useLanguage();
// t("nav.community") → "Community" (en) or "コミュニティ" (ja)
```

### API Integration
Language flows through to AniList queries — title display adapts:
- `ja` → native title preferred
- `en` → English title preferred
- Others → Romaji preferred

---

## 14. Feature Deep Dives

### Watchlist System
- CRUD operations in `useWatchlist.ts` with optimistic updates
- Statuses: watching, completed, plan_to_watch, on_hold, dropped
- Custom categories via `user_categories` table
- Score (1-10), notes, episode/chapter progress tracking
- Activity logging (disabled in incognito mode)
- Batch edit mode for bulk status changes

### MangaDex Reading Integration
- Search MangaDex by title to link AniList manga → MangaDex chapters
- Chapter list with scanlation group, language, page count
- Full page reader (`MangaReader` component) with page-by-page navigation
- Reading progress tracked in `viewing_history`

### E2E Encrypted Direct Messages
- Key generation/exchange via Web Crypto API (`src/lib/e2e-crypto.ts`)
- Public keys stored in `user_encryption_keys` table
- Messages encrypted before storage, decrypted on read
- `encryption_metadata` JSON field stores per-message crypto params

### Creator Platform
- Creator profile creation with guidelines acceptance
- Series creation with cover upload (to `creator-uploads` storage bucket)
- Chapter upload with page ordering, standardization
- Automatic moderation queue (first 3 chapters reviewed, then auto-approve)
- Analytics dashboard (views, likes, earnings per month)
- Referral system for creators

### Community & Social
- Discussions with categories (general, manga-specific)
- Polls with single/multiple choice, expiration
- User reputation system (karma from posts, comments, helpful votes)
- Achievement badges (auto-awarded based on reputation thresholds)
- Follow system (user-to-user, user-to-series)
- Leaderboards

### Admin Panel
- User management (roles, bans)
- Content report queue
- DMCA request management
- Support ticket system with replies
- Studio submission review
- Chapter comment moderation

### Referral Program
- Auto-generated referral codes (`BIBUE-FOUNDER-XXXXXX`)
- Coin rewards for referrer and referred
- Founder tier system
- Leaderboard (materialized view)

---

## 15. Performance Optimizations

1. **Code splitting:** All pages lazy-loaded, non-critical components lazy-loaded
2. **React Query caching:** 5-15min stale time, 30min-1hr GC time, no unnecessary refetches
3. **Edge function caching:** AniList proxy has 15min in-memory cache (500 entry limit)
4. **Deferred sections:** `useDeferredSection` uses IntersectionObserver to defer below-fold content
5. **Image optimization:** `content-visibility: auto` on all images, `LazyImage` component
6. **Virtual scrolling:** `@tanstack/react-virtual` for long lists
7. **Font loading:** Preloaded via `<link>` in index.html
8. **Service worker:** Offline caching strategy via `public/sw.js`
9. **PWA:** Installable with manifest.json and offline.html fallback
10. **Touch optimization:** `touch-action: manipulation` on interactive elements (eliminates 300ms delay)

---

## 16. Storage Buckets

| Bucket | Public | Purpose |
|--------|--------|---------|
| `bibue-files` | No | Private user files |
| `creator-uploads` | Yes | Creator series covers, chapter pages |
| `studio-uploads` | Yes | Studio submission files |

---

## 17. Secrets & Environment Variables

### Auto-provided (in .env, DO NOT EDIT):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

### Edge Function Secrets (configured in Supabase):
- `LOVABLE_API_KEY` — AI gateway access
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_DB_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `ANILIST_CLIENT_ID`, `ANILIST_CLIENT_SECRET` — AniList OAuth
- `MAL_CLIENT_ID`, `MAL_CLIENT_SECRET` — MyAnimeList OAuth
- `TOKEN_ENCRYPTION_KEY` — OAuth token encryption
- `ALLOWED_ORIGIN` — CORS origin for OAuth callbacks
- `ANIWATCH_API_URL` — Anime streaming API (legacy)

---

## 18. Auto-Generated Files (DO NOT EDIT)

- `src/integrations/supabase/client.ts` — Supabase client instance
- `src/integrations/supabase/types.ts` — Database TypeScript types (auto-generated from schema)
- `supabase/config.toml` — Edge function configuration
- `.env` — Environment variables
- `supabase/migrations/` — Database migration files

---

## 19. Known Gotchas & Pitfalls

1. **`mal_id` is actually AniList ID.** The field `idMal` is the real MAL ID. This naming is throughout the entire codebase and database.

2. **RESTRICTIVE RLS policies.** All policies are `Permissive: No` (restrictive). This means ALL applicable policies must pass, not just one.

3. **Supabase 1000-row default limit.** Queries without explicit limits cap at 1000 rows.

4. **Theme flavor flash prevention.** `main.tsx` reads localStorage before React mounts to add theme class. Don't remove this.

5. **Edge function JWT disabled.** All functions have `verify_jwt = false`. Auth is handled in application code where needed.

6. **AniList rate limiting.** The proxy retries with backoff but can still hit limits under heavy traffic. The 15-min cache helps.

7. **MangaDex content filtering.** Only `safe` and `suggestive` content ratings are allowed. Erotica/pornographic are blocked at the proxy level.

8. **Creator auto-approval.** After 3 approved chapters, new chapters auto-publish without moderation review.

9. **Profile creation trigger.** New users get profiles via `handle_new_user()` trigger. Avatar URLs are sanitized against a domain whitelist.

10. **Incognito mode.** When enabled, activity logging and viewing history are suppressed client-side.

11. **Language-aware titles.** All manga title display respects the user's language setting. Japanese users see native titles, English users see English titles, others see Romaji.

12. **Next-themes storage key.** Theme preference stored as `bibue-theme` in localStorage (not the default `theme`).

13. **The `watchlist` table columns use `mal_id` but store AniList IDs.** Same naming issue as the API layer.
