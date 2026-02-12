

# Perfect Bibue End-to-End

A comprehensive polish pass addressing broken links, hardcoded English text, missing translations, and UI consistency issues across every page.

---

## Issues Found

### 1. Broken Route: `/rankings` link in Navbar
The `Navbar.tsx` component links to `/rankings`, but the Rankings route was removed from `App.tsx`. This means desktop users clicking "Rankings" in the old Navbar get a 404. The `DeferredAnimeSections.tsx` also links to `/rankings`.

### 2. Hardcoded English Across Multiple Pages
The following pages/components still contain untranslated strings:

**StatsPage.tsx** -- All labels are English-only:
- "My Stats", "Watch Time", "Episodes", "Chapters", "Avg Score", "Status Breakdown", "Watching", "Completed", "On Hold", "Dropped", "Plan to Watch", "Completion Rate", "Sign in to view your stats", "No data yet", "Loading stats..."

**UserProfile.tsx** -- Tabs and labels:
- "Activity", "Badges", "Lists", "Recent Activity", "Edit Profile", "Back to Community", "User not found", "Followers", "Following", "Stats", "Karma", "Joined X ago", "No badges earned yet", "User's lists will appear here", "View your watchlist"

**ClassicsPage.tsx** -- Hero and filter text:
- "Classic Collection", "Anime Classics", "Explore the timeless masterpieces...", "All Classics", "For You", "Saved", "Browsing:", "No anime found for this era", "Sorted by score", decade labels

**MessagesPage.tsx**:
- "Please sign in to view your messages", "Loading..."

**AnimeDetail.tsx** -- Metadata labels:
- "Source", "Episodes", "Status", "Aired", "Rating", "Rank", "Popularity", "Duration", "Share your thoughts...", "Sign in to comment...", "Post Comment", "Sign in to Comment"

**MangaDetail.tsx** -- Metadata labels:
- "Author", "Rating", "Status", "Last Update", "Share your thoughts...", "Sign in to comment...", "Post Comment"

**AvatarPicker.tsx**:
- "Upload", "Choose File", "Uploading...", "Recommended: Square image, max 2MB", "No characters found", "Search for your favorite character", "Use This Avatar", "Cancel", "Search anime/manga characters..."

**NotFound.tsx**:
- "Page Not Found", "The page you're looking for doesn't exist...", "Return Home"

**RecommendationsPage.tsx**:
- Media type labels "Anime"/"Manga" in the toggle are hardcoded

**WatchlistPage.tsx**:
- "All Categories", "Uncategorized", "Category" placeholder

### 3. `Navbar.tsx` is Unused (dead code)
The app uses `CollapsibleNavbar` and `FloatingNav`, but `Navbar.tsx` still exists with a broken `/rankings` link. It should be cleaned up or removed.

### 4. `/rankings` Links in DeferredAnimeSections
Links to `/rankings` in `DeferredAnimeSections.tsx` point to a removed route.

### 5. Japanese subtitle shown on StatsPage for all languages
`StatsPage.tsx` line 106 always shows the JP subtitle regardless of language setting.

---

## Implementation Plan

### Step 1: Add Missing Translation Keys
Add all missing keys to `LanguageContext.tsx` for all 8 languages. This includes keys for:
- Stats page labels (watch time, episodes, chapters, avg score, status breakdown, completion rate)
- User profile labels (activity, badges, lists, followers, following, edit profile, karma, joined)
- Classics page labels (classic collection, anime classics, all classics, browse by decade, era, sorted by score)
- Messages page labels (sign in to view messages)
- Detail page metadata (source, aired, rating, duration, rank, popularity, author, last update)
- Comments (share your thoughts, sign in to comment, post comment)
- Avatar picker (upload, choose file, uploading, recommended, no characters found, search character, use this avatar, cancel)
- 404 page (page not found, return home)
- Watchlist extras (all categories, uncategorized)

### Step 2: Apply `t()` to StatsPage
Replace all hardcoded strings with translation function calls. Fix the JP subtitle to only show when `language === "ja"`.

### Step 3: Apply `t()` to UserProfile
Translate tab labels, section headers, follow stats, action buttons, and empty states.

### Step 4: Apply `t()` to ClassicsPage
Translate hero section, decade labels, filter text, and empty states.

### Step 5: Apply `t()` to MessagesPage
Translate sign-in prompt and loading state.

### Step 6: Apply `t()` to AnimeDetail and MangaDetail
Translate metadata labels and comment section text.

### Step 7: Apply `t()` to AvatarPicker
Translate tab labels, upload text, search placeholder, and dialog buttons.

### Step 8: Apply `t()` to NotFound
Translate heading, description, and button text.

### Step 9: Fix Broken `/rankings` Links
- **Navbar.tsx**: Remove the `/rankings` link (or remove the file if it's unused)
- **DeferredAnimeSections.tsx**: Change `/rankings` to `/anime?filter=bypopularity` or similar valid route

### Step 10: Fix RecommendationsPage Media Type Labels
Use `t("stats.anime")` / `t("stats.manga")` for the toggle labels instead of hardcoded "Anime"/"Manga".

### Step 11: Fix WatchlistPage Category Strings
Translate "All Categories", "Uncategorized", and "Category" placeholder.

---

## Technical Details

- All changes are in the `src/` directory only
- The `LanguageContext.tsx` file will grow by ~200-300 lines to accommodate new keys across all 8 languages
- No new dependencies needed
- No database or backend changes required
- All fixes follow existing patterns (using `useLanguage()` hook and `t()` function)
- The JP subtitle pattern (only show when `language === "ja"`) is already established and will be applied consistently

