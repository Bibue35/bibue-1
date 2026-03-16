import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import bibueTower from "@/assets/bibue-tower.png";

const COLOR_TOKENS = [
  {
    label: "Sunlight (Light Mode)",
    colors: [
      { name: "Background", value: "hsl(40 30% 95%)", css: "--background", hex: "#F5F0E6" },
      { name: "Foreground", value: "hsl(30 10% 8%)", css: "--foreground", hex: "#161412" },
      { name: "Primary (Gold)", value: "hsl(42 100% 50%)", css: "--primary", hex: "#FFBF00" },
      { name: "Muted", value: "hsl(36 18% 90%)", css: "--muted", hex: "#EBE5DB" },
      { name: "Border", value: "hsl(36 15% 85%)", css: "--border", hex: "#DDD7CC" },
    ],
  },
  {
    label: "Moonlight (Dark Mode)",
    colors: [
      { name: "Background", value: "hsl(0 0% 2%)", css: "--background", hex: "#050505" },
      { name: "Foreground", value: "hsl(0 0% 95%)", css: "--foreground", hex: "#F2F2F2" },
      { name: "Primary (Blue)", value: "hsl(217 80% 56%)", css: "--primary", hex: "#3B82F6" },
      { name: "Muted", value: "hsl(0 0% 10%)", css: "--muted", hex: "#1A1A1A" },
      { name: "Border", value: "hsl(0 0% 12%)", css: "--border", hex: "#1F1F1F" },
    ],
  },
  {
    label: "Monochrome",
    colors: [
      { name: "Background", value: "hsl(0 0% 0%)", css: "--background", hex: "#000000" },
      { name: "Foreground", value: "hsl(0 0% 90%)", css: "--foreground", hex: "#E6E6E6" },
      { name: "Primary", value: "hsl(0 0% 90%)", css: "--primary", hex: "#E6E6E6" },
      { name: "Muted", value: "hsl(0 0% 8%)", css: "--muted", hex: "#141414" },
    ],
  },
  {
    label: "Contrast",
    colors: [
      { name: "Background", value: "hsl(0 0% 100%)", css: "--background", hex: "#FFFFFF" },
      { name: "Foreground", value: "hsl(0 0% 0%)", css: "--foreground", hex: "#000000" },
      { name: "Primary", value: "hsl(0 0% 0%)", css: "--primary", hex: "#000000" },
      { name: "Border", value: "hsl(0 0% 85%)", css: "--border", hex: "#D9D9D9" },
    ],
  },
];

const VOICE_PRINCIPLES = [
  {
    title: "Understated confidence",
    description: "We don't shout. We don't oversell. We state things plainly and let the product speak. No exclamation marks in UI copy.",
  },
  {
    title: "Reader-first",
    description: "Every word serves the reader's experience. If copy doesn't help someone find, read, or share a story — cut it.",
  },
  {
    title: "No gamification language",
    description: "We say 'vote' not 'spend credits.' We say 'added' not 'earned.' The platform feels intentional, never like a slot machine.",
  },
  {
    title: "Culturally respectful",
    description: "We use the original titles alongside translations. We never exoticize. Manga, manhwa, and manhua are treated with equal weight.",
  },
];

