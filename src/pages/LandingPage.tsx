/**
 * Landing — shown to logged-out visitors on /.
 * Leonardo.ai-style perspective wordmark wrap, Bibue Gold on Cream.
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[hsl(40_30%_95%)] text-[hsl(30_10%_8%)] overflow-hidden">
      <SEO
        title="Bibue — Manga, manhwa & manhua, one storefront"
        description="One agreement. One storefront. 60+ languages from day one. The reader-first platform for manga, manhwa and manhua."
        url="/"
      />
      <CollapsibleNavbar />

      <main className="relative w-full">
        {/* ─── HERO with perspective wordmark wrap ─── */}
        <section className="relative w-full min-h-[100svh] flex items-center justify-center px-4 py-24">
          {/* Top arc */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 select-none flex justify-center"
            style={{
              transform: "perspective(900px) rotateX(55deg) translateY(-6%)",
              transformOrigin: "center bottom",
            }}
          >
            <span className="font-sacred font-black text-[hsl(42_100%_50%)] tracking-[-0.04em] leading-none whitespace-nowrap text-[18vw] sm:text-[16vw] md:text-[14vw]">
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
            <span className="font-sacred font-black text-[hsl(42_100%_50%)] tracking-[-0.04em] leading-none whitespace-nowrap text-[18vw] sm:text-[16vw] md:text-[14vw]">
              READ&nbsp;READ&nbsp;READ
            </span>
          </div>

          {/* Left ribbon */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 hidden md:flex items-center select-none"
            style={{ transform: "rotate(-90deg) translateX(-30%)", transformOrigin: "left center" }}
          >
            <span className="font-sacred font-black text-[hsl(42_100%_50%)] tracking-[-0.04em] leading-none whitespace-nowrap text-[12vw]">
              YOUR&nbsp;STORIES
            </span>
          </div>

          {/* Right ribbon */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 hidden md:flex items-center select-none"
            style={{ transform: "rotate(90deg) translateX(30%)", transformOrigin: "right center" }}
          >
            <span className="font-sacred font-black text-[hsl(42_100%_50%)] tracking-[-0.04em] leading-none whitespace-nowrap text-[12vw]">
              ONE&nbsp;STOREFRONT
            </span>
          </div>

          {/* Dark inset card with the actual message */}
          <div className="relative z-10 bg-[hsl(30_10%_8%)] text-[hsl(40_30%_95%)] px-8 sm:px-14 py-14 sm:py-20 max-w-2xl w-full text-center shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(42_100%_50%)] mb-6">
              Bibue 2.0 — Private beta
            </p>
            <h1 className="font-sacred font-bold tracking-tight leading-[1.05] text-3xl sm:text-4xl md:text-5xl">
              The reader-first platform for{" "}
              <span className="italic text-[hsl(42_100%_50%)]">
                manga, manhwa &amp; manhua.
              </span>
            </h1>
            <p className="mt-6 text-sm sm:text-base text-[hsl(40_30%_95%)]/70 max-w-md mx-auto leading-relaxed">
              One agreement. One storefront. Sixty languages on the first day of
              publication.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/subscribe"
                className="inline-flex items-center justify-center bg-[hsl(40_30%_95%)] text-[hsl(30_10%_8%)] px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[hsl(42_100%_50%)] transition-colors duration-300"
              >
                Start now
              </Link>
              <Link
                to="/manga"
                className="inline-flex items-center justify-center border border-[hsl(40_30%_95%)]/40 text-[hsl(40_30%_95%)] px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:border-[hsl(42_100%_50%)] hover:text-[hsl(42_100%_50%)] transition-colors duration-300"
              >
                Browse catalogue
              </Link>
            </div>
          </div>

          {/* Bottom micro-row */}
          <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(30_10%_8%)]/50">
              By invitation — qualified partners only
            </p>
          </div>
        </section>

        {/* ─── Three-line wedge ─── */}
        <section className="relative bg-[hsl(40_30%_95%)] py-24 sm:py-32 border-t border-[hsl(30_10%_8%)]/10">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(42_100%_50%)] mb-4">
              01 — The wedge
            </p>
            <h2 className="font-sacred font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl max-w-3xl">
              A quiet system for{" "}
              <span className="italic text-[hsl(42_100%_50%)]">a loud medium.</span>
            </h2>

            <div className="mt-16 border-t border-[hsl(30_10%_8%)]/15">
              {[
                { n: "01", k: "52%", l: "Publisher share", v: "vs ~35% industry average" },
                { n: "02", k: "67%", l: "Creator default", v: "up to 80% on Studio" },
                { n: "03", k: "24h", l: "Takedown SLA", v: "Non-exclusive licensing" },
                { n: "04", k: "60+", l: "Languages on day one", v: "AI-translated, watermarked" },
              ].map((row) => (
                <div
                  key={row.n}
                  className="grid grid-cols-12 items-baseline gap-4 sm:gap-8 py-8 border-b border-[hsl(30_10%_8%)]/15"
                >
                  <p className="col-span-2 text-[10px] uppercase tracking-[0.3em] font-mono text-[hsl(30_10%_8%)]/50">
                    {row.n}
                  </p>
                  <p className="col-span-4 sm:col-span-3 font-sacred font-bold text-[hsl(42_100%_50%)] text-4xl sm:text-5xl md:text-6xl leading-none">
                    {row.k}
                  </p>
                  <p className="col-span-6 sm:col-span-3 text-[10px] sm:text-xs uppercase tracking-[0.3em]">
                    {row.l}
                  </p>
                  <p className="col-span-12 sm:col-span-4 text-sm text-[hsl(30_10%_8%)]/65">
                    {row.v}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Closing band ─── */}
        <section className="relative bg-[hsl(30_10%_8%)] text-[hsl(40_30%_95%)] py-24 sm:py-32">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[hsl(42_100%_50%)] mb-6">
              02 — Read with us
            </p>
            <h2 className="font-sacred font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl">
              Eight ninety-nine,{" "}
              <span className="italic text-[hsl(42_100%_50%)]">every month.</span>
            </h2>
            <p className="mt-6 text-sm sm:text-base text-[hsl(40_30%_95%)]/70 max-w-md mx-auto leading-relaxed">
              Unlimited access to every licensed and bridged title. No tiers, no
              hidden fees, cancel anytime.
            </p>
            <Link
              to="/subscribe"
              className="mt-10 inline-flex items-center justify-center bg-[hsl(42_100%_50%)] text-[hsl(30_10%_8%)] px-7 py-3.5 text-[11px] uppercase tracking-[0.25em] font-medium hover:bg-[hsl(40_30%_95%)] transition-colors duration-300"
            >
              Join the wishlist
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
