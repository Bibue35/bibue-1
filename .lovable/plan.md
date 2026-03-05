

## Fix Card Sizing Consistency and Remove Borders

### Problems
1. **Inconsistent card widths**: Anime cards use `w-28 sm:w-36 md:w-44`, Manga cards use `w-36 sm:w-40 md:w-48`, ContinueRow uses `w-32 sm:w-40 md:w-44`
2. **Visible border/outline** on cards: `border border-border/60` on the inner wrapper
3. **Hover image clipping**: The `overflow-hidden` on the border wrapper clips the scale effect within the border

### Changes

**1. `src/components/AnimeCard.tsx`** (default variant, ~line 102)
- Remove `border border-border/60` from the inner card div
- Keep `overflow-hidden` on the image container (already there at line 104) so the image scale stays contained
- The outer `rounded-2xl sm:rounded-3xl overflow-hidden` on the card div stays to clip corners, but no border drawn

**2. `src/components/MangaCard.tsx`** (default variant, ~line 80)
- Same border removal from inner card div

**3. Standardize wrapper widths** across all carousel consumers to a single set: `w-32 sm:w-40 md:w-48`
- `src/components/DeferredAnimeSections.tsx` line 25: change from `w-28 sm:w-36 md:w-44`
- `src/components/DeferredMangaSections.tsx` line 25: already `w-36 sm:w-40 md:w-48` — adjust to match
- `src/components/CinematicHero.tsx` line 283: change from `w-28 sm:w-36 md:w-44`
- `src/components/ScheduleSection.tsx` lines 80, 91: change from `w-28 sm:w-36 md:w-44`
- `src/components/ContinueRow.tsx` line 21: change from `w-32 sm:w-40 md:w-44`

**4. Hover behavior** — keep the card's outer div with `overflow-hidden` and `rounded-2xl` so the image scale (1.05x) is contained within the card's rounded corners without bleeding into adjacent cards. The `-translate-y-3` lift on hover gives depth without expanding bounds.

### Result
All cards will be uniform width, borderless, and the hover scale effect will be neatly contained by the card's own rounded clip — no overflow into neighbors.

