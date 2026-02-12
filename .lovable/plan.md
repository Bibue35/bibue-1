

# Finish Localization and Clean Up Dead Code

Complete the remaining translation work and fix all outstanding issues identified in the audit.

---

## Scope

### Files requiring translation updates (8 files):

1. **`src/contexts/LanguageContext.tsx`** -- Add ~150 new translation keys across all 8 languages for the items below.

2. **`src/pages/AnimeDetail.tsx`** -- Replace ~20 hardcoded strings with `t()` calls: error states, section headers (Synopsis, Genres, Studios, Information), info grid labels (Source, Episodes, Status, Aired, Rating, Rank, Popularity, Duration), comment section text, toast messages, and player placeholder text.

3. **`src/pages/MangaDetail.tsx`** -- Replace ~20 hardcoded strings with `t()` calls: error states, action buttons (Read First, Continue, Bookmark, Back to Manga), info grid labels (Author, Rating, Status, Last Update, Alternatives), chapter list header and labels, comment section text.

4. **`src/pages/ClassicsPage.tsx`** -- Replace ~12 hardcoded strings with `t()` calls: hero section text, filter labels (Era, Browsing, All Classics), decade labels, empty state, and fix the always-visible Japanese subtitle to only show when `language === "ja"`.

5. **`src/components/settings/AvatarPicker.tsx`** -- Replace ~10 hardcoded strings: "Upload" tab, search placeholder, empty states, upload area text, dialog buttons (Cancel, Use This Avatar, Choose File, Uploading...).

6. **`src/components/CategoryBar.tsx`** -- Replace collection labels (Trending, This Season, New This Week, Completed, Coming Soon, Most Popular, Classics) with `t()` calls. Genre names stay in English as they are industry-standard terms.

7. **`src/pages/AdminPage.tsx`** -- Replace ~6 hardcoded strings: dashboard title, description, access denied text.

8. **`src/components/admin/ReportQueue.tsx`** and **`src/components/admin/UserManagement.tsx`** -- Replace all admin UI strings with `t()` calls (~30 strings total across both files).

### Dead code and broken links (2 files):

9. **`src/components/Navbar.tsx`** -- Delete this file entirely. It is unused (the app uses `CollapsibleNavbar` and `FloatingNav` instead) and contains a broken `/rankings` link.

10. **Verify `DeferredAnimeSections.tsx`** -- Already fixed in previous pass; confirm the `/rankings` link was changed.

---

## Implementation Order

### Step 1: Add all missing translation keys to LanguageContext
Add keys grouped by feature area:
- `detail.*` -- Source, Episodes, Status, Aired, Rating, Rank, Popularity, Duration, Author, Last Update, Alternatives, Synopsis, Genres, Studios, Information, Chapters Available, Read First, Continue Reading, Bookmark, Back to Manga, No Synopsis, Error Loading
- `classics.*` -- Classic Collection, Anime Classics, explore description, For You, Saved, Era, Browsing, All Classics, No Anime Found, Sorted by Score
- `avatar.*` -- Upload, Search Characters, No Characters Found, Try Different Term, Upload Your Own, Choose File, Uploading, Recommended Size, Cancel, Use This Avatar
- `category.*` -- Trending, This Season, New This Week, Completed, Coming Soon, Most Popular, Classics
- `comments.*` -- Comment Section, Share Thoughts, Sign In To Comment, Post Comment, Loading Comments, No Comments Yet, Latest, Top
- `admin.*` -- Moderation Dashboard, Manage Reports, Access Denied, No Permission, Report Queue, Total Reports, Pending, Resolved, Dismissed, Resolve, Dismiss, No Reports, User Management, Search Users, Ban, Unban, Ban User, Ban Description, Reason, Duration, Confirm Ban, Loading
- `common.*` -- Go Home, Return Home, Something Went Wrong, Cancel, Error, Sign In To (various)

### Step 2: Apply translations to AnimeDetail.tsx
Import `useLanguage`, replace all hardcoded strings.

### Step 3: Apply translations to MangaDetail.tsx
Import `useLanguage`, replace all hardcoded strings.

### Step 4: Apply translations to ClassicsPage.tsx
Import `useLanguage`, replace strings, fix JP subtitle conditional.

### Step 5: Apply translations to AvatarPicker.tsx
Replace remaining hardcoded strings (some already use `t()`).

### Step 6: Apply translations to CategoryBar.tsx
Replace collection labels with `t()` calls for the 7 collection categories.

### Step 7: Apply translations to AdminPage.tsx, ReportQueue.tsx, UserManagement.tsx
Replace all admin panel strings.

### Step 8: Delete Navbar.tsx
Remove the unused component file.

---

## Technical Notes

- All translations follow the existing pattern: `const { t, language } = useLanguage()`
- LanguageContext will grow by approximately 150-200 lines
- No new dependencies, no database changes, no backend changes
- Genre names in CategoryBar remain in English as they are internationally recognized terms
- Admin pages are lower priority for translation since only moderators/admins see them, but included for completeness
- The Japanese subtitle fix (only show when `language === "ja"`) applies to ClassicsPage the same way it was already fixed in StatsPage

