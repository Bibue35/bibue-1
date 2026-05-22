## Bibue 2.0 — Pass 1: `/brand`

This pass establishes the editorial visual language for every subsequent marketing page. It is intentionally narrow: one page, one source-of-truth file, one hero asset. Nothing in `Index`, `App.tsx` routes, or any backend code changes.

### 1. Pricing source-of-truth — `src/lib/pricing/tiers.ts` (NEW)

A single typed module that every marketing page imports. No prices, percentages, or SLA numbers will live anywhere else.

Exports:
- `PRICING.monthly = { amount: 8.99, currency: "USD", display: "$8.99" }`
- `REVENUE_SHARE = { publishers: 0.52, creatorsDefault: 0.67, creatorsStudio: 0.80 }`
- `WEDGE = { languagesOnDay1: 60, takedownSLAHours: 24, industryAvgPublisherShare: 0.35 }`
- `TIERS` array with the Monthly / Quarterly / Annual labels already used on `/subscribe` so existing copy keeps working
- Small helpers: `formatPct(0.52) → "52%"`, `formatPrice(PRICING.monthly) → "$8.99"`

Memory note: `/subscribe` currently hard-codes "$8.99 per month" — that will be refactored to read from `tiers.ts` in the `/subscribe` pass, not this one.

### 2. Hero portrait asset

Generate one editorial 3:4 portrait per the brief and save to `src/assets/brand-hero-reader.jpg`.

- Subject: modern manga reader, single figure, three-quarter profile, reading a paper volume
- Lighting: window light from frame-left, soft falloff, "illuminated manuscript" feel
- Background: deep near-black (Moonlight), no environmental clutter
- Mood: quiet, contemplative, FSG photo essay — not anime cover art
- Tier: `standard` (no text in the image)

### 3. Redesign `src/pages/BrandPage.tsx`

Reuses existing sections (Logo, Colors, Typography, Voice, Don'ts, Motion) and existing exports (`VOICE_PRINCIPLES`, `DONTS`) so source-of-truth status is preserved. What changes is composition, rhythm, and the gold treatment.

Structural beats from top to bottom:

```text
┌───────────────────────────────────────────────────────┐
│ Eyebrow:  BIBUE — BRAND SYSTEM 2.0                    │
│ H1 (Cinzel 7xl):                                      │
│   A quiet system for                                  │
│   a loud medium.  ← last 3 words italic + gold        │
│                                                       │
│ Lede (max-w-xl, text-base):                           │
│   One agreement. One storefront. 60+ languages.       │
└───────────────────────────────────────────────────────┘
   gold hairline divider, 60% opacity, full-bleed

┌───────────────── 2-col, asymmetric ───────────────────┐
│  Left col (5/12):       │ Right col (7/12):           │
│  Moonlight inset card   │ 01 — THE READER             │
│  with brand-hero-reader │ Cinzel h2: "Made for the    │
│  3:4, 1px gold border,  │  long read."                │
│  font-mono caption      │ 3 short paragraphs, max-w-  │
│  bottom edge            │ 2xl, body text-sm           │
└───────────────────────────────────────────────────────┘
   gold hairline divider

02 — THE NUMBERS (replaces nothing; new section)
  Three numbered bordered rows (no card grid):
    52%   PUBLISHER SHARE     vs. ~35% industry avg
    67%   CREATOR DEFAULT     up to 80% on Studio
    24h   TAKEDOWN SLA        non-exclusive licensing
  All values from tiers.ts. Numerals in font-sacred 5xl gold.

03 — LOGO & WORDMARK     (existing section, restyled)
04 — COLOR PALETTE       (existing, restyled with gold dividers)
05 — TYPOGRAPHY          (existing, restyled)
06 — VOICE & TONE        (existing; VOICE_PRINCIPLES retained)
07 — THINGS WE NEVER DO  (existing DONTS list, restyled)
08 — MOTION              (existing, restyled)

   gold hairline divider
   Closing eyebrow: INTERNAL REFERENCE — v2.0 — LOUIS T.
```

Style rules applied across the page:

- Container: `max-w-6xl` for hero/wide rows, `max-w-3xl` for editorial body, `max-w-2xl` for long copy
- Section spacing: `py-32` hero, `mb-24` between editorial sections, `mb-3`/`mb-6` within
- Eyebrows: `text-[10px] uppercase tracking-[0.3em] text-primary/80` (gold, not muted)
- Section numerals: solid gold `01 —`, `02 —`
- Climactic word in H1 set in `italic text-primary`
- Dividers: full-bleed `h-px bg-primary/60`
- Links: 1px gold underline (`underline decoration-primary decoration-1 underline-offset-4`)
- No `rounded-full`, no glass, no gradients, no shadcn `Card` nesting, no identical card grids
- All colors via semantic tokens — `bg-background`, `text-foreground`, `bg-primary`, `border-primary/60`. No raw hex except inside the existing COLOR_TOKENS reference table.
- Framer Motion fade-up on the hero block only (200ms, `ease-out-expo`), nothing decorative

### 4. Out of scope for this pass

- `Index.tsx` (two-mode `/` lands in Pass 2 after the language is approved on `/brand`)
- `/subscribe` refactor to consume `tiers.ts`
- New `/corporate` and `/for-publishers` routes
- Any `App.tsx` route changes
- Anything under `supabase/`, `src/integrations/`, `src/hooks/`, or `src/contexts/`

### Technical notes

- Files touched: `src/pages/BrandPage.tsx` (rewrite), `src/lib/pricing/tiers.ts` (new), `src/assets/brand-hero-reader.jpg` (new)
- No new dependencies. Framer Motion 12 (`framer-motion`) is verified present.
- The Sunlight palette is already correctly defined in `src/index.css` `:root` — `BrandPage` will not need a theme override; it will render in whatever theme is active. The Moonlight inset for the hero figure is achieved with a hard-coded `bg-[hsl(0_0%_2%)]` wrapper (this matches the pattern already used in the existing Logo section).
- After Pass 1 ships and is approved, Pass 2 will plan the two-mode `/` (marketing hero for logged-out, current reader home for authenticated).