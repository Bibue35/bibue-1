

# "Seek" — AI-Powered Anime/Manga Discovery Tab

## Overview

Add a new **Seek** page (`/seek`) — a natural language discovery tool where users describe a vibe, mood, or trope and get 5-8 AI-powered recommendations with personalized, spoiler-free match reasons. Uses the existing Lovable AI gateway (no new API keys needed).

---

## Architecture

```text
New files:
  src/pages/SeekPage.tsx          — Main page component
  supabase/functions/seek/index.ts — Edge function for AI calls

Modified files:
  src/App.tsx                      — Add /seek route
  src/components/CollapsibleNavbar.tsx — Add Seek to nav
  src/components/FloatingNav.tsx       — Add Seek to nav
  src/components/ContextualBottomStrip.tsx — Add Seek pill
```

---

## Implementation Steps (First Prompt — Steps 1-8)

### 1. Edge Function: `supabase/functions/seek/index.ts`

- Accepts `{ prompt, watchlist, contentType, conversationHistory }` via POST
- Calls the Lovable AI gateway (`ai.gateway.lovable.dev`) using `LOVABLE_API_KEY` with `google/gemini-2.5-flash` (fast, good reasoning, cost-effective)
- Uses the full system prompt from the spec (opinionated recommendations, no spoilers, real titles only, JSON array output)
- Appends user's watchlist as exclusion context and content type filter
- Supports follow-up refinement by accepting conversation history
- Returns parsed JSON array of recommendations
- Error handling: rate limiting (429), credit exhaustion (402), JSON parse retry

### 2. Edge Function: `supabase/functions/seek-convince/index.ts`

- Separate endpoint for "Convince me" calls (lighter, 300 max tokens)
- Accepts `{ title, watchedContext }`
- Returns a 3-4 sentence spoiler-free pitch

### 3. Route + Navigation

- Add `/seek` route in `App.tsx` with lazy-loaded `SeekPage`
- Add "Seek" link to `CollapsibleNavbar` desktop nav links (between Community and existing links)
- Add "Seek" to `FloatingNav` desktop nav links
- Add "Seek" pill to `ContextualBottomStrip`

### 4. `SeekPage.tsx` — Layout

**Top section:**
- Large full-width text input styled as a prompt input (rounded, prominent, send arrow button on right)
- Placeholder: `"cold blooded mc, dark fantasy with great art..."`
- Input expands slightly on focus, sticky on mobile when scrolling results
- Minimum 44px send button for mobile tap targets

**Suggestion chips (two rows, horizontally scrollable):**
- Row 1: Mood chips with emoji (larger) — randomly show 6-8 from the full set
- Row 2: Trope chips (text only, smaller) — randomly show 6-8
- Tapping a chip fills input and auto-submits

**Recent searches:**
- Stored in `localStorage` (last 5 searches with result count)
- Tapping re-runs the search

**Content type filter:**
- Toggle pills: `[All] [Anime] [Manga] [Manhwa] [Manhua]`
- When active, appended to the AI prompt

**Empty state:**
- "Tell me what you're in the mood for. I'll find it."

### 5. Result Cards

Each card shows:
- Cover image fetched from existing AniList API (`searchAnime`/`searchManga` by title)
- Gradient placeholder if no image found
- Title, rating (star), year, episode/chapter count
- Genre tags
- Match reason (1-2 sentences, italic) — the core differentiator
- Three action buttons:
  - **"Convince me"** — calls `seek-convince` edge function, expands inline
  - **"+ Save"** — uses existing `useWatchlist` hook's `addToWatchlist` mutation
  - **"Details"** — navigates to `/anime/:id` or `/manga/:id`

### 6. Cover Image Fetching

After AI returns results, batch-fetch cover images by searching each title via `searchAnime(title)` or `searchManga(title)` from `src/lib/api.ts`. Match on the first result. If no match, show a gradient placeholder with the title text overlaid.

### 7. Loading State

- Skeleton card placeholders that pulse
- Small "Seeking..." text below the input
- Disable send button during loading

### 8. Follow-up Refinement

After results are displayed:
- Change input placeholder to `"More like #3 but darker..." or "None of these — try something weird"`
- Send full conversation history (original prompt + previous results + follow-up) to maintain context

---

## Technical Details

- **AI Model**: `google/gemini-2.5-flash` via Lovable AI gateway — fast (2-3s), good reasoning, handles the structured JSON output well, no API key needed
- **No Anthropic API**: The spec mentions Anthropic directly, but we'll use the Lovable AI gateway which is already configured and doesn't require additional setup
- **No web search**: The Lovable AI gateway doesn't support Anthropic's `web_search` tool, but the model's training data covers anime/manga community knowledge extensively
- **Cover images**: Reuse existing `searchAnime`/`searchManga` from `src/lib/api.ts` — no new API integration needed
- **Save functionality**: Reuse existing `useWatchlist` hook
- **Theme support**: Standard dark/light theme support using existing Tailwind classes (ink theme deferred to second prompt per spec)
- **Mobile**: Input sticky at top, chip rows with horizontal scroll + momentum, full-width stacked cards, large tap targets

