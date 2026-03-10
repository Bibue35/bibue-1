# Bibue — UI Component Handoff for vly.ai

> Covers: Logo & Branding, Typography, Navigation System, Search, Authentication & Settings

---

## 1. Logo & Branding

### Assets
| Asset | Path | Format | Usage |
|-------|------|--------|-------|
| Tower icon | `src/assets/bibue-tower.png` | PNG (transparent) | Primary logo mark |
| Full logo | `src/assets/bibue-logo.jpg` | JPG | Social/OG fallback only |

### Logo Rendering Rules

```tsx
<img
  src={bibueTower}          // ES module import from src/assets/bibue-tower.png
  alt="Bibue Tower"         // or alt="" when adjacent text says "Bibue"
  width={28} height={40}    // explicit intrinsic dimensions — REQUIRED to prevent CLS
  className="h-full w-auto object-contain dark:brightness-0 dark:invert logo-stable"
  loading="eager"           // above the fold — never lazy
  decoding="sync"           // prevents FOUC on initial paint
/>
```

**Critical CSS class `logo-stable`** (defined in `index.css`):
```css
.logo-stable {
  contain: layout size;           /* GPU-isolated — no reflow */
  will-change: auto;
  image-rendering: -webkit-optimize-contrast;
}
```

**Dark mode handling:** The tower icon is a dark silhouette on transparent background. In dark mode, `dark:brightness-0 dark:invert` flips it to white. Do NOT use separate light/dark logo files.

**Brand text** always appears next to the tower:
```tsx
<span className="text-lg sm:text-xl font-sacred font-semibold tracking-wide">
  Bibue
</span>
```

**`font-sacred`** maps to `'Cinzel', Georgia, serif` (defined in `tailwind.config.ts` under `fontFamily.sacred`). This is only used for the logo text and the AuthModal title — nowhere else for body copy.

### Responsive Logo Sizing
| Breakpoint | Tower height | Text size |
|------------|-------------|-----------|
| Mobile (<640px) | `h-6` to `h-8` | `text-sm` to `text-base` |
| Tablet (640-1024px) | `h-8` to `h-10` | `text-lg` to `text-xl` |
| Desktop (1024px+) | `h-10` to `h-12` | `text-xl` to `text-2xl` |

The `CollapsibleNavbar` uses the tablet/desktop sizes. The `FloatingNav` uses the full 4-tier range.

### SSR Shell Logo
`index.html` contains a static app shell for instant FCP:
```html
<nav class="app-shell-nav"><span class="logo">Bibue</span></nav>
```
This uses inline CSS (`font-size: 20px; font-weight: 700; color: #e2e2e2`) and is replaced when React hydrates.

---

## 2. Typography System

### Font Stack
| Role | Font Family | Weight(s) | Loading Strategy |
|------|-------------|-----------|-----------------|
| **Body** (all UI text) | `'Inter', -apple-system, BlinkMacSystemFont, sans-serif` | 400, 500, 700 | `<link rel="preload" as="style">` with `display=swap` |
| **Sacred** (logo + editorial) | `'Cinzel', Georgia, serif` | 400, 700 | `media="print" onload="this.media='all'"` (non-blocking) |
| **Editorial** (italic taglines) | Same as Sacred but with `font-style: italic` | 400 | Same as above |

### Font Loading (index.html)
```html
<!-- Critical: preloaded for FCP -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'" />

<!-- Non-critical: async loaded -->
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap" media="print" onload="this.media='all'" />
```

### Tailwind Font Tokens
Defined in `tailwind.config.ts`:
```js
fontFamily: {
  sans: ['Inter', ...defaultTheme.fontFamily.sans],   // default for all elements
  sacred: ['Cinzel', 'Georgia', 'serif'],              // class: font-sacred
}
```

