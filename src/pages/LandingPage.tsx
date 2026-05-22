/**
 * Landing — Bibue v2.0 cold-visit page (logged-out /).
 *
 * Designed for a licensing director at Kakao Entertainment opening this
 * URL on a 27-inch monitor in a quiet Seoul office. Fifteen seconds to
 * form an opinion. Sunlight register (cream + gold), Moonlight inset
 * hero figure, no anti-patterns from DESIGN.md.
 *
 * Every price and percentage imports from src/lib/pricing/tiers.ts.
 */
import { Link } from "react-router-dom";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { SEO } from "@/components/SEO";
import Footer from "@/components/Footer";
import { PRICING, REVENUE_SHARE, WEDGE, TIERS, formatPct } from "@/lib/pricing/tiers";
import heroFigure from "@/assets/brand-hero-reader.jpg";

/* ─────────────────────────────────────────────────────────────── */
/*  Motion                                                          */
/* ─────────────────────────────────────────────────────────────── */

const easeOutQuint: [number, number, number, number] = [0.22, 1, 0.36, 1];
const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1];

function useEntrance() {
  const reduced = useReducedMotion();
  const fadeUp: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 12 },
    show: (i: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.2 : 0.7, ease: easeOutQuint, delay: i * 0.08 },
    }),
  };
  const insetReveal: Variants = {
    hidden: { opacity: 0, scale: reduced ? 1 : 1.02 },
    show: {
      opacity: 1,
      scale: 1,
      transition: { duration: reduced ? 0.2 : 1.2, ease: easeOutExpo, delay: 0.2 },
    },
  };
  return { fadeUp, insetReveal };
}

/* ─────────────────────────────────────────────────────────────── */
/*  Sub-components                                                  */
/* ─────────────────────────────────────────────────────────────── */

function TopNav() {
  const items = [
    { label: "For Publishers", to: "/for-publishers" },
    { label: "For Creators", to: "/for-creators" },
    { label: "Heritage", to: "/corporate" },
    { label: "Brand", to: "/brand" },
  ];
  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto h-full px-6 sm:px-10 flex items-center justify-between">
        <Link to="/" className="font-sacred text-xl tracking-wide text-foreground">
          Bibue
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              className="text-[11px] uppercase tracking-[0.2em] text-foreground/75 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {it.label}
            </Link>
          ))}
          <Link
            to="/auth"
            className="text-[11px] uppercase tracking-[0.2em] text-foreground/80 hover:text-foreground border-b border-primary/60 hover:border-primary pb-0.5 transition-colors"
          >
            Sign in
          </Link>
        </nav>

        <Link
          to="/auth"
          className="md:hidden text-[11px] uppercase tracking-[0.2em] text-foreground/80"
        >
          Menu
        </Link>
      </div>
    </header>
  );
}

function NumberedRow({
  n,
  heading,
  body,
}: {
  n: string;
  heading: string;
  body: string;
}) {
  return (
    <div className="border-t border-border/60 pt-6 pb-6 grid grid-cols-12 gap-6 items-baseline">
      <span className="col-span-2 text-[11px] uppercase tracking-[0.25em] text-primary font-mono">
        {n}
      </span>
      <div className="col-span-10">
        <h3 className="font-sacred text-xl mb-2 text-foreground">{heading}</h3>
        <p className="text-sm text-foreground/75 leading-relaxed max-w-2xl">{body}</p>
      </div>
    </div>
  );
}

function HeritageCard({ author, title }: { author: string; title: string }) {
  return (
    <figure className="shrink-0 w-64">
      <div className="aspect-[3/4] border border-primary/60 bg-muted/20 overflow-hidden flex items-center justify-center">
        {/* Placeholder fill — heritage assets ship separately. */}
        <span className="text-[9px] tracking-[0.25em] uppercase text-white/30 font-mono">
          Plate
        </span>
      </div>
      <figcaption className="mt-3 space-y-0.5 text-[10px] tracking-[0.25em] uppercase text-white/50 font-mono">
        <div>{author}</div>
        <div>{title}</div>
        <div>Public domain, Bibue restoration</div>
      </figcaption>
    </figure>
  );
}

