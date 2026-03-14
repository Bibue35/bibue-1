

## Plan: Replace Moonlight Orange Accent with Blue

### What Changes

The Moonlight (celestial dark) theme currently uses a gold/orange accent (`42 100% 50%` ≈ #E5A100). This will be replaced with a refined blue tone across all CSS variables and the theme selector preview.

**Sunlight keeps its warm gold** — only the dark mode celestial variables change.

### Files to Edit

**1. `src/index.css`** — Update the `.dark` block's accent-related variables from gold (`42 100% 50%`) to blue (~`217 80% 56%`):
- `--primary`, `--ring`, `--sidebar-primary`, `--sidebar-ring`, `--glow-color`
- Keep `--primary-foreground` as white/light since blue needs light text on it

**2. `src/components/ThemeSelector.tsx`** — Update the Moonlight preview accent from `#E5A100` to the matching blue hex (~`#3B82F6`)

**3. `tailwind.config.ts`** — Optionally update `neon.gold` references or keep them as-is since they're only used in non-theme-dependent admin/support contexts

### Blue Tone

Using `217 80% 56%` — a clean, slightly warm blue that reads well on pure black backgrounds. Not too electric, not too muted. Similar to `#3B82F6`.

