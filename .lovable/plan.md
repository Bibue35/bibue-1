

# Premium Polish & Functional Filters — Implementation Plan

This is a massive scope. I'll break it into focused, ordered phases that build on each other.

---

## Phase 1: Fix Theme System (Critical Bug)

**Problem**: Themes defined in CSS (Celestial, Monochrome, Contrast, Mocha, Latte, Frappé, Macchiato, Crimson Scroll) exist but the `ThemeSelector` only exposes 4 options (Moonlight, Sunlight, Mono, Contrast). The Catppuccin and Crimson themes are unreachable. Additionally, theme classes like `.theme-monochrome` need to be scoped under `.dark` or `:root` correctly.

**Changes**:
- **`ThemeSelector.tsx`**: Expand the `themes` array to include all 9 theme flavors with accurate preview colors. Redesign the selector grid to show all options cleanly (3-column grid).
- **`ThemeContext.tsx`**: Ensure `setFlavor` correctly removes all theme classes before applying the new one (already works but verify).
- **`main.tsx`**: Verify the pre-hydration script applies both `dark`/`light` class AND `theme-{flavor}` on load.
- **`index.css`**: Fix selector specificity for Catppuccin themes — `.theme-mocha`, `.theme-latte` etc. need to override `:root` and `.dark` base vars. Add missing `dark` variant selectors where needed.

---

## Phase 2: Spring-Physics Animations & Micro-Interactions

**Changes**:
- **`index.css`**: Add new CSS keyframes for spring-physics easing using `cubic-bezier(0.34, 1.56, 0.64, 1)` curves:
  - `spring-lift`: translateY + scale with overshoot for card hovers
  - `spring-press`: scale-down with bounce-back for button clicks  
  - `ring-pulse`: box-shadow pulse animation for focused/active elements
  - `parallax-drift`: subtle translateY for hero background on scroll (CSS-only via scroll-driven animations or JS fallback)
  - `glow-breathe`: divine glow intensity oscillation
- **`tailwind.config.ts`**: Register spring animations in the `animation` extend block
- **`AnimeCard.tsx` & `MangaCard.tsx`**: Replace current hover transitions with spring-physics classes. Add `ring-pulse` on focus-visible. Add glassmorphism overlay on hover using `liquid-glass-subtle`.
- **`CinematicHero.tsx`**: Add parallax effect — track scroll position via `useEffect` + `requestAnimationFrame`, apply `translateY` to background at 0.3x scroll rate.
- **All buttons site-wide** (`button.tsx`): Add `btn-press` spring class and `active:scale-[0.96]` with spring bezier.

---

## Phase 3: Glassmorphism + Metallic Reflections Polish

**Changes**:
- **Cards** (`AnimeCard.tsx`, `MangaCard.tsx`): Add `glow-line-top` class for the 1px gradient reveal on hover. Add subtle `divine-hover` glow on the top 3 ranked items.
- **Navbar** (`CollapsibleNavbar.tsx`): When scrolled, add `navbar-shimmer-line` and increase `backdrop-blur` to `blur-2xl`. Add metallic sheen to the logo text using `liquid-metal-text` on hover.
- **Filter pills** (MangaPage, AnimePage, Rankings): Apply `glass-button` class with the existing refraction system. Active state gets `divine-glow` box-shadow.
- **Skeleton shimmer** (`skeleton.tsx`): Already has `skeleton-shimmer` — verify it works across all themes by using CSS custom properties.

---

## Phase 4: Fully Functional Filters & Sorting (Core Feature)

This is the biggest functional change. The AniList API (via `anilist-proxy` edge function) already supports genre, sort, year, status, and format filtering through GraphQL variables.

### 4a: Create `useFilterPreferences` hook
- New file: `src/hooks/useFilterPreferences.ts`
- Reads/writes filter state to `localStorage` key `bibue_filter_prefs`
- Stores: `{ genre, year, status, type, sort, scoreRange }` per page context
- Returns getter/setter/reset functions

### 4b: Create `FilterBar` component
- New file: `src/components/FilterBar.tsx`
- Brutalist typography-driven design (no icons per design rules)
- Filter groups rendered as pill-style toggles:
  - **Genre**: All genres from `BROWSE_GENRES` array (31 genres already defined)
  - **Year**: Range selector or preset pills (2025, 2024, 2023, 2020s, 2010s, Classic)
  - **Status**: Ongoing / Completed / Hiatus / Upcoming
  - **Type**: Manga / Manhwa / Manhua / All
  - **Sort**: Score ↓, Popularity, Favorites, Newest, Oldest, A-Z
  - **Score Range**: 9+, 8+, 7+, 6+ (pill toggles)
