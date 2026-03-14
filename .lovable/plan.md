

## Plan: Library Page Overhaul, Comment Actions, and Card Navigation Audit

### Overview

Three main workstreams: (1) redesign the Watchlist page as a proper "Library" with sorting/filtering, (2) add edit/delete actions to all comment and discussion components, (3) audit card click behavior across the site.

---

### 1. Library Page Redesign (`src/pages/WatchlistPage.tsx`)

Rename conceptually to "Library" (the collection of bookmarks). Add:

- **Sort options**: Recently Added, Title A-Z, Score (high-low), Status
- **Search within library**: text filter on title
- **Improved empty state** with contextual CTA
- **Rename SEO/heading** from "Watchlist" to "Library" / "My Library"
- Add "Library" link to the mobile nav (`MobileBottomNav.tsx`) and the mobile hamburger menu (`CollapsibleNavbar.tsx`) for logged-in users
- Keep existing filters (type, status, category) but add a sort dropdown

**Files**: `src/pages/WatchlistPage.tsx`, `src/components/MobileBottomNav.tsx`, `src/components/CollapsibleNavbar.tsx`

### 2. Comment System — Edit & Delete Actions

Currently only `OriginalChapterComments` has a delete button. The two other comment components (`EpisodeComments.tsx`, `ChapterComments.tsx`) and the `DiscussionCard` have no owner actions.

**Add to all comment components:**
- A `DropdownMenu` (three-dot icon) on comments owned by the current user with:
  - **Edit** — inline editing (replace content with textarea, save/cancel)
  - **Delete** — with confirmation dialog
- For discussions (`DiscussionCard.tsx` / `CommunityPage.tsx`):
  - Owner sees edit/delete options on their posts
  - Edit opens inline or a dialog; delete shows confirmation

**Files**: `src/components/EpisodeComments.tsx`, `src/components/ChapterComments.tsx`, `src/components/community/DiscussionCard.tsx`, `src/pages/CommunityPage.tsx`

### 3. Card Navigation Audit

Both `AnimeCard` and `MangaCard` open detail modals (not route navigation), which is correct. The watchlist page cards navigate via `/${item.media_type}/${item.mal_id}` — need to verify these routes exist and work.

- `AnimeCard` uses `anilist_id` for the modal — correct
- `MangaCard` uses `anilist_id` for the modal — correct
- Watchlist cards navigate to `/${media_type}/${mal_id}` — these are detail page routes, should work
- Ensure `WatchlistButton` `onClick` properly stops propagation (already does)

No major issues found in card navigation; will ensure consistency.

### 4. Bookmark Button Robustness

The `WatchlistButton` returns `null` when no user is logged in. Instead, it should show the button but open the auth modal on click (better UX for discovery).

**Files**: `src/components/WatchlistButton.tsx`

---

### Technical Details

**Comment edit/delete pattern** (applied uniformly):
```tsx
// Three-dot menu on own comments
<DropdownMenu>
  <DropdownMenuTrigger><MoreHorizontal /></DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem onClick={startEdit}>Edit</DropdownMenuItem>
    <DropdownMenuItem onClick={confirmDelete}>Delete</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

**Library sort** added to `WatchlistPage`:
```tsx
const [sortBy, setSortBy] = useState<"recent" | "title" | "score" | "status">("recent");
const [searchQuery, setSearchQuery] = useState("");
// Sort and filter the list before rendering
```

**Estimated files changed**: 6-7 files

