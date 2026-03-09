

# Bibue Premium Redesign — Inspired by BestDesignsOnX

The reference site showcases: large serif/italic hero typography with colorful accent word, clean masonry-style card grid, generous whitespace, minimal chrome, view toggles (list/grid/masonry), and a very refined floating toolbar. Here is the plan to bring those design patterns into Bibue.

---

## 1. Hero Typography Overhaul

**File:** `src/components/CinematicHero.tsx`
- Replace the current `heading-premium` class on the manga title with a new split-word treatment: the title renders normally but a secondary tagline like *"Discover Peak"* uses a large serif italic style (Cinzel/serif italic) with the accent word in a gradient color — matching the BestDesignsOnX hero where "Designs" is italic and colored
- Add a subtitle line: "Manga, Manhwa & Manhua" in muted foreground, spaced generously
- Increase vertical padding and whitespace around the hero content area

## 2. Masonry-Style View Mode

**File:** `src/components/ViewToggle.tsx`
- Add a third view option: **masonry** (using a `Columns3` icon from lucide)
- The three modes: carousel (rows), grid (uniform), masonry (variable height)

**File:** `src/pages/Index.tsx`
- Masonry mode renders cards in a CSS `columns-2 sm:columns-3 lg:columns-4 xl:columns-6` layout with `break-inside-avoid` on each card — pure CSS masonry without JS
- Each card in masonry mode uses natural aspect ratio instead of fixed 3:4

**File:** `src/components/MangaCard.tsx`
- Add a `masonry` variant that removes the fixed `aspect-[3/4]` constraint, letting the image use its natural height, and uses slightly different padding

## 3. Cleaner Card Design

**File:** `src/components/MangaCard.tsx`
- Simplify the card: remove the `card-tilt-hover` class (too heavy for the clean aesthetic)
- Use a cleaner border: `border border-border/10` default, `border-border/30` on hover
- Softer shadow on hover: `shadow-lg` instead of the current complex box-shadow
- Reduce border-radius from `rounded-3xl` to `rounded-2xl` for a crisper look
- Remove the `glow-line-top` — replace with a simple `hover:brightness-[1.02]` on the image

## 4. Section Headers — Lighter Treatment

**File:** `src/components/ContentSection.tsx`
- Remove the icon badge container (the colored rounded-xl box) — instead render the icon inline next to the text at the same size
- Make titles use the serif font (`font-sacred`) for a more editorial feel, keep `liquid-metal-text`
- Increase bottom margin between header and content for more breathing room

## 5. Homepage Spacing & Layout

**File:** `src/pages/Index.tsx`
- Add more vertical spacing between sections: increase from `py-12 sm:py-16` to `py-16 sm:py-20 lg:py-24`
- Welcome greeting: simplify to just the username in liquid-metal, no glass-panel wrapper
- Creator banner: make it more minimal — reduce padding, use a thin top border instead of full border

## 6. Floating Toolbar Polish

**File:** `src/components/PremiumToolbar.tsx`
- Already matches the BestDesignsOnX reference closely (the screenshot shows our exact toolbar in the top-left card). Keep as-is with silver ring.

## 7. Global CSS Refinements

**File:** `src/index.css`
- Add `.font-editorial` utility: `font-family: 'Cinzel', Georgia, serif; font-style: italic;` for accent words
- Reduce `entrance-stagger` delays to 30ms for faster cascade
- Add `.masonry-grid` utility: `columns: 2; gap: 1rem;` with responsive variants

## 8. Footer — More Editorial

**File:** `src/components/Footer.tsx`
- Center-align everything with more whitespace
- "Bibue" in the footer uses `font-editorial` + `liquid-metal-text` for the accent treatment

---

## Files Summary

| File | Change |
|------|--------|
| `src/components/CinematicHero.tsx` | Serif italic hero tagline, more whitespace |
| `src/components/ViewToggle.tsx` | Add masonry view mode |
| `src/components/MangaCard.tsx` | Cleaner card, masonry variant, simpler hover |
| `src/components/ContentSection.tsx` | Inline icon, serif titles, more spacing |
| `src/pages/Index.tsx` | Masonry mode, increased spacing, simpler greeting |
| `src/index.css` | Editorial font, masonry utility, stagger timing |
| `src/components/Footer.tsx` | Editorial brand treatment |

No backend changes needed. All CSS/component-level.