- Collapsible on mobile (shows active filter count)
- Real-time: every filter change triggers TanStack Query refetch with new variables
- Active filters shown as removable chips below the bar

### 4c: Update API layer (`lib/api.ts`)
- Add `getFilteredManga()` and `getFilteredAnime()` functions that accept a full filter object
- Map filters to AniList GraphQL variables: `genre`, `year`, `status`, `sort`, `format`, `minimumTagRank`
- Add `useInfiniteFilteredManga` / `useInfiniteFilteredAnime` hooks in `useAnimeData.ts`

### 4d: Update Pages
- **`MangaPage.tsx`**: Replace the current `GenreSwipeBar` + popover sort with the new `FilterBar`. Wire all filters to the infinite query. Keep infinite scroll.
- **`AnimePage.tsx`**: Same treatment — replace `BrowseFilterBar` with `FilterBar`.
- **`Rankings.tsx`**: Replace current basic filter buttons with `FilterBar`. Remove Lucide icons (Crown, Medal, Award, Filter). Keep rank badges as numbered text only.
- **`GenreDetailPage.tsx`**: Add `FilterBar` with genre pre-selected and locked.
- **`WatchlistPage.tsx`**: Add client-side filtering (data is already loaded) with the same `FilterBar` component.

### 4e: Live Search Integration
- The existing `SearchDropdown` and `SearchModal` use `useSearchAnime`/`useSearchManga` hooks
- Add a search input to `FilterBar` that filters the current result set client-side using Fuse.js (already installed)
- For server-side search, use the existing `useInfiniteSearchManga` hook

---

## Phase 5: Layout & Spacing Polish

**Changes**:
- **All page headers**: Increase top padding to `pt-32 sm:pt-40` for breathing room
- **Section spacing**: Use `section-premium` class (64px → 80px → 96px responsive) between all major content sections
- **`ContentSection.tsx`**: Increase bottom margin. Remove any remaining icon references.
- **Typography hierarchy**: Ensure all page titles use `font-sacred liquid-metal-text` with `heading-premium` class. Subtitles use `text-gradient-subtle`.
- **Grid gaps**: Increase from `gap-3 sm:gap-4` to `gap-4 sm:gap-6` for more negative space.

---

## Phase 6: Responsive Mobile ↔ Desktop Transitions

**Changes**:
- **Cards**: On mobile (`< 640px`), cards get smaller padding, tighter text. On desktop, cards get the full glassmorphism treatment.
- **`FilterBar`**: On mobile, collapse to a single "Filters" button that opens a bottom sheet (using `vaul` Drawer, already installed). On desktop, show inline.
- **`MobileBottomNav.tsx`**: Ensure spring animations on tab switch. Add haptic-style visual feedback (scale bounce).
- **Grid columns**: Verify responsive breakpoints render correctly: 2 cols mobile → 3 sm → 4 md → 5 lg → 6 xl.

---

## Estimated File Changes

| File | Action |
|------|--------|
| `src/components/FilterBar.tsx` | **Create** — unified filter component |
| `src/hooks/useFilterPreferences.ts` | **Create** — localStorage persistence |
| `src/hooks/useAnimeData.ts` | **Edit** — add filtered infinite queries |
| `src/lib/api.ts` | **Edit** — add `getFilteredManga/Anime` |
| `src/components/ThemeSelector.tsx` | **Edit** — expand to all themes |
| `src/components/CollapsibleNavbar.tsx` | **Edit** — metallic polish |
| `src/components/AnimeCard.tsx` | **Edit** — spring animations, glassmorphism |
| `src/components/MangaCard.tsx` | **Edit** — spring animations, glassmorphism |
| `src/components/CinematicHero.tsx` | **Edit** — parallax scroll |
| `src/components/ContentSection.tsx` | **Edit** — spacing, typography |
| `src/components/ui/button.tsx` | **Edit** — spring press |
| `src/pages/MangaPage.tsx` | **Edit** — FilterBar integration |
| `src/pages/AnimePage.tsx` | **Edit** — FilterBar integration |
| `src/pages/Rankings.tsx` | **Edit** — FilterBar, remove icons |
| `src/pages/GenreDetailPage.tsx` | **Edit** — FilterBar |
| `src/pages/WatchlistPage.tsx` | **Edit** — FilterBar |
| `src/pages/Index.tsx` | **Edit** — spacing polish |
| `src/index.css` | **Edit** — spring keyframes, theme fixes |
| `tailwind.config.ts` | **Edit** — spring animation tokens |

