

# Expert Search + Functional Filters — Implementation Plan

This is a large scope covering two major areas: (1) a new Expert Search experience and (2) making all filters/sorting fully functional across pages. I'll break it into focused phases.

---

## Phase 1: Global Expert Search (Cmd/Ctrl+K)

### 1a: Upgrade SearchModal to Expert Search
**File: `src/components/SearchModal.tsx`** — Major rewrite

- Add **Cmd/Ctrl+K** keyboard shortcut listener (in `CollapsibleNavbar.tsx`, which already manages `isSearchOpen` state)
- Redesign the modal into a command-palette style with two panels:
  - **Left**: Search input + live results (current behavior, enhanced)
  - **Right**: Advanced filter panel (Genre chips, Year slider, Status toggles, Score range, Type selector)
- Add **voice input** button using Web Speech API (`webkitSpeechRecognition`)
- Add **saved searches**: store favorite queries in localStorage, show them when input is empty
- Results use infinite scroll via existing `useInfiniteSearchManga` / `useInfiniteSearchAnime`
- Live keyword highlighting in result titles using the search query
- "Add to Watchlist" button on each result row
- Show relevance indicators (score match, genre match badges)

### 1b: AI-Powered Natural Language Search
**Leverage existing `seek` edge function** — it already handles natural language queries and returns structured recommendations.

- Add a toggle/mode switch: "Standard" vs "AI Search" in the search modal
- When AI mode is active, send the query to the `seek` edge function
- Display AI results with match reasons inline
- Debounce AI queries at 500ms (longer than standard 150ms)

### 1c: Cmd/Ctrl+K Shortcut
**File: `src/components/CollapsibleNavbar.tsx`** — Add global keydown listener

```
useEffect → listen for (metaKey || ctrlKey) + "k" → preventDefault → setIsSearchOpen(true)
```

Also show "⌘K" hint badge next to the search icon in the navbar.

---

## Phase 2: Fully Functional Filters on All Pages

### Current State
- `MangaPage`: Has type filter (All/Manga/Manhwa/Manhua), sort popover (Trending/Top Rated/Newest), genre swipe bar. These DO work via `useInfiniteTopManga` / `useInfiniteMangaByGenre`.
- `AnimePage`: Has `BrowseFilterBar` with filter categories (airing/upcoming/etc). Sort is limited.
- `Rankings.tsx`: Has basic filter pills but limited functionality.
- `FilterBar.tsx` component exists but is NOT wired into any page yet.
- `AdvancedFilters.tsx` exists with AniList-compatible filter values but is also unwired.

### 2a: Create `getFilteredManga` / `getFilteredAnime` API functions
**File: `src/lib/api.ts`** — Add new unified query functions

These accept a full filter object and map to AniList GraphQL variables:
- `genre` → AniList `genre` variable
- `year` → `seasonYear` or `startDate_greater/lesser` for decades
- `status` → `status` enum (RELEASING, FINISHED, NOT_YET_RELEASED, HIATUS)
- `type/format` → `countryOfOrigin` (JP/KR/CN) or `format` (MANGA/NOVEL/etc)
- `sort` → mapped to AniList sort enums
- `scoreMin` → `averageScore_greater`
- `search` → `search` variable

### 2b: Create `useInfiniteFilteredManga` / `useInfiniteFilteredAnime` hooks
**File: `src/hooks/useAnimeData.ts`** — Add hooks that accept the full FilterState and call the new API functions with infinite pagination.

### 2c: Wire FilterBar into MangaPage
**File: `src/pages/MangaPage.tsx`**

- Replace the current `GenreSwipeBar` + sort `Popover` + `FORMAT_TABS` with the unified `FilterBar` component
- Connect `useFilterPreferences('manga')` for persistence
- Replace `useInfiniteTopManga` with `useInfiniteFilteredManga` that accepts all filter params
- Keep infinite scroll behavior (already working)

### 2d: Wire FilterBar into AnimePage
**File: `src/pages/AnimePage.tsx`**

- Replace `BrowseFilterBar` with `FilterBar` (adapted for anime type options: TV/Movie/OVA/ONA)
- Connect `useFilterPreferences('anime')` for persistence
- Replace current query hooks with `useInfiniteFilteredAnime`

### 2e: Wire FilterBar into Rankings
**File: `src/pages/Rankings.tsx`**

- Add `FilterBar` below the page header
- Wire to existing data with client-side filtering (Rankings already loads paginated data)

### 2f: Wire FilterBar into WatchlistPage
**File: `src/pages/WatchlistPage.tsx`**

- Add `FilterBar` for client-side filtering of already-loaded watchlist data
- Use Fuse.js (already installed) for live search within watchlist

---

## Phase 3: Search Modal Filter Panel

**File: `src/components/SearchModal.tsx`**

- Add a collapsible "Advanced" section below the search input
- Include: Genre chips (top 12), Year presets, Status toggles, Score range pills
- Filters get passed as additional variables to `useInfiniteSearchManga` / `useInfiniteSearchAnime`
- Update the `searchManga` / `searchAnime` API functions to accept genre, status, year, score params

---

## Estimated File Changes

| File | Action |
|------|--------|
| `src/components/SearchModal.tsx` | **Major edit** — Expert search with filters, voice, saved searches, AI mode |
| `src/components/CollapsibleNavbar.tsx` | **Edit** — Add Cmd+K shortcut, ⌘K badge |
| `src/lib/api.ts` | **Edit** — Add `getFilteredManga()`, `getFilteredAnime()` |
| `src/hooks/useAnimeData.ts` | **Edit** — Add `useInfiniteFilteredManga`, `useInfiniteFilteredAnime` |
| `src/pages/MangaPage.tsx` | **Edit** — Replace filters with FilterBar + unified query |
| `src/pages/AnimePage.tsx` | **Edit** — Replace BrowseFilterBar with FilterBar |
| `src/pages/Rankings.tsx` | **Edit** — Add FilterBar |
| `src/pages/WatchlistPage.tsx` | **Edit** — Add client-side FilterBar |
| `src/components/FilterBar.tsx` | **Edit** — Add search input field, refine for page integration |