### CSS Utility Classes
```css
/* index.css */
body {
  @apply bg-background text-foreground antialiased;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.font-editorial {
  font-family: 'Cinzel', Georgia, serif;
  font-style: italic;
}
```

### Usage Rules
- **ALL body text, buttons, labels, inputs**: Inter (default — no class needed)
- **Logo "Bibue" text**: `font-sacred font-semibold`
- **AuthModal title**: `font-sacred`
- **Editorial/decorative taglines**: `font-editorial` (italic Cinzel)
- **NEVER** use Cinzel for body copy, navigation labels, or form fields

---

## 3. Navigation System

### Architecture Overview
There are **three navigation components** — only two are used simultaneously:

| Component | File | When visible | Position |
|-----------|------|-------------|----------|
| `CollapsibleNavbar` | `src/components/CollapsibleNavbar.tsx` | **Primary.** Used on most pages via layout. | Fixed top, hides on scroll down, shows on scroll up |
| `MobileBottomNav` | `src/components/MobileBottomNav.tsx` | Mobile only (`md:hidden`). Always-on tab bar. | Fixed bottom with safe-area padding |
| `FloatingNav` | `src/components/FloatingNav.tsx` | **Secondary.** Used on Settings page and some legacy pages. | Static (scrolls with page), no hide-on-scroll |

### CollapsibleNavbar — Primary Navigation (253 lines)

**File:** `src/components/CollapsibleNavbar.tsx`

#### Scroll Behavior
```
- Uses requestAnimationFrame-throttled scroll listener
- Hides (translateY -100%) when scrolling DOWN >10px AND past 150px from top
- Shows when scrolling UP >5px OR within 50px of top
- NEVER hides when mobile menu is open (forced visible)
- isScrolled triggers glassmorphic background after 30px scroll
```

#### Desktop Layout (md+)
```
┌─────────────────────────────────────────────────────┐
│ [Tower][Bibue]   [Browse Manga][Originals][Studio]  │
│                  [Refer & Earn][Community]           │
│                           [🔍][🔔][◉theme][👤user] │
└─────────────────────────────────────────────────────┘
```

#### Mobile Layout (<md)
```
┌──────────────────────────────────────┐
│ [Tower][Bibue]    [🔍][🔔][☰]      │
└──────────────────────────────────────┘
```

#### Nav Links — Conditional on Auth
```tsx
const navLinks = [
  { href: "/manga", label: "Browse Manga" },           // always
  ...(user ? [
    { href: "/originals", label: "Originals" },         // auth only
    { href: "/studio", label: "Studio" },               // auth only
    { href: "/refer", label: "Refer & Earn" },          // auth only
  ] : []),
  { href: "/community", label: t("nav.community") },   // always (i18n)
];
```

#### Mobile Menu Links (hamburger dropdown)
```tsx
const mobileMenuLinks = [
  { href: "/manga", label: "Browse" },
  { href: "/originals", label: "Originals" },
  { href: "/studio", label: "Studio" },
  { href: "/refer", label: "Refer & Earn" },
];
```
Plus: ThemeSelector (text variant), "Me" link (if logged in) or "Sign In" button (if not).

#### Glassmorphic Styling
```
Default (top):     bg-transparent py-3
Scrolled:          bg-[rgba(20,23,26,0.75)] backdrop-blur-[24px]
                   border-b border-[rgba(192,192,192,0.15)]
                   py-2 navbar-shimmer-line
```

**`navbar-shimmer-line`** is a CSS class in `index.css` that adds a subtle animated gradient line along the bottom border.

#### Active Link Style
```tsx
className={cn(
  "px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 nav-underline",
  isActive
    ? "text-foreground bg-foreground/10 active"        // white text + subtle bg
    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
)}
```
**`nav-underline`** is a CSS class that adds an animated underline on the `.active` state.

