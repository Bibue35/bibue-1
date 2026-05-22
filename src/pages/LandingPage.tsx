/**
 * Landing — shown to logged-out visitors on /.
 * Token-driven, adapts to active theme. Sunlight is the default register.
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { PRICING, WEDGE, formatPct } from "@/lib/pricing/tiers";
import heroFigure from "@/assets/brand-hero-reader.jpg";

const wedgeRows = [
  {
    n: "01",
    k: formatPct(0.52),
    l: "Publisher share",
    v: `vs ~${formatPct(WEDGE.industryAvgPublisherShare)} industry average`,
  },
  { n: "02", k: formatPct(0.67), l: "Creator default", v: "Up to 80% on Studio" },
  { n: "03", k: `${WEDGE.takedownSLAHours}h`, l: "Takedown SLA", v: "Non-exclusive licensing" },
  {
    n: "04",
    k: `${WEDGE.languagesOnDay1}+`,
    l: "Languages on day one",
    v: "AI-translated, watermarked",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SEO
        title="Bibue, manga, manhwa and manhua on one storefront"
        description="One agreement. One storefront. Sixty languages from day one. The reader-first platform for manga, manhwa and manhua."
        url="/"
      />
      <CollapsibleNavbar />

      <main className="relative w-full">
        {/* ─── HERO with perspective wordmark wrap ─── */}
        <section className="relative w-full min-h-[100svh] flex items-center justify-center px-4 py-32 md:py-48">
          {/* Top arc */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 select-none flex justify-center"
            style={{
              transform: "perspective(900px) rotateX(55deg) translateY(-6%)",
              transformOrigin: "center bottom",
            }}
          >
            <span className="font-sacred font-bold text-primary tracking-[-0.04em] leading-none whitespace-nowrap text-[18vw] sm:text-[16vw] md:text-[14vw]">
              BIBUE&nbsp;BIBUE&nbsp;BIBUE
            </span>
          </div>

          {/* Bottom arc */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 select-none flex justify-center"
            style={{
              transform: "perspective(900px) rotateX(-55deg) translateY(6%)",
              transformOrigin: "center top",
            }}
          >
            <span className="font-sacred font-bold text-primary tracking-[-0.04em] leading-none whitespace-nowrap text-[18vw] sm:text-[16vw] md:text-[14vw]">
              READ&nbsp;READ&nbsp;READ
            </span>
          </div>

          {/* Left ribbon */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden md:flex items-center select-none"
            style={{ transform: "rotate(-90deg) translateX(-30%)", transformOrigin: "left center" }}
          >
            <span className="font-sacred font-bold text-primary tracking-[-0.04em] leading-none whitespace-nowrap text-[12vw]">
              YOUR&nbsp;STORIES
            </span>
          </div>

          {/* Right ribbon */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center select-none"
            style={{ transform: "rotate(90deg) translateX(30%)", transformOrigin: "right center" }}
          >
            <span className="font-sacred font-bold text-primary tracking-[-0.04em] leading-none whitespace-nowrap text-[12vw]">
              ONE&nbsp;STOREFRONT
            </span>
          </div>

          {/* Dark inset card — Moonlight register via inverted tokens */}
          <div className="relative z-10 bg-foreground text-background px-8 sm:px-14 py-14 sm:py-20 max-w-2xl w-full text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)] animate-fade-up-spring rounded-sm">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
              Bibue 2.0 · Private beta
            </p>
            <h1 className="font-sacred font-bold tracking-tight leading-[1.05] text-3xl sm:text-4xl md:text-5xl">
              The reader-first platform for{" "}
              <span className="italic text-primary">manga, manhwa and manhua.</span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-background/70 max-w-md mx-auto leading-relaxed">
              One agreement. One storefront. Sixty languages on the first day of publication.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/subscribe"
                className="inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:opacity-90 transition-opacity duration-300"
              >
                Start now
              </Link>
              <Link
                to="/manga"
                className="inline-flex items-center justify-center rounded-sm border border-background/40 text-background px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:border-primary hover:text-primary transition-colors duration-300"
              >
                Browse catalogue
              </Link>
            </div>
          </div>

          {/* Bottom micro-row */}
          <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-foreground/50">
              By invitation, qualified partners only
            </p>
          </div>
        </section>

        {/* ─── Hero figure block (Moonlight inset, gold hairline) ─── */}
        <section className="relative bg-background py-24 border-t border-primary/30">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-16 items-center">
            <div className="md:col-span-5">
              <div className="relative bg-foreground border border-primary/60 overflow-hidden aspect-[3/4]">
                <img
                  src={heroFigure}
                  alt="A reader at dusk, lit by a single lamp, holding an open volume."
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <p className="absolute bottom-2 left-3 right-3 text-[9px] tracking-[0.25em] uppercase text-white/50 font-mono">
                  Figure 01 · Reader at dusk
                </p>
              </div>
            </div>
            <div className="md:col-span-7">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
                The register
              </p>
              <h2 className="font-sacred font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl leading-[1.05]">
                Illuminated, like a{" "}
                <span className="italic text-primary">manuscript.</span>
              </h2>
              <p className="mt-6 text-sm sm:text-base text-foreground/70 max-w-xl leading-relaxed">
                Gold leaf around a dark inset. A quiet register for a loud medium,
                tuned for reading in long sittings and for publishing decisions made
                in fifteen seconds.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Three-line wedge ─── */}
        <section className="relative bg-background py-32 border-t border-foreground/10">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
              01 · The wedge
            </p>
            <h2 className="font-sacred font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl max-w-3xl">
              A quiet system for{" "}
              <span className="italic text-primary">a loud medium.</span>
            </h2>

            <div className="mt-16 border-t border-foreground/15">
              {wedgeRows.map((row) => (
                <div
                  key={row.n}
                  className="grid grid-cols-12 items-baseline gap-4 sm:gap-8 py-8 border-b border-foreground/15 animate-fade-up-spring"
                >
                  <p className="col-span-2 text-[10px] uppercase tracking-[0.3em] font-mono text-foreground/50">
                    {row.n}
                  </p>
                  <p className="col-span-4 sm:col-span-3 font-sacred font-bold text-primary text-4xl sm:text-5xl md:text-6xl leading-none">
                    {row.k}
                  </p>
                  <p className="col-span-6 sm:col-span-3 text-[10px] sm:text-xs uppercase tracking-[0.3em]">
                    {row.l}
                  </p>
                  <p className="col-span-12 sm:col-span-4 text-sm text-foreground/65">
                    {row.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Closing band ─── */}
        <section className="relative bg-foreground text-background py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-6">
              02 · Read with us
            </p>
            <h2 className="font-sacred font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
              {PRICING.monthly.display}
              <span className="italic text-primary">, every month.</span>
            </h2>
            <p className="mt-6 text-sm sm:text-base text-background/70 max-w-md mx-auto leading-relaxed">
              Unlimited access to every licensed and bridged title. No tiers, no
              hidden fees, cancel anytime.
            </p>
            <Link
              to="/subscribe"
              className="mt-10 inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground px-7 py-3.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:opacity-90 transition-opacity duration-300"
            >
              Join the wishlist
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
