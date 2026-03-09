

# Bibue Premium Makeover — Complete Visual Upgrade

A site-wide elevation touching every layer: typography, cards, layout, micro-animations, page views, and navigation polish.

---

## 1. Enhanced Liquid Metal Titles with Stagger Reveal

**File:** `src/index.css`
- Slow down `liquid-metal-shimmer` to 4s for a more premium feel
- Add a new `.section-reveal` utility: titles fade-up + scale from 0.97 on scroll into view (pairs with existing `useInView` hook)
- Add `.text-gradient-subtle` for secondary headings (muted silver, no animation)

**File:** `src/components/ContentSection.tsx`
- Wrap section header in a reveal animation container
- Add subtle counter-animation on the "See All" arrow (slide-right on hover)

## 2. Upgraded Card Design — Depth + Micro-interactions

**File:** `src/components/MangaCard.tsx`
- Add a subtle inner glow line at top of card on hover (1px gradient line, like `divine-card::before`)
- Improve badge styling: use `glass-panel` class for score badges with slightly more blur
- Add a gentle parallax-like tilt effect on hover using CSS `perspective` + `rotateX(2deg)` (no JS needed, pure CSS `:hover`)
- Bottom metadata area: add a soft divider line between title and meta

**File:** `src/index.css`
- Add `.card-tilt-hover` utility: `perspective(800px) rotateX(2deg) rotateY(-1deg)` on hover with 500ms transition
- Add `.glow-line-top` pseudo-element utility for the top edge highlight

## 3. Homepage Layout Refinements

**File:** `src/pages/Index.tsx`
- Increase spacing between sections using a consistent `gap` wrapper
- Add a "Welcome back, {username}" greeting card for logged-in users (glassmorphic panel, liquid-metal name text)
- Add view mode toggle to homepage: carousel (current) vs grid view — stored in localStorage
- Grid view renders a 3-col (mobile 2-col) grid of MangaCards instead of HorizontalScroll

## 4. View Format Toggle Component

**File:** `src/components/ViewToggle.tsx` (new)
- Simple toggle between "carousel" and "grid" icons (LayoutGrid / Rows3 from lucide)
- Stores preference in localStorage key `bibue-view-mode`
- Minimal pill design matching the premium aesthetic

**File:** `src/pages/Index.tsx`
- Each ContentSection conditionally renders HorizontalScroll or a CSS grid based on view mode
- Grid mode: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4`

## 5. Footer Elevation

**File:** `src/components/Footer.tsx`
- Add a subtle top-edge glow line (gradient border-top)
- Add the liquid-metal-text treatment to "Bibue" brand text
- Increase vertical padding, add a decorative divider between sections
- Social icons: add hover scale + silver glow transition

## 6. Navbar Polish

**File:** `src/components/CollapsibleNavbar.tsx`
- Add a subtle bottom edge gradient line when scrolled (1px shimmer)
- Nav links: add `.nav-underline` class for hover underline animation (already exists in CSS, just needs applying)

## 7. Premium Floating Toolbar — Silver Conversion

**File:** `src/components/PremiumToolbar.tsx`
- Change the gold rotating conic-gradient to **silver** tones: replace `#e8af48` → `#C0C0C0`, `#c49746` → `#A8A8A8`, `#feeaa5` → `#E8E8E8`, `#533517` → `#4A4A4A`
- White hotspots stay, pink/blue iridescence hints stay but shift cooler
- Glow layer: silver `#C0C0C0` at 0.15 opacity instead of gold

## 8. Detail Modal & Page Enhancements

**File:** `src/components/MangaDetailModal.tsx`
- Apply `glass-panel` to the modal overlay background
- Add liquid-metal-text to the manga title in the modal
- Tab buttons: apply `.nav-underline` active state styling

## 9. Global Micro-animations in CSS

**File:** `src/index.css`
- Add `.hover-grow` utility: `scale(1.03)` on hover, 300ms ease
- Add `.fade-border` utility: border-color transitions from transparent to `silver/0.2` on hover
- Add `.entrance-stagger` for grid children: each child delays 40ms with fade-up
- Enhance `.skeleton-shimmer` with a slightly faster cycle (1.5s) and add a faint silver specular highlight
- Add `@keyframes breathe` (subtle 0.98-1.02 scale loop) for featured/hero elements

## 10. Rankings Page Grid Enhancement

**File:** `src/pages/Rankings.tsx`
- Apply `card-tilt-hover` to ranking items
- Increase row height to 120px+ as per premium spec
- Rank numbers: apply `liquid-metal-text` to the rank number for top 3

---

## Files Summary

| File | Action |
|------|--------|
| `src/index.css` | Add ~8 new utility classes, update shimmer timing, add breathe keyframe |
| `src/components/ContentSection.tsx` | Add reveal animation, arrow hover effect |
| `src/components/MangaCard.tsx` | Add tilt hover, glow line, improved badges |
| `src/components/ViewToggle.tsx` | New — carousel/grid view toggle |
| `src/pages/Index.tsx` | View mode toggle integration, greeting card, spacing |
| `src/components/Footer.tsx` | Glow line, liquid metal brand, spacing |
| `src/components/CollapsibleNavbar.tsx` | Bottom edge shimmer, nav-underline links |
| `src/components/PremiumToolbar.tsx` | Gold → Silver conversion |
| `src/components/MangaDetailModal.tsx` | Glass panel, liquid metal title |
| `src/pages/Rankings.tsx` | Tilt hover, taller rows, metallic rank numbers |

All changes are CSS/component-level, no backend modifications needed. Mobile-first, 60fps GPU-accelerated, respects `prefers-reduced-motion`.