#### Mobile Menu Dropdown
```
- Position: fixed top-14 left-3 right-3 z-[55]
- Background: bg-[rgba(20,23,26,0.9)] backdrop-blur-[24px]
- Border: border-[rgba(192,192,192,0.2)] rounded-2xl
- Animation: opacity + translateY transition (200ms)
- Backdrop: separate full-screen overlay at z-[49] with bg-black/40 backdrop-blur-sm
```

#### Right-Side Icons (in order)
1. **Search** — opens `SearchModal`
2. **NotificationBell** — custom dropdown (not a library component)
3. **ThemeSelector** — icon variant (desktop only, `hidden md:block`)
4. **UserMenu** — avatar dropdown (desktop only, `hidden md:block`)
5. **Hamburger** — mobile only (`md:hidden`)

#### Skip Link
```html
<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to content</a>
```

### MobileBottomNav — Bottom Tab Bar

**File:** `src/components/MobileBottomNav.tsx`

```
┌──────────────────────────────────────┐
│  Browse    Originals    Studio   Me  │
│  Compass   BookOpen     Palette  User│
└──────────────────────────────────────┘
```

- Only visible on mobile (`md:hidden`)
- Same hide-on-scroll-down logic as CollapsibleNavbar
- "Me" tab only appears when `user` is logged in (links to `/settings`)
- Hidden on `/admin` and `/creator/dashboard` paths
- Includes safe-area-inset-bottom padding for iOS notch
- Min touch target: `56px height × 64px width`
- Active state: `text-primary` with bolder stroke (`strokeWidth: 2.5`)
- Includes a spacer div at bottom of page to prevent content overlap

### FloatingNav — Static Alternative

**File:** `src/components/FloatingNav.tsx`

- Non-fixed (scrolls with page)
- Has Community icon with unread badge counter
- Used on: SettingsPage, some standalone pages
- Does NOT have hide-on-scroll behavior
- Always shows `bg-background/50 backdrop-blur-sm`

### NotificationBell

**File:** `src/components/NotificationBell.tsx`

- Only renders when `user` is logged in
- Shows red badge with unread count (caps at "99+")
- Custom dropdown (not Radix) — positioned `absolute right-0 top-full`
- Width: `w-80 sm:w-96`, max-height: `70vh`
- "Mark all read" button in header
- Each notification shows: thumbnail (10×14), message, relative time, unread dot
- Clicking navigates to `/${media_type}/${media_id}`
- Close on outside click via `mousedown` listener

---

## 4. Search System

### SearchModal

**File:** `src/components/SearchModal.tsx` (472 lines)

#### Opening/Closing
- Opened via search icon button in navbar
- Controlled by `isOpen` / `onClose` props
- Escape key closes
- Click on backdrop (outside modal) closes
- Body scroll locked when open (`overflow: hidden`)
- Z-index: `z-[100]`

#### Search Input Design
```
Super-rounded pill: rounded-[9999px]
Border: border-foreground/20 (subtle)
Background: bg-card/60 backdrop-blur-md
Height: h-14 (56px)
Font: text-xl
Clear button: rounded-full bg-muted/60
Focus: ring-4 ring-foreground/5, border-foreground/40
```

#### Abbreviation System
A hardcoded `ABBREVIATION_ENTRIES` array (67 entries) maps common abbreviations to full titles:
```
jjk → jujutsu kaisen
aot → attack on titan
op  → one piece
sl  → solo leveling
csm → chainsaw man
...
```

Uses **Fuse.js** fuzzy matching with `threshold: 0.4` for typo tolerance.

**Autocomplete flow:**
1. User types 1-2 characters → show abbreviation suggestions (max 6)
2. User types 3+ characters → fire API search
3. Clicking a suggestion fills the input with the full title and triggers search

#### API Search
```tsx
const { data: animeResults } = useSearchAnime(expandedQuery, shouldSearch);
const { data: mangaResults } = useSearchManga(expandedQuery, shouldSearch);
```
- Searches both anime AND manga simultaneously
- `shouldSearch` = true when `expandedQuery.trim().length >= 2`
- `expandedQuery` = abbreviation-expanded version of raw input
- Results are capped at 8 per section

