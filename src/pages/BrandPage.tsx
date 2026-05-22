
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import bibueTower from "@/assets/bibue-tower.png";
import heroReader from "@/assets/brand-hero-reader.jpg";
import { REVENUE_SHARE, WEDGE, formatPct } from "@/lib/pricing/tiers";

// ─── Source-of-truth exports (consumed by other marketing pages) ───

export const VOICE_PRINCIPLES = [
  {
    title: "Understated confidence",
    description:
      "We don't shout. We don't oversell. We state things plainly and let the product speak. No exclamation marks in UI copy.",
  },
  {
    title: "Reader-first",
    description:
      "Every word serves the reader's experience. If copy doesn't help someone find, read, or share a story, cut it.",
  },
  {
    title: "No gamification language",
    description:
      "We say 'vote' not 'spend credits.' We say 'added' not 'earned.' The platform feels intentional, never like a slot machine.",
  },
  {
    title: "Culturally respectful",
    description:
      "We use the original titles alongside translations. We never exoticize. Manga, manhwa, and manhua are treated with equal weight.",
  },
];

export const DONTS = [
  "Never use the tower icon as a standalone brand mark without the wordmark nearby",
  "Never set the wordmark in anything other than Cinzel Bold (700)",
  "Never add gradients, shadows, or effects to the logo",
  "Never use 'Bibu', 'BIBUE', or any other spelling variation",
  "Never pair the logo with a tagline, let it stand alone",
  "Never use exclamation marks in product UI copy",
  "Never use purple gradients, Inter for headings, or rounded-full buttons as primary CTAs",
];

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

// ─── Reusable bits ───

function Eyebrow({ children, gold = false }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <p
      className={`text-[10px] uppercase tracking-[0.3em] ${
        gold ? "text-primary/80" : "text-muted-foreground"
      }`}
    >
      {children}
    </p>
  );
}

function GoldRule({ className = "" }: { className?: string }) {
  return <div className={`h-px bg-primary/60 ${className}`} />;
}

function SectionHeader({
  numeral,
  eyebrow,
  title,
}: {
  numeral: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      <p className="text-[10px] uppercase tracking-[0.3em] mb-4">
        <span className="text-primary">{numeral} —</span>{" "}
        <span className="text-muted-foreground">{eyebrow}</span>
      </p>
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-sacred font-bold tracking-wide">
        {title}
      </h2>
    </div>
  );
}

