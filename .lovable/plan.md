

## Fix Swipe Navigation Jittering and Lag

### Problem Analysis

The swipe-to-navigate experience feels bad because of **three conflicting motion systems** fighting each other:

1. **Bounce-back before navigation**: When you finish swiping, the page snaps BACK to center (`translate3d(0,0,0)`) over 300ms, then 80ms later the route changes. So the page bounces back toward you before the new page loads -- very jarring.

2. **Page-enter animation on every route change**: `AnimatedRoutes` uses `key={location.pathname}` which forces a full unmount/remount, and applies a `page-enter` CSS animation (fade up from `translateY(10px)` + opacity 0 to 1 over 300ms). This creates a second visible animation after the bounce-back.

3. **Heavy page re-render**: Because of `key={location.pathname}`, the entire page tree is destroyed and rebuilt on every swipe, causing main-thread work that produces visible stuttering.

The result: swipe right, page bounces back, goes blank, then fades up from below. Three jarring transitions instead of one smooth slide.

### Solution

Rework the swipe completion flow so it feels like a **single fluid slide transition**:

**1. Slide OFF-screen instead of bouncing back (useSwipeNavigation.ts)**
- On successful swipe, slide the current page **out** in the swipe direction (e.g., `translate3d(-100vw, 0, 0)` when swiping left toward Manga)
- Navigate immediately after the slide-out starts (no 80ms delay)
- The new page appears as the old one slides away

**2. Skip fade-up animation for swipe navigations (AnimatedRoutes.tsx)**
- Add a shared flag (via ref or context) that swipe navigation sets before calling `navigate()`
- When `AnimatedRoutes` detects a swipe-triggered navigation, it skips the `page-enter` animation entirely so the new page appears instantly
- Non-swipe navigations (clicking links, etc.) keep the existing fade-up animation

**3. Remove `key={location.pathname}` from AnimatedRoutes**
- This is the main cause of the stutter -- it forces React to destroy and rebuild the entire page tree
- Replace with a simple class toggle that doesn't remount children

### Technical Details

**useSwipeNavigation.ts changes:**
- New `resetTransform` behavior: when `navigating=true`, slide to `translate3d(${direction * -window.innerWidth}px, 0, 0)` instead of `translate3d(0,0,0)`
- Set a module-level `isSwipeNav` flag before calling `navigate()`
- Remove the 80ms `setTimeout` -- navigate immediately
- Reduce transition duration to 200ms for snappier feel

**AnimatedRoutes.tsx changes:**
- Export a function `consumeSwipeNavFlag()` that reads and clears the flag
- On route change, check the flag -- if set, skip the `page-enter` animation class
- Remove `key={location.pathname}` to prevent full remounts

**SwipeNavigationWrapper.tsx changes:**
- No structural changes needed, just benefits from the smoother hook behavior

### Expected Result
- Swiping left: current page slides out to the left, Manga page appears immediately
- Swiping right: current page slides out to the right, Anime page appears immediately
- No bounce-back, no double animation, no jittering from full remounts
- Clicking nav links still gets the subtle fade-up transition

