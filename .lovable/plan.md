

## Add "Monochrome" Theme (X.com-inspired)

A third theme option alongside Sunlight and Moonlight — pure black, white, and grey with zero color accents except on cover art.

### Changes

**1. `src/contexts/ThemeContext.tsx`**
- Add `"monochrome"` to the `ThemeFlavor` union type
- Update the `classList.remove` call to include `"theme-monochrome"`

**2. `src/index.css`** (append after celestial theme block, ~line 1641)
- Add `.theme-monochrome` light variant: white (#FAFAFA) bg, near-black text, neutral grey accents, no color in primary/accent — pure grey scale
- Add `.dark.theme-monochrome` dark variant: pure black (#000000) bg, white text, `#1F1F1F` card hover, `#71767B` muted text — matching X.com 2026 exactly
- All glass/glow/divine vars set to neutral greys with zero hue — disabling colored effects site-wide when this theme is active

**3. `src/components/ThemeSelector.tsx`**
- Change from a 2-state toggle (light/dark) to a 3-state cycle: **Moonlight** → **Sunlight** → **Monochrome** → repeat
- Moonlight = celestial + dark, Sunlight = celestial + light, Monochrome = monochrome + dark
- Text variant shows the current theme name; icon variant cycles through Moon → Sun → Monitor icons

**4. `src/main.tsx`**
- Add `"theme-monochrome"` to the pre-hydration flavor list so it applies without flash

### CSS Variable Design (Monochrome Dark)

```text
background:   0 0% 0%        (#000000)
foreground:   0 0% 97%       (#F7F7F7)
card:         0 0% 0%        (#000000)
primary:      0 0% 97%       (white — pill buttons)
muted-fg:     0 0% 44%       (#71767B — X grey)
border:       0 0% 16%       (#2F3336 — X border)
accent:       0 0% 8%        (#141414 — hover bg)
divine-glow:  0 0% 50% / 0   (disabled — no colored glow)
```

Monochrome Light mirrors with inverted values: white bg, dark text, light grey borders.

### Theme Cycle Logic

```text
Current         → Next
─────────────────────────
Moonlight       → Sunlight       (celestial light)
Sunlight        → Monochrome     (monochrome dark)
Monochrome      → Moonlight      (celestial dark)
```

No settings page changes needed — the existing navbar toggle handles it.