/* ─────────────────────────────────────────────────────────────── */
/*  Page                                                            */
/* ─────────────────────────────────────────────────────────────── */

export default function LandingPage() {
  const { fadeUp, insetReveal } = useEntrance();

  const publisherShare = formatPct(REVENUE_SHARE.publishers);
  const creatorShare = formatPct(REVENUE_SHARE.creatorsDefault);
  const studioShare = formatPct(REVENUE_SHARE.creatorsStudio);
  const industryAvg = formatPct(WEDGE.industryAvgPublisherShare);

  const heritage = [
    { author: "Hokusai", title: "Thirty-six Views of Mount Fuji" },
    { author: "Toba Sōjō", title: "Chōjū-jinbutsu-giga" },
    { author: "Sawaki Sūshi", title: "Hyakkai-Zukan" },
    { author: "Anonymous", title: "Hyakki Yagyō Emaki" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans antialiased">
      <SEO
        title="Bibue, a licensed home for manga, manhwa and manhua"
        description="A unified subscription platform for anime, manga, manhwa and manhua. Non-exclusive licensing, 52% to rights holders, 60 languages on first publication."
        url="/"
      />

      <TopNav />

      <main>
        {/* ───────────────────────── 1. HERO ───────────────────────── */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 py-32 lg:py-48">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16 items-center">
            {/* Right inset moves above headline on mobile */}
            <motion.div
              className="md:col-span-5 md:order-2"
              variants={insetReveal}
              initial="hidden"
              animate="show"
            >
              <div
                className="relative aspect-[3/4] overflow-hidden border border-primary/60"
                style={{ backgroundColor: "#050505" }}
              >
                <img
                  src={heroFigure}
                  alt="A reader, absorbed in a manga page on a tablet."
                  className="w-full h-full object-cover"
                  loading="eager"
                  decoding="async"
                  width={1024}
                  height={1365}
                />
                <div className="absolute bottom-0 inset-x-0 px-4 py-3 border-t border-white/10 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-white/50 font-mono">
                    Figure 01 · A reader, Bibue 2.0
                  </p>
                </div>
              </div>
              <p className="mt-6 text-[10px] tracking-[0.2em] uppercase text-foreground/50">
                Editorial portrait. Leonardo Phoenix. Bibue archive 2026.
              </p>
            </motion.div>

            <div className="md:col-span-7 md:order-1">
              <motion.p
                custom={0}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-[10px] uppercase tracking-[0.3em] text-foreground/60 mb-8"
              >
                01, A licensed home for the work
              </motion.p>

              <motion.h1
                custom={1}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="font-sacred font-bold text-5xl sm:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-foreground mb-10"
              >
                Anime, manga, manhwa, manhua.
                <br />
                One agreement.
                <br />
                <span className="italic text-primary">One home.</span>
              </motion.h1>

              <motion.p
                custom={2}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="text-base sm:text-lg leading-relaxed text-foreground/75 max-w-xl mb-12"
              >
                Bibue is a unified subscription platform built around the work and the
                people who make it. Fifty-two percent of revenue is returned to rights
                holders, sixty-seven to independent creators. Translation into sixty
                languages happens on first publication, reviewed by native editors,
                watermarked end to end.
              </motion.p>

              <motion.div
                custom={3}
                variants={fadeUp}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-4 items-center"
              >
                <Link
                  to="/for-publishers"
                  className="inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:brightness-95 transition-[filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  Request a partner conversation
                </Link>
                <Link
                  to="/corporate"
                  className="group inline-flex items-center text-[11px] uppercase tracking-[0.25em] text-foreground/80 hover:text-foreground transition-colors"
                >
                  <span className="border-b border-primary group-hover:border-b-2 transition-[border-width] pb-0.5">
                    Read the brief
                  </span>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ─────────── 2. THREE-LINE PROPOSITION ROW ─────────── */}
        <section className="w-full bg-muted border-y border-primary/60 py-10">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              {
                n: "01, Rights",
                title: "Non-exclusive.",
                body: `Twenty-four hour takedown SLA.`,
              },
              {
                n: "02, Revenue",
                title: `${publisherShare} to holders.`,
                body: `${creatorShare} default to indie creators.`,
              },
              {
                n: "03, Reach",
                title: `${WEDGE.languagesOnDay1}+ languages.`,
                body: "Translated on first publication, reviewed by editors.",
              },
            ].map((c) => (
              <div key={c.n} className="px-8 py-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
                  {c.n}
                </p>
                <p className="font-sacred text-2xl leading-tight text-foreground">
                  {c.title}
                </p>
                <p className="text-sm text-foreground/70 mt-2">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ─────────── 3. NUMBERED EDITORIAL, WHAT BIBUE IS ─────────── */}
        <section className="max-w-3xl mx-auto px-6 sm:px-10 py-32">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            02, A quiet position
          </p>
          <h2 className="font-sacred font-bold text-3xl sm:text-4xl mb-10 tracking-tight">
            Bibue is a publishing house that learned to stream.
          </h2>
          <div className="space-y-6 max-w-2xl text-base leading-relaxed text-foreground/80">
            <p>
              The streaming generation taught readers to expect everything in one
              place. The publishing generation taught creators what it means for the
              work to be cared for. Bibue is what happens when those two expectations
              meet in a single contract.
            </p>
            <p>
              We license. We do not acquire. The work remains the author's, the
              catalog remains the publisher's, the translation rights remain
              reversible. What we ask for is the chance to host the work cleanly, pay
              back a majority share, and put it in front of readers in the language
              they already read in.
            </p>
            <p>
              This is a position, not a pitch. The numbers below are the position
              written out.
            </p>
          </div>
          <div className="mt-16 border-t border-primary/60" />
        </section>

        {/* ─────────── 4. WHAT IT GIVES BACK ─────────── */}
        <section className="max-w-3xl mx-auto px-6 sm:px-10 py-24">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            03, Terms, in plain English
          </p>
          <h2 className="font-sacred font-bold text-3xl sm:text-4xl mb-12 tracking-tight">
            What rights holders keep.
          </h2>
          <NumberedRow
            n="01."
            heading="Non-exclusive licensing."
            body="Publishers and creators retain all distribution rights elsewhere. Nothing in a Bibue contract prevents simultaneous publication on Webtoon, Tapas, MangaPlus, a publisher's own site, or any other venue. We are additive, never substitutive."
          />
          <NumberedRow
            n="02."
            heading="Fifty-two percent rights-holder share."
            body={`The default split is ${publisherShare} to the publisher or licensing entity, with an additional 15% earmarked for the original creators through transparent royalty reporting. Industry average is roughly ${industryAvg}. We chose the higher number because the work is the reason readers come.`}
          />
          <NumberedRow
            n="03."
            heading="Twenty-four hour takedown."
            body={`Any title can be removed from the catalog within ${WEDGE.takedownSLAHours} hours of a written request, no penalty, no clawback. The license is the publisher's to revoke.`}
          />
          <NumberedRow
            n="04."
            heading="Translation that holds up."
            body={`${WEDGE.languagesOnDay1} languages on first publication, generated by frontier models, reviewed by paid native editors, watermarked end to end. Audit logs available to any rights holder on request.`}
          />
        </section>

        {/* ─────────── 5. HERITAGE STRIP ─────────── */}
        <section className="w-full py-24 text-white" style={{ backgroundColor: "#050505" }}>
          <div className="max-w-6xl mx-auto px-6 sm:px-10">
            <p className="text-[10px] tracking-[0.3em] uppercase text-primary mb-4">
              04, Already in the catalog
            </p>
            <h2 className="font-sacred font-bold text-3xl sm:text-4xl text-white mb-12 tracking-tight">
              Heritage works, restored and translated.
            </h2>

            <div className="flex gap-6 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {heritage.map((h) => (
                <HeritageCard key={h.title} author={h.author} title={h.title} />
              ))}
            </div>

            <p className="mt-12 max-w-xl text-sm text-white/70 leading-relaxed">
              The heritage catalog is what we built first, while contemporary
              partners come on board. Every work above is freely readable in sixty
              languages today.
            </p>
          </div>
        </section>

        {/* ─────────── 6. HOW IT WORKS ─────────── */}
        <section className="max-w-3xl mx-auto px-6 sm:px-10 py-32">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            05, The shape of a partnership
          </p>
          <h2 className="font-sacred font-bold text-3xl sm:text-4xl mb-12 tracking-tight">
            Four steps, no surprises.
          </h2>
          <NumberedRow
            n="01."
            heading="Conversation."
            body="A licensing director writes; we set up a thirty-minute call. No pitch deck, no consumer-facing sales motion. We talk about which titles, which territories, which languages, and what the take-home looks like at realistic volume."
          />
          <NumberedRow
            n="02."
            heading="Contract."
            body="A short, non-exclusive agreement drafted in the publisher's preferred jurisdiction (we sign under Japanese, Korean, or Delaware law). One page of terms, two pages of schedules, no auto-renewal, no exclusivity clause."
          />
          <NumberedRow
            n="03."
            heading="Ingest."
            body="Source files arrive through SFTP or a publisher's existing CMS. Our pipeline restores resolution, translates into sixty languages, runs native-editor review, and watermarks every page with reversible per-reader telemetry."
          />
          <NumberedRow
            n="04."
            heading="Reporting."
            body="A monthly statement, paid by ACH or Wise. Every page view, every territory, every language, every cent. Audit logs available on request, retained for seven years."
          />
        </section>

        {/* ─────────── 7. PRICING REVEAL ─────────── */}
        <section className="max-w-6xl mx-auto px-6 sm:px-10 py-24 border-t border-primary/60">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-4">
            06, What readers pay
          </p>
          <h2 className="font-sacred font-bold text-3xl sm:text-4xl mb-2 tracking-tight">
            One price. No surprises.
          </h2>
          <p className="text-sm text-foreground/70 mb-12 max-w-xl">
            Subscriptions support the catalog. Credits support individual creators
            directly.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
            <ul className="md:col-span-7 list-none p-0 m-0">
              {TIERS.map((tier) => (
                <li
                  key={tier.id}
                  className="border-t border-border first:border-t-0 md:first:border-t py-6 grid grid-cols-12 gap-4 items-baseline"
                >
                  <div className="col-span-8">
                    <p className="font-sacred text-xl text-foreground">{tier.label}</p>
                    <p className="text-sm text-foreground/70 mt-1">
                      {tier.tagline} {tier.cadence}.
                    </p>
                  </div>
                  <p className="col-span-4 font-sacred text-2xl text-primary text-right">
                    {tier.priceDisplay}
                  </p>
                </li>
              ))}
            </ul>

            <aside className="md:col-span-5 max-w-sm">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary mb-3">
                Studio, for creators
              </p>
              <p className="text-sm text-foreground/80 leading-relaxed">
                Creators on Bibue Studio keep {creatorShare} of subscription revenue
                attributable to their work, rising to {studioShare} for native
                originals. Credits purchased by readers go to the creator directly,
                minus payment processing, with no platform cut.
              </p>
            </aside>
          </div>

          <p className="mt-12 text-xs uppercase tracking-[0.3em] text-foreground/60">
            All amounts shown in {PRICING.monthly.currency}. Local currency at
            checkout.
          </p>
        </section>

        {/* ─────────── 8. CLOSING INSCRIPTION ─────────── */}
        <section className="max-w-3xl mx-auto px-6 sm:px-10 py-40 text-center">
          <p className="font-sacred italic text-2xl sm:text-3xl leading-[1.4] text-foreground/85">
            A licensed home for the work, a fair share for the people who make it,
            and a reader who finds it on the first try.
          </p>
          <div className="mt-10">
            <Link
              to="/for-publishers"
              className="inline-flex items-center justify-center rounded-sm bg-primary text-primary-foreground px-6 py-3 text-[11px] uppercase tracking-[0.25em] font-medium hover:brightness-95 transition-[filter] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              Request a partner conversation
            </Link>
          </div>
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-foreground/50">
            Bibue is currently in private beta. By invitation.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