const DONTS = [
  "Never use the tower icon as a standalone brand mark without the wordmark nearby",
  "Never set the wordmark in anything other than Cinzel Bold (700)",
  "Never add gradients, shadows, or effects to the logo",
  "Never use 'Bibu', 'BIBUE', or any other spelling variation",
  "Never pair the logo with a tagline — let it stand alone",
  "Never use exclamation marks in product UI copy",
  "Never use purple gradients, Inter for headings, or rounded-full buttons as primary CTAs",
];

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Brand Identity — Bibue"
        description="Bibue brand guidelines: logo, color palette, typography, and voice & tone."
        url="/brand"
      />
      <CollapsibleNavbar />

      <main className="pt-24 pb-32">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">

          {/* Header */}
          <header className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6">
              Internal Reference
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-sacred font-bold tracking-wide leading-tight">
              Brand Identity
            </h1>
            <p className="mt-4 text-muted-foreground text-sm max-w-md">
              Visual and verbal guidelines for Bibue. This page is not public.
            </p>
          </header>

          {/* ─── LOGO ─── */}
          <section className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              01 — Logo & Wordmark
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              The Bibue Mark
            </h2>

            {/* Logo display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border/30 mb-8">
              {/* Dark variant */}
              <div className="bg-[hsl(0_0%_2%)] p-12 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={bibueTower}
                    alt="Bibue Tower"
                    className="h-10 w-auto brightness-0 invert"
                  />
                  <span className="text-2xl font-sacred font-bold text-[#F2F2F2] tracking-wide">
                    Bibue
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[#F2F2F2]/40 mt-2">
                  On dark
                </p>
              </div>
              {/* Light variant */}
              <div className="bg-[hsl(40_30%_95%)] p-12 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={bibueTower}
                    alt="Bibue Tower"
                    className="h-10 w-auto"
                  />
                  <span className="text-2xl font-sacred font-bold text-[hsl(30_10%_8%)] tracking-wide">
                    Bibue
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.2em] text-[hsl(30_10%_8%)]/40 mt-2">
                  On light
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-foreground/80">
              <p>
                The Bibue wordmark is set in <strong>Cinzel Bold (700)</strong>. It is always title case: "Bibue" — never all-caps, never lowercase.
              </p>
              <p>
                The tower icon accompanies the wordmark in navigation but is never used as a standalone brand mark without the name nearby.
              </p>
              <p>
                <strong>Clear space:</strong> Maintain at least 1× the height of the "B" as padding around all sides of the logo.
              </p>
              <p>
                <strong>Minimum size:</strong> 16px wordmark height on screen. Below this, use the tower icon alone with the wordmark in adjacent text.
              </p>
            </div>
          </section>

          {/* ─── COLORS ─── */}
          <section className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              02 — Color Palette
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              Four Flavors
            </h2>

            <p className="text-sm text-foreground/80 mb-8 max-w-lg">
              Bibue ships four theme flavors. Each is manually tuned for WCAG AA contrast. All colors are defined as HSL design tokens in CSS custom properties.
            </p>

            <div className="space-y-10">
              {COLOR_TOKENS.map((group) => (
                <div key={group.label}>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">
                    {group.label}
                  </p>
                  <div className="grid grid-cols-1 gap-px bg-border/30">
                    {group.colors.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-4 bg-card p-3"
                      >
                        <div
                          className="w-8 h-8 rounded-md border border-border/50 shrink-0"
                          style={{ background: c.value }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{c.name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">
                            {c.css}
                          </p>
                        </div>
                        <p className="text-[11px] text-muted-foreground font-mono shrink-0">
                          {c.hex}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3 text-sm text-foreground/80">
              <p>
                <strong>Electric Blue (#1DA1F2)</strong> is reserved for interactive links and primary CTAs in dark mode contexts.
              </p>
              <p>
                <strong>Rule:</strong> Never use raw hex values in components. Always reference semantic tokens: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">bg-primary</code>, <code className="text-xs bg-muted px-1.5 py-0.5 rounded">text-foreground</code>, etc.
              </p>
            </div>
          </section>

          {/* ─── TYPOGRAPHY ─── */}
          <section className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              03 — Typography
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              Type System
            </h2>

            <div className="space-y-8">
              {/* Cinzel */}
              <div className="border-l-2 border-foreground/10 pl-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Display & Editorial
                </p>
                <p className="text-4xl font-sacred font-bold tracking-wide mb-2">
                  Cinzel
                </p>
                <p className="text-sm text-muted-foreground">
                  Weights: 400–900. Used for the wordmark, page titles, section headings, and editorial labels. Always set with <code className="text-xs bg-muted px-1 py-0.5 rounded">font-sacred</code>.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-3xl font-sacred font-bold">Heading 1 — 30–48px Bold</p>
                  <p className="text-xl font-sacred font-semibold">Heading 2 — 20–30px Semibold</p>
                  <p className="text-base font-sacred font-medium uppercase tracking-[0.2em]">Label — 10–12px Medium, Uppercase</p>
                </div>
              </div>

              {/* Inter */}
              <div className="border-l-2 border-foreground/10 pl-6">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Body & UI
                </p>
                <p className="text-4xl font-sans font-bold tracking-tight mb-2">
                  Inter
                </p>
                <p className="text-sm text-muted-foreground">
                  Weights: 300–900. Used for body copy, buttons, navigation links, metadata, and all UI elements. The default font-family.
                </p>
                <div className="mt-4 space-y-1">
                  <p className="text-base font-sans">Body — 14–16px Regular</p>
                  <p className="text-sm font-sans font-medium">UI Label — 13–14px Medium</p>
                  <p className="text-xs font-sans text-muted-foreground">Caption — 11–12px Regular, Muted</p>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3 text-sm text-foreground/80">
              <p>
                <strong>Rule:</strong> Never use Cinzel for body text. Never use Inter for the wordmark or page titles.
              </p>
              <p>
                <strong>Hierarchy:</strong> Uppercase high-tracking labels (Cinzel) introduce sections. Body copy (Inter) provides detail. This pairing creates the editorial-meets-digital tension that defines Bibue's character.
              </p>
            </div>
          </section>

          {/* ─── VOICE & TONE ─── */}
          <section className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              04 — Voice & Tone
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              How We Speak
            </h2>

            <div className="grid grid-cols-1 gap-px bg-border/30 mb-8">
              {VOICE_PRINCIPLES.map((p) => (
                <div key={p.title} className="bg-card p-5">
                  <p className="text-sm font-medium mb-1">{p.title}</p>
                  <p className="text-sm text-muted-foreground">{p.description}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3 text-sm text-foreground/80">
              <p>
                <strong>Tagline:</strong> "Discover, Track & Share Your Favorite Manga, Manhwa & Manhua" — used in meta descriptions and SEO. Never in the UI header.
              </p>
              <p>
                <strong>Subscription copy (verbatim):</strong> "$8.99 per month. Unlimited access to all licensed and bridged titles. 15 Bridge Credits every month to vote on new stories. Cancel anytime. No hidden fees. No tiers."
              </p>
            </div>
          </section>

          {/* ─── DON'TS ─── */}
          <section className="mb-24">
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              05 — Don'ts
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              Things We Never Do
            </h2>

            <ul className="space-y-3">
              {DONTS.map((d, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-foreground/80">
                  <span className="text-destructive mt-0.5 shrink-0 font-mono text-xs">✕</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* ─── MOTION ─── */}
          <section>
            <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
              06 — Motion
            </p>
            <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-8">
              Animation Principles
            </h2>

            <div className="space-y-3 text-sm text-foreground/80">
              <p>
                All interactive elements use <strong>spring-physics</strong> easing: <code className="text-xs bg-muted px-1.5 py-0.5 rounded">cubic-bezier(0.34, 1.56, 0.64, 1)</code>.
              </p>
              <p>
                Cards hover with a subtle vertical lift (6px) and 1.01× scale. Buttons respond with a press-and-bounce microinteraction.
              </p>
              <p>
                Page sections stagger-reveal on scroll at 40ms intervals. Entrance animations last 500ms max.
              </p>
              <p>
                <strong>Rule:</strong> No particle effects, no sparkle, no coin-drop. Motion should feel physical and intentional — never decorative or gamified.
              </p>
            </div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
