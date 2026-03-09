

## Bibue Premium Makeover Plan

Two major deliverables: (1) **Liquid metallic animated section titles** and (2) **Premium floating toolbar component**.

---

### 1. Liquid Metallic Animated Section Titles

**What:** Section headings like "Trending Manhwa", "Top Manga", "All-Time Top Rated" get a chrome/liquid metal text effect with a continuous shimmer animation.

**How:**
- Add a CSS `@keyframes liquid-metal-shimmer` animation in `src/index.css` — a diagonal gradient sweep using silver/chrome colors (`#C0C0C0`, `#E8E8E8`, `#FFFFFF`, `#A0A0A0`) with `background-clip: text` and `background-size: 200%`
- Create a `.liquid-metal-text` utility class that applies the gradient text + animation (3s infinite ease-in-out)
- Light mode variant uses darker metallic tones (`#666`, `#999`, `#BBB`)
- Update `ContentSection.tsx` — apply `liquid-metal-text` class to the `<h2>` title element, remove the `heading-premium` class

### 2. Premium Floating Toolbar

**What:** A new `PremiumToolbar` component — horizontal pill bar fixed at bottom-center of screen (desktop only, hidden on mobile where bottom nav exists).

**Specs:**
- Rounded-3xl, h-12, px-6, shadow-2xl, backdrop-blur-md
- Dark: bg-zinc-950/90; Light: bg-white/90
- 5 items L-to-R with gap-6:
  1. **Score badge** — rounded-xl square with bold "88" (font-semibold tracking-tighter), thin amber-400 ring-1, amber glow on hover only via `box-shadow` transition
  2. **Signal icon** — `Signal` from lucide-react, ghost style
  3. **Layers icon** — `Layers` from lucide-react, ghost style
  4. **FileText icon** — `FileText` from lucide-react, ghost style
  5. **Sun/Moon toggle** — uses `useThemeContext` to toggle mode, swaps `Sun`/`Moon` icon

- All icons: 200ms transitions, hover:scale-105, hover:text-foreground
- Glass effect via backdrop-blur-md + semi-transparent bg
- File: `src/components/PremiumToolbar.tsx`
- Render in `src/pages/Index.tsx` (and optionally site-wide via layout)

### 3. Supporting CSS Changes in `src/index.css`

- Add `liquid-metal-shimmer` keyframes
- Add `.liquid-metal-text` utility
- Add `.toolbar-glass` utility for the floating bar

### 4. Files to Change

| File | Change |
|------|--------|
| `src/index.css` | Add liquid metal keyframes + utility classes |
| `src/components/ContentSection.tsx` | Apply `.liquid-metal-text` to title h2 |
| `src/components/PremiumToolbar.tsx` | New component — floating pill toolbar |
| `src/pages/Index.tsx` | Import and render `PremiumToolbar` |
| `src/components/CinematicHero.tsx` | Apply liquid metal to hero "Trending Now" text |