#### Results Layout
```
┌─ Anime ─────────────────── (count) ─┐
│ [cover 48×64] Title                  │
│               Title Japanese         │
│               ★ 8.5  · 24 eps       │
├─ Manga / Manhwa / Manhua ── (count) ─┤
│ [cover 48×64] Title                  │
│               Title Japanese         │
│               ★ 9.1  · 150 ch       │
└──────────────────────────────────────┘
```

#### Recent Searches
- Stored in `localStorage` key `"recentSearches"`
- Max 8 entries (FIFO)
- Shows when input is empty with option to clear all
- Clicking a recent search fills the input

#### Navigation on Select
```tsx
navigate(`/${type}/${item.anilist_id}`);  // e.g. /anime/21 or /manga/30002
```
Note: routes use **AniList IDs**, not MAL IDs.

#### Content Type Detection
Uses `getContentType()` from `src/lib/contentType.ts` to classify manga results as "Manga", "Manhwa", or "Manhua" based on metadata, with corresponding badge colors.

---

## 5. Authentication System

### AuthContext

**File:** `src/contexts/AuthContext.tsx`

#### Provider Shape
```typescript
interface AuthContextType {
  user: User | null;          // Supabase User object
  session: Session | null;    // Supabase Session
  profile: Profile | null;    // From public.profiles table
  loading: boolean;           // True during initial session check
  signUp: (email, password, username?) => Promise<{ error }>
  signIn: (email, password) => Promise<{ error }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}
```

#### Session Initialization (CRITICAL ORDER)
```
1. Set up onAuthStateChange listener FIRST
2. THEN call getSession()
3. Both set user/session/profile state
4. Profile fetch uses setTimeout(0) in listener to prevent Supabase client deadlock
```

#### Profile Table
```sql
profiles (
  id uuid PK,
  user_id uuid UNIQUE → auth.users(id),
  username text,
  avatar_url text,
  banner_url text,
  bio text,
  display_name text,
  is_public boolean DEFAULT true,
  is_founder boolean DEFAULT false,
  founder_tier text,
  referral_code text,
  referred_by text,
  location text,
  website text,
  created_at timestamptz,
  updated_at timestamptz
)
```

A **database trigger** auto-creates a profile row on signup using `raw_user_meta_data.username`.

#### Sign Up Flow
```
1. Client validates email (Zod) and username (2-50 chars, alphanumeric + _-spaces)
2. supabase.auth.signUp({ email, password, options: { emailRedirectTo, data: { username } } })
3. User receives verification email
4. On verify → trigger creates profile row
5. Email confirmation is REQUIRED (auto-confirm is disabled)
```

#### Sign In Flow
```
1. Client validates email format
2. supabase.auth.signInWithPassword({ email, password })
3. Generic error message: "Invalid email or password" (prevents enumeration)
4. On success → onAuthStateChange fires → profile fetched
```

### AuthModal

**File:** `src/components/AuthModal.tsx`

#### Layout (top to bottom)
```
┌─────────────────────────────────┐
│ Connect Your Lists              │
│ [MAL] [AniList] [Kitsu]        │  ← placeholder buttons (toast "coming soon")
├─────────── or sign in ──────────┤
│ Welcome Back / Create Account   │  ← font-sacred
│ subtitle text                   │
│                                 │
│ [Username field]   (signup only)│
│ [Email field]                   │
│ [Password field]                │
│ [Founder Code]     (signup only)│  ← optional, gold accent
│                                 │
│ [Sign In / Create Account]      │  ← primary button
├────── or continue with ─────────┤
│ [Google]                        │  ← lovable.auth.signInWithOAuth("google")
│ [Apple]                         │  ← lovable.auth.signInWithOAuth("apple")
│                                 │
│ Don't have an account? Sign up  │
└─────────────────────────────────┘
```

