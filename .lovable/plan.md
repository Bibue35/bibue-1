# Align LandingPage with DESIGN.md

The current `/` landing for logged-out visitors works, but it violates several rules in the uploaded DESIGN.md spec. This plan brings it into compliance without changing the page's structure or what the user sees in big strokes — same hero wrap, same wedge, same closing band — but rebuilt against tokens, voice, and component rules.

## What changes

### 1. Use semantic tokens, not hardcoded HSL
Today the file is full of `bg-[hsl(40_30%_95%)]`, `text-[hsl(42_100%_50%)]`, etc. DESIGN.md mandates token-driven theming so the page adapts to Sunlight / Moonlight / Monochrome / Contrast.
- Replace every hardcoded color with `bg-background`, `text-foreground`, `text-primary`, `bg-muted`, `border-border`, etc.
- The dark inset card uses Moonlight register: keep it dark by inverting tokens locally (`bg-foreground text-background`) rather than hardcoded near-black.

### 2. Voice / copy fixes (anti-patterns)
DESIGN.md bans em dashes and exclamation marks in marketing copy.
- Eyebrow `Bibue 2.0 — Private beta` → `Bibue 2.0 · Private beta` (or comma).
- `By invitation — qualified partners only` → comma.
- Section eyebrows `01 — The wedge`, `02 — Read with us` → `01 · The wedge`, `02 · Read with us` (matches BrandPage micro-eyebrow pattern).
- Stat row label `vs ~35% industry average` keep, no em dash present.

### 3. Pricing from source of truth
Hardcoded `Eight ninety-nine` violates "Hardcoded prices outside `tiers.ts`".
- Import the reader-plan price from `src/lib/pricing/tiers.ts` and render it. Keep the spelled-out style if the tier exposes a display string; otherwise show the numeric price (`$8.99 / month`) with the same italic gold emphasis treatment.

### 4. Typography
- `font-black` is not in the spec; Cinzel ships at 700. Swap `font-black` → `font-bold` on the big wordmarks (Cinzel Bold is the wordmark per `features/brand/internal-guidelines` memory).
- Hero headline already uses `font-sacred font-bold`. Keep.

### 5. Hero figure block (currently missing)
DESIGN.md calls for a vertical 3:4 portrait hero figure on Moonlight inset with a 1px gold hairline border and a mono caption. The asset already exists at `src/assets/brand-hero-reader.jpg`.
- Add a new section between the hero and the wedge: left column figure (3:4, `border border-primary/60`, dark inset), right column an eyebrow + short editorial paragraph.
- Caption at bottom edge: `text-[9px] tracking-[0.25em] uppercase text-white/50 font-mono`.

### 6. CTA shape
DESIGN.md: primary CTA is a gold pill but explicitly never `rounded-full`; use `rounded-sm` or none. The current CTAs are already not `rounded-full` — keep `rounded-sm` to make the intent explicit and consistent with BrandPage.

### 7. Motion / rhythm tightening
- Add subtle entrance: `animate-fade-up-spring` on the inset card and on each wedge row (no `framer-motion`, stays CSS-only — matches the earlier fix).
- Vary vertical rhythm: hero `py-32 md:py-48`, hero-figure section `py-24`, wedge `py-32`, closing band `py-32`. Avoid uniform spacing.

## What does NOT change
- Page routing (`RootRoute` in `App.tsx` stays as-is).
- The two-arc perspective wordmark composition.
- The dark inset card placement.
- The four-row wedge content and numbers.
- The closing band layout.
- `CollapsibleNavbar` and `SEO` usage.

## Files touched
- `src/pages/LandingPage.tsx` — rewrite color classes to tokens, swap copy punctuation, swap font weight, add hero-figure section, wire price from `tiers.ts`.

No new dependencies. No backend changes. No new routes.

## Out of scope (call out, do not do)
- Generating a fresh hero figure — reuse the existing `brand-hero-reader.jpg`.
- Building a `/figures` preview page mentioned in DESIGN.md §Source of truth.
- Editing `BrandPage.tsx` or `tiers.ts` — they are the source of truth and stay untouched.
- Theme switcher UI on the landing (page just inherits whatever theme is active).
