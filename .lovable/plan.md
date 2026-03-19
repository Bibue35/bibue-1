

## Swap Sections & Add Content Type Switcher

### What changes

1. **Swap positions**: Move "Recently Updated" above "Top Manga" on the homepage, so the order becomes: Continue Reading → Recently Viewed → Recently Updated → Top Manga → Trending Manhwa → ...

2. **Add content type switcher to both sections**: Replace the static "Manga" word in "Top Manga" and "Recently Updated" titles with a toggleable button group (Manga / Manhwa / Manhua). Clicking switches the data source:
   - "Top Manga" → "Top Manhwa" / "Top Manhua" (uses `useTopManga` with `type` param: `'manga'`, `'manhwa'`, `'manhua'`)
   - "Recently Updated" → same hook but filtered by type

3. **Implementation**: Add a `useState<'manga' | 'manhwa' | 'manhua'>` for each section. Render a small pill toggle group (3 buttons) in the `headerExtra` alongside the existing view toggle. The selected type feeds into the query hook parameters.

### Files to modify

- **`src/pages/Index.tsx`** — Swap section order, add state for content type per section, render toggle buttons, pass type to hooks. The "Recently Updated" section also needs to lose its deferred wrapper since it's now above the fold.