#### Lazy Loading
```tsx
const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));

// Used with Suspense:
{authModalOpen && (
  <Suspense fallback={null}>
    <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
  </Suspense>
)}
```

#### OAuth (Google & Apple)
```tsx
import { lovable } from "@/integrations/lovable";

// Google:
await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });

// Apple:
await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin });
```
**IMPORTANT:** Uses `lovable.auth`, NOT `supabase.auth` for OAuth. This is the Lovable Cloud managed OAuth — no client IDs needed.

#### Input Validation
- Email: Zod schema — valid format, max 255 chars
- Password: min 6 chars (client), full schema requires 8+ with upper/lower/number
- Username: 1-50 chars, regex `/^[a-zA-Z0-9_\-\s]+$/`
- All validation in `src/lib/validation.ts`

#### Founder Code Field (signup only)
- Optional input with gold accent (`hsl(45,90%,55%)`)
- Auto-uppercased on input
- Max 20 characters
- Placeholder: `BIBUE-FOUNDER-A1B2C3`
- Both referrer and referred user get 1,000 coins

### UserMenu

**File:** `src/components/UserMenu.tsx`

#### Logged Out State
Shows a ghost button "Sign In" (desktop only, `hidden md:flex`). Clicking opens AuthModal.

#### Logged In State
Shows avatar button → Radix DropdownMenu with sections:

```
┌─────────────────────────────────┐
│ [Avatar] Username               │
│          email@example.com      │
├─────────────────────────────────┤
│ 👤 My Profile                   │  → /user/{userId}
│ ── Library ──                   │
│ 🔖 My Watchlist                 │  → /watchlist
│ ❤️ For You                      │  → /recommendations
│ 💬 Messages              (3)   │  → /messages (unread badge)
│ 👥 Community                    │  → /community
│ 📊 My Stats                     │  → /stats
│ ❓ Support                      │  → /support
├─────────────────────────────────┤
│ ── Settings ──                  │
│ 👁 Incognito Mode         [✓]  │  ← toggle (highlighted when on)
│ 🌐 Language          [🇺🇸 ▸]  │  ← submenu with 8 languages
│ ⚙️ Account Settings            │  → /settings
├─────────────────────────────────┤
│ 🚪 Sign Out                     │  ← text-destructive
└─────────────────────────────────┘
```

#### Supported Languages
```
en 🇺🇸 English | ja 🇯🇵 日本語 | es 🇪🇸 Español | fr 🇫🇷 Français
de 🇩🇪 Deutsch | pt 🇧🇷 Português | ko 🇰🇷 한국어 | zh 🇨🇳 中文
```

Language persists to `localStorage("bibue-language")` and sets `document.documentElement.lang`.

### Settings Page

**File:** `src/pages/SettingsPage.tsx`

#### Route: `/settings` (protected — redirects to `/` if not logged in)

#### Sections (top to bottom)
1. **Header** — back arrow + "Settings" title
2. **Avatar** — centered, clickable → opens AvatarPicker
3. **Profile Fields** — username (editable), email (read-only disabled)
4. **Connected Accounts** — `LinkedAccounts` component (MAL, AniList OAuth)
5. **Privacy & Content** — Spoiler-Free Mode toggle
6. **Notifications** — 3 toggles:
   - New Episodes
   - New Chapters
   - Season Announcements
7. **Save Bar** — fixed bottom bar (only shows when changes detected)

#### AvatarPicker

**File:** `src/components/settings/AvatarPicker.tsx`

Three tabs:
1. **Popular** — 20 preset anime character avatars (4-column grid, AniList CDN URLs)
2. **Search** — AniList GraphQL character search with debounce (500ms)
3. **Upload** — file upload to Supabase Storage (`bibue-files` bucket, max 2MB, images only)

