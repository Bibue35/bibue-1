

# Motion Polish Implementation Plan

## Summary
Fix broken page transitions, add entrance stagger to card rows, apply spring easing to navbar/bottom-nav show/hide, clean up dead CSS, and add scroll-linked navbar opacity interpolation.

---

## Changes

### 1. `src/index.css` — Add missing page transition classes + polish
Add these CSS rules in the `@layer utilities` block:
- `.page-transition` — base state with `transform-gpu` for GPU compositing
- `.page-entering` — fade-up-spring animation (opacity 0→1, translateY 12→0, 350ms spring curve)
- `@keyframes slideUpFull` — for mobile modal (currently referenced but undefined)
- Spring easing override on dialog `data-[state=open]` animations for smoother modal open/close
- `scroll-snap-align: start` on `.hide-scrollbar > *` for card snapping
- Overscroll behavior on body

### 2. `src/App.css` — Delete contents
File is not imported anywhere. Clear it to remove dead Vite boilerplate code. Leave empty or with a comment.

### 3. `src/components/HorizontalScroll.tsx` — Entrance stagger
Add `entrance-stagger` class to the scroll container div so cards cascade in with the existing 40ms stagger delays defined in CSS.

### 4. `src/components/CollapsibleNavbar.tsx` — Spring easing + smooth opacity
- Change `duration-500 ease-out` → `duration-400` with spring cubic-bezier curve
- Replace binary `bg-background/80` vs `bg-transparent` with scroll-interpolated opacity (use a CSS custom property set via the scroll handler, interpolating 0–1 over 0–150px scroll range)
- This gives a smooth glass-in effect instead of a hard cut at 30px

### 5. `src/components/MobileBottomNav.tsx` — Spring easing
- Change `duration-300 ease-out` → `duration-400` with spring cubic-bezier for the translate-y show/hide transition

### 6. `src/components/AnimatedRoutes.tsx` — No changes needed
The component is correct; it just needs the CSS classes from step 1 to work.

### 7. `src/components/ContentSection.tsx` — Add entrance-stagger to children wrapper
Wrap `{children}` in a div with `entrance-stagger` class gated by `isInView` so content animates in when scrolled into view.

---

## Files

| File | Action |
|---|---|
| `src/index.css` | Add ~30 lines of CSS (page transitions, modal keyframe, dialog spring, snap) |
| `src/App.css` | Clear contents |
| `src/components/HorizontalScroll.tsx` | Add `entrance-stagger` class to scroll container |
| `src/components/CollapsibleNavbar.tsx` | Spring easing + scroll-interpolated bg opacity |
| `src/components/MobileBottomNav.tsx` | Spring easing on show/hide |
| `src/components/ContentSection.tsx` | Add `entrance-stagger` to children wrapper |

No new dependencies. No structural changes. Pure CSS + minor class additions.