// ─── Page ───

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
        {/* ─── HERO ─── */}
        <section className="py-24 sm:py-32 md:py-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="animate-fade-up-spring">
              <Eyebrow gold>Bibue — Brand System 2.0</Eyebrow>
              <h1 className="mt-6 font-sacred font-bold tracking-tight leading-[0.95] text-5xl sm:text-6xl md:text-7xl lg:text-8xl">
                A quiet system
                <br />
                for{" "}
                <span className="italic text-primary">a loud medium.</span>
              </h1>
              <p className="mt-8 max-w-xl text-base text-foreground/75 leading-relaxed">
                One agreement. One storefront. {WEDGE.languagesOnDay1}+ languages on the
                first day of publication. A majority of the revenue returned to the
                people who made the work.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 01: THE READER (asymmetric two-column) ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16">
              {/* Moonlight inset portrait */}
              <div className="md:col-span-5">
                <div className="relative bg-[hsl(0_0%_2%)] p-4 border border-primary/60">
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={heroReader}
                      alt="A reader with a paper manga volume in window light"
                      width={768}
                      height={1024}
                      className="w-full h-full object-cover"
                    />
                    <p className="absolute bottom-2 left-2 right-2 text-[9px] tracking-[0.25em] uppercase font-mono text-white/50">
                      Plate 01 — The Reader, in window light
                    </p>
                  </div>
                </div>
              </div>

              {/* Editorial body */}
              <div className="md:col-span-7 md:pt-6">
                <SectionHeader
                  numeral="01"
                  eyebrow="The Reader"
                  title="Made for the long read."
                />
                <div className="space-y-5 text-sm sm:text-base text-foreground/80 leading-relaxed max-w-2xl">
                  <p>
                    Bibue is a unified, licensed subscription platform for anime, manga,
                    manhwa, and manhua. One agreement with the rights holder. One
                    storefront for the reader. Automatic translation into{" "}
                    {WEDGE.languagesOnDay1}+ languages on first publication,
                    watermarked end to end.
                  </p>
                  <p>
                    The reader does not need to know which catalogue a story came from,
                    or which territory it was licensed for. The reader simply reads.
                  </p>
                  <p>
                    This page is the internal reference for everything that follows:
                    the wordmark, the palette, the typography, the voice, the motion.
                    If a future page diverges from what is written here, this page wins.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 02: THE NUMBERS ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <SectionHeader
              numeral="02"
              eyebrow="The Numbers"
              title="The wedge, in three lines."
            />

            <div className="border-t border-border">
              {[
                {
                  metric: formatPct(REVENUE_SHARE.publishers),
                  label: "Publisher share",
                  note: `vs. ~${formatPct(WEDGE.industryAvgPublisherShare)} industry average`,
                },
                {
                  metric: formatPct(REVENUE_SHARE.creatorsDefault),
                  label: "Creator default",
                  note: `up to ${formatPct(REVENUE_SHARE.creatorsStudio)} on Studio`,
                },
                {
                  metric: `${WEDGE.takedownSLAHours}h`,
                  label: "Takedown SLA",
                  note: "Non-exclusive licensing",
                },
              ].map((row, i) => (
                <div
                  key={row.label}
                  className="grid grid-cols-12 items-baseline gap-4 sm:gap-8 py-8 sm:py-10 border-b border-border"
                >
                  <p className="col-span-2 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground font-mono">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <p className="col-span-4 sm:col-span-3 font-sacred font-bold text-primary text-4xl sm:text-5xl md:text-6xl leading-none">
                    {row.metric}
                  </p>
                  <p className="col-span-6 sm:col-span-3 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-foreground">
                    {row.label}
                  </p>
                  <p className="col-span-12 sm:col-span-4 text-sm text-muted-foreground">
                    {row.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 03: LOGO ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader numeral="03" eyebrow="Logo & Wordmark" title="The Bibue mark." />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border mb-8">
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
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/40 mt-2">
                  On dark
                </p>
              </div>
              <div className="bg-[hsl(40_30%_95%)] p-12 flex flex-col items-center justify-center gap-4">
                <div className="flex items-center gap-3">
                  <img src={bibueTower} alt="Bibue Tower" className="h-10 w-auto" />
                  <span className="text-2xl font-sacred font-bold text-[hsl(30_10%_8%)] tracking-wide">
                    Bibue
                  </span>
                </div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[hsl(30_10%_8%)]/40 mt-2">
                  On light
                </p>
              </div>
            </div>

            <div className="space-y-4 text-sm text-foreground/80 max-w-2xl">
              <p>
                The Bibue wordmark is set in <strong>Cinzel Bold (700)</strong>. Always
                title case: "Bibue", never all-caps, never lowercase.
              </p>
              <p>
                The tower icon accompanies the wordmark in navigation but is never used
                as a standalone brand mark without the name nearby.
              </p>
              <p>
                <strong>Clear space:</strong> at least 1× the height of the "B" as
                padding around all sides.{" "}
                <strong>Minimum size:</strong> 16px wordmark height on screen.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 04: COLORS ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader numeral="04" eyebrow="Color Palette" title="Four flavors." />

            <p className="text-sm text-foreground/80 mb-10 max-w-xl">
              Bibue ships four theme flavors. Each is manually tuned for WCAG AA
              contrast. All colors are defined as HSL design tokens in CSS custom
              properties. Marketing pages default to Sunlight; Gold{" "}
              <span className="font-mono text-primary">#FFBF00</span> carries 30–60%
              of the visual surface.
            </p>

            <div className="space-y-12">
              {COLOR_TOKENS.map((group) => (
                <div key={group.label}>
                  <Eyebrow>{group.label}</Eyebrow>
                  <div className="mt-4 border-t border-border">
                    {group.colors.map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center gap-4 py-4 border-b border-border"
                      >
                        <div
                          className="w-10 h-10 border border-border shrink-0"
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

            <div className="mt-10 space-y-3 text-sm text-foreground/80 max-w-2xl">
              <p>
                <strong>Rule:</strong> never reference raw hex values in components.
                Always use semantic tokens:{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">bg-primary</code>,{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">text-foreground</code>.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 05: TYPOGRAPHY ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader numeral="05" eyebrow="Typography" title="Type system." />

            <div className="space-y-12">
              <div className="border-l border-primary/60 pl-6">
                <Eyebrow>Display & Editorial</Eyebrow>
                <p className="text-5xl sm:text-6xl font-sacred font-bold tracking-wide mt-3 mb-3">
                  Cinzel
                </p>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Weights 400–900. Used for the wordmark, page titles, section
                  headings, and editorial labels. Always set with{" "}
                  <code className="text-xs bg-muted px-1 py-0.5">font-sacred</code>.
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-3xl font-sacred font-bold">
                    Heading 1, 30–48px Bold
                  </p>
                  <p className="text-xl font-sacred font-semibold">
                    Heading 2, 20–30px Semibold
                  </p>
                  <p className="text-base font-sacred font-medium uppercase tracking-[0.2em]">
                    Label, 10–12px Medium
                  </p>
                </div>
              </div>

              <div className="border-l border-border pl-6">
                <Eyebrow>Body & UI</Eyebrow>
                <p className="text-5xl sm:text-6xl font-sans font-bold tracking-tight mt-3 mb-3">
                  Inter
                </p>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Weights 300–900. Used for body copy, buttons, navigation links,
                  metadata, and all UI elements. The default font-family.
                </p>
                <div className="mt-6 space-y-2">
                  <p className="text-base font-sans">Body, 14–16px Regular</p>
                  <p className="text-sm font-sans font-medium">UI Label, 13–14px Medium</p>
                  <p className="text-xs font-sans text-muted-foreground">
                    Caption, 11–12px Regular, Muted
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-3 text-sm text-foreground/80 max-w-2xl">
              <p>
                <strong>Rule:</strong> never use Cinzel for body text. Never use Inter
                for the wordmark or page titles.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 06: VOICE ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader numeral="06" eyebrow="Voice & Tone" title="How we speak." />

            <div className="border-t border-border">
              {VOICE_PRINCIPLES.map((p, i) => (
                <div
                  key={p.title}
                  className="grid grid-cols-12 gap-4 sm:gap-8 py-7 border-b border-border"
                >
                  <p className="col-span-2 text-[10px] uppercase tracking-[0.3em] text-primary/80 font-mono pt-1">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <div className="col-span-10">
                    <p className="font-sacred text-lg font-semibold mb-1">{p.title}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {p.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 space-y-3 text-sm text-foreground/80 max-w-2xl">
              <p>
                <strong>Tagline:</strong> "Discover, Track & Share Your Favorite Manga,
                Manhwa & Manhua", used in meta descriptions and SEO. Never in the UI
                header.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 07: DON'TS ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader
              numeral="07"
              eyebrow="Don'ts"
              title="Things we never do."
            />

            <ul className="border-t border-border">
              {DONTS.map((d, i) => (
                <li
                  key={i}
                  className="flex items-start gap-6 py-5 border-b border-border text-sm text-foreground/85"
                >
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground shrink-0 pt-1 w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="leading-relaxed">{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
        </div>

        {/* ─── 08: MOTION ─── */}
        <section className="py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6">
            <SectionHeader
              numeral="08"
              eyebrow="Motion"
              title="Animation principles."
            />

            <div className="space-y-5 text-sm text-foreground/80 max-w-2xl leading-relaxed">
              <p>
                All interactive elements use spring-physics easing:{" "}
                <code className="text-xs bg-muted px-1.5 py-0.5">
                  cubic-bezier(0.34, 1.56, 0.64, 1)
                </code>
                .
              </p>
              <p>
                Cards hover with a subtle vertical lift (6px) and 1.01× scale. Buttons
                respond with a press-and-bounce microinteraction.
              </p>
              <p>
                Page sections stagger-reveal on scroll at 40ms intervals. Entrance
                animations last 500ms max. Animate <code className="text-xs bg-muted px-1 py-0.5">opacity</code>{" "}
                and <code className="text-xs bg-muted px-1 py-0.5">transform</code>{" "}
                only, never <code className="text-xs bg-muted px-1 py-0.5">width</code>{" "}
                or <code className="text-xs bg-muted px-1 py-0.5">height</code>.
              </p>
              <p>
                <strong>Rule:</strong> no particle effects, no sparkle, no coin-drop.
                Motion should feel physical and intentional, never decorative or
                gamified.
              </p>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <GoldRule />
          <p className="mt-8 text-[10px] uppercase tracking-[0.3em] text-muted-foreground text-center">
            Internal Reference — v2.0 — Louis T.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