**Mobile rendering:** Full-screen portal slide-up (not Dialog)
**Desktop rendering:** Centered Dialog

#### Notification Settings
Stored in `user_preferences` table, upserted on toggle. Uses TanStack Query for caching.

### ThemeSelector

**File:** `src/components/ThemeSelector.tsx`

Four theme options in a 2×2 grid popover:
| ID | Label | Flavor | Mode |
|----|-------|--------|------|
| moonlight | Moonlight | celestial | dark |
| sunlight | Sunlight | celestial | light |
| monochrome | Mono | monochrome | dark |
| contrast | Contrast | contrast | light |

Each shows a mini preview card with mock header/card lines. Active theme has `ring-2 ring-foreground/30`.

**Icon variant:** Shows a colored dot (`w-5 h-5 rounded-full`) matching current theme bg.
**Text variant:** Shows theme label as a full-width button (used in mobile hamburger menu).

---

## 6. Component Dependency Graph

```
CollapsibleNavbar
├── SearchModal (lazy-ish via state)
│   ├── Fuse.js (abbreviation matching)
│   ├── useSearchAnime / useSearchManga (TanStack Query → AniList proxy)
│   ├── ScrollArea (Radix)
│   └── Badge (shadcn)
├── NotificationBell
│   ├── useNotifications (TanStack Query → Supabase)
│   └── useAuth
├── ThemeSelector
│   └── useThemeContext (ThemeContext)
├── UserMenu
│   ├── AuthModal (lazy)
│   │   ├── lovable.auth (OAuth)
│   │   ├── useAuth (email/password)
│   │   └── validation.ts (Zod schemas)
│   ├── useAuth
│   ├── useIncognito
│   ├── useLanguage
│   └── useUnreadCount
└── useLanguage (i18n)

SettingsPage
├── FloatingNav (not CollapsibleNavbar)
├── AvatarPicker
│   ├── AniList GraphQL (character search)
│   └── Supabase Storage (upload)
├── LinkedAccounts
├── NotificationSettings
│   └── user_preferences table
└── useAuth
```

---

## 7. Z-Index Map

| Layer | z-index | Component |
|-------|---------|-----------|
| Search modal | `z-[100]` | SearchModal overlay |
| Notification dropdown | `z-[60]` | NotificationBell dropdown |
| Mobile menu dropdown | `z-[55]` | CollapsibleNavbar mobile menu |
| Navigation bar | `z-50` | CollapsibleNavbar, FloatingNav |
| Mobile menu backdrop | `z-[49]` | Black overlay behind mobile menu |
| Mobile bottom nav | `z-40` | MobileBottomNav |
| Save bar (settings) | `z-50` | SettingsPage fixed bottom bar |

---

## 8. Key Implementation Notes for vly.ai

1. **Never use `supabase.auth.signInWithOAuth()`** — always use `lovable.auth.signInWithOAuth()` for Google/Apple
2. **Profile auto-creation** is handled by a database trigger — don't manually insert profiles on signup
3. **Email confirmation is required** — `auto_confirm_email` is disabled
4. **The search uses AniList IDs for routing** (`/anime/{anilist_id}`, `/manga/{anilist_id}`), not MAL IDs
5. **Logo must use `decoding="sync"` and explicit dimensions** to prevent CLS
6. **Cinzel font is non-blocking** — it may flash as Inter on first load; this is acceptable
7. **Mobile menu and bottom nav coexist** — hamburger has Browse/Originals/Studio/Refer links; bottom nav has Browse/Originals/Studio/Me tabs
8. **ThemeSelector has two variants** — `icon` (popover from dot) for desktop nav, `text` (full button) for mobile menu
9. **All navigation labels use semantic color tokens** (`text-foreground`, `text-muted-foreground`, `text-primary`) — never direct colors
10. **AuthModal is always lazy-loaded** via `React.lazy()` + `Suspense` — it's never in the main bundle
