import { useState } from "react";
import { Link } from "react-router-dom";
import creatorsHeroBg from "@/assets/creators-hero-bg.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Slider } from "@/components/ui/slider";
import {
  DollarSign,
  Award,
  Zap,
  BarChart3,
  CreditCard,
  Headphones,
  Star,
  ArrowRight,
  Check,
  Upload,
  Sparkles,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PERKS = [
  {
    icon: DollarSign,
    title: "Keep 80–90% of Revenue",
    description: "Earn from ads, tips, and subscriptions. We take a small platform cut — you keep the rest.",
  },
  {
    icon: Award,
    title: "Founding Creator Badge",
    description: "First 50 creators get a permanent badge and featured placement on the homepage — forever.",
  },
  {
    icon: Zap,
    title: "Instant Publishing",
    description: "No long review queues for your first 100 uploads. Get your work in front of readers immediately.",
  },
  {
    icon: BarChart3,
    title: "Full Stats Dashboard",
    description: "Track views, likes, earnings, and reader retention for every series in real time.",
  },
  {
    icon: CreditCard,
    title: "Easy Monthly Payouts",
    description: "Get paid every month via Stripe or PayPal. No hidden fees, no hoops to jump through.",
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Direct access to the team. Your feature requests actually get built — fast.",
  },
];

const COMPARISON = [
  { feature: "Revenue Share", bibue: "80–90%", webtoon: "50%", tapas: "60%" },
  { feature: "Review Speed", bibue: "Instant*", webtoon: "2–4 weeks", tapas: "1–2 weeks" },
  { feature: "Creator Badge", bibue: "Yes (Founding)", webtoon: "No", tapas: "No" },
  { feature: "Stats Dashboard", bibue: "Full + Real-time", webtoon: "Limited", tapas: "Basic" },
  { feature: "Monthly Payouts", bibue: "Stripe / PayPal", webtoon: "Ad Rev only", tapas: "$100 min" },
  { feature: "Priority Support", bibue: "Direct access", webtoon: "Ticket system", tapas: "Ticket system" },
];

const SHARE_OPTIONS = [80, 85, 90] as const;

const STATIC_TABLE = [
  { views: "10,000", webtoon: "~$2–$4", bibue85: "~$7–$12", extra85: "+$5–$8" },
  { views: "50,000", webtoon: "~$10–$22", bibue85: "~$35–$75", extra85: "+$25–$53" },
  { views: "100,000", webtoon: "~$20–$45", bibue85: "~$70–$150", extra85: "+$50–$105" },
  { views: "500,000", webtoon: "~$100–$225", bibue85: "~$350–$750", extra85: "+$250–$525" },
];

// CPM ranges based on creator reports
const WEBTOON_LOW_CPM = 0.20;
const WEBTOON_HIGH_CPM = 0.45;
const BIBUE_BASE_LOW_CPM = 0.82;
const BIBUE_BASE_HIGH_CPM = 1.76;

function getStaticRow(viewsLabel: string, share: number) {
  // Scale static table values by share/85
  const scale = share / 85;
  const rows: Record<string, { bibue: string; extra: string }> = {
    "10,000": {
      bibue: `~$${Math.round(7 * scale)}–$${Math.round(12 * scale)}`,
      extra: `+$${Math.round(5 * scale)}–$${Math.round(8 * scale)}`,
    },
    "50,000": {
      bibue: `~$${Math.round(35 * scale)}–$${Math.round(75 * scale)}`,
      extra: `+$${Math.round(25 * scale)}–$${Math.round(53 * scale)}`,
    },
    "100,000": {
      bibue: `~$${Math.round(70 * scale)}–$${Math.round(150 * scale)}`,
      extra: `+$${Math.round(50 * scale)}–$${Math.round(105 * scale)}`,
    },
    "500,000": {
      bibue: `~$${Math.round(350 * scale)}–$${Math.round(750 * scale)}`,
      extra: `+$${Math.round(250 * scale)}–$${Math.round(525 * scale)}`,
    },
  };
  return rows[viewsLabel] || { bibue: "–", extra: "–" };
}

function EarningsCalculator() {
  const [views, setViews] = useState([100000]);
  const [share, setShare] = useState<number>(85);
  const viewCount = views[0];

  const webtoonLow = (viewCount / 1000) * WEBTOON_LOW_CPM;
  const webtoonHigh = (viewCount / 1000) * WEBTOON_HIGH_CPM;
  const webtoonMid = (webtoonLow + webtoonHigh) / 2;

  const bibueLow = (viewCount / 1000) * BIBUE_BASE_LOW_CPM * (share / 100);
  const bibueHigh = (viewCount / 1000) * BIBUE_BASE_HIGH_CPM * (share / 100);
  const bibueMid = (bibueLow + bibueHigh) / 2;

  const extraMid = bibueMid - webtoonMid;
  const pctMore = webtoonMid > 0 ? Math.round(((bibueMid - webtoonMid) / webtoonMid) * 100) : 0;

  const fmt = (n: number) => (n < 10 ? n.toFixed(2) : Math.round(n).toLocaleString());

  return (
    <div className="max-w-3xl mx-auto">
      {/* Slider */}
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6 sm:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                Your monthly page views
              </label>
              <span className="text-lg font-bold tabular-nums">{viewCount.toLocaleString()}</span>
            </div>
            <Slider
              value={views}
              onValueChange={setViews}
              min={10000}
              max={1000000}
              step={10000}
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>10K</span>
              <span>1M</span>
            </div>
          </div>

          {/* Revenue share toggle */}
          <div className="flex items-center gap-3 mb-6">
            <span className="text-sm text-muted-foreground">My revenue share:</span>
            <div className="flex gap-1.5">
              {SHARE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setShare(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                    share === s
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}%
                </button>
              ))}
            </div>
          </div>

          {/* Side-by-side boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Webtoon box */}
            <div className="p-5 rounded-xl border border-border/50 bg-muted/30">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">On Webtoon Canvas</p>
              <p className="text-xs text-muted-foreground mb-4">50% revenue share</p>
              <p className="text-sm text-muted-foreground mb-1">You would earn</p>
              <p className="text-2xl sm:text-3xl font-bold text-muted-foreground/70 tabular-nums transition-all duration-300">
                ≈ ${fmt(webtoonMid)}<span className="text-base font-normal">/mo</span>
              </p>
            </div>

            {/* Bibue box */}
            <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">On bibue.net</p>
              <p className="text-xs text-muted-foreground mb-4">{share}% revenue share</p>
              <p className="text-sm text-muted-foreground mb-1">You would earn</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums transition-all duration-300">
                ≈ ${fmt(bibueMid)}<span className="text-base font-normal">/mo</span>
              </p>
              <p className="text-base font-bold text-primary mt-3 tabular-nums transition-all duration-300">
                +${fmt(extraMid)} more per month
                <span className="text-xs font-normal text-muted-foreground ml-1">(you keep {pctMore}% more)</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Real average from Webtoon Canvas creators: $0.20–$0.45 per 1,000 views. Numbers are estimates based on 2025 creator reports.
          </p>
        </CardContent>
      </Card>

      {/* Static comparison table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs sm:text-sm">Monthly Views</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-xs sm:text-sm">Webtoon Canvas (50%)</th>
              <th className="text-center py-3 px-2 font-bold text-primary text-xs sm:text-sm">bibue.net ({share}%)</th>
              <th className="text-center py-3 px-2 font-semibold text-primary text-xs sm:text-sm">Extra you keep</th>
            </tr>
          </thead>
          <tbody>
            {STATIC_TABLE.map((row) => {
              const scaled = getStaticRow(row.views, share);
              return (
                <tr key={row.views} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-2 font-medium text-sm">{row.views}</td>
                  <td className="py-3 px-2 text-center text-muted-foreground text-sm">{row.webtoon}</td>
                  <td className="py-3 px-2 text-center font-semibold text-primary text-sm">{scaled.bibue}</td>
                  <td className="py-3 px-2 text-center font-semibold text-primary text-sm">{scaled.extra}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Creators | Bibue — Turn Your Manga Into Money"
        description="Join Bibue and earn 80-90% revenue from your original manga, manhwa & manhua. Instant publishing, full stats, and monthly payouts."
      />
      <CollapsibleNavbar />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden">
        <img
          src={creatorsHeroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background" />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5">
            <Star className="w-3.5 h-3.5 text-primary" />
            Limited — Only 50 Founding Creator spots
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6">
            Turn Your Manga Into{" "}
            <span className="text-primary">Money</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of creators earning from their original manga, manhwa &amp; manhua.
            Keep up to <strong className="text-primary">90% of revenue</strong> — the highest in the industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="gap-2 text-base px-8">
              <Link to="/creator/dashboard">
                <Upload className="w-5 h-5" />
                Start Uploading Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2 text-base px-8">
              <a href="#perks">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Perks Grid ─── */}
      <section id="perks" className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Why Bibue?</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Everything You Need to Succeed
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PERKS.map((perk, i) => (
              <Card
                key={i}
                className="group border-border/50 bg-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/20"
              >
                <CardContent className="p-5 flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <perk.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{perk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Earnings Comparison ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Earnings Comparison</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              See Exactly How Much More You Can Earn
            </h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-xl mx-auto">
              Most platforms take a big cut. We don't. Move the slider to see real numbers based on actual creator reports from Webtoon Canvas.
            </p>
          </div>
          <EarningsCalculator />
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              See How We Compare
            </h2>
          </div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-3 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-3 font-bold text-primary">Bibue</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Webtoon Canvas</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Tapas</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-3 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                        <Check className="w-4 h-4 text-primary" />
                        {row.bibue}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-muted-foreground">{row.webtoon}</td>
                    <td className="py-3.5 px-3 text-center text-muted-foreground">{row.tapas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-muted-foreground mt-3">* Instant publishing for first 100 uploads per creator</p>
          </div>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-primary/10 bg-card overflow-hidden relative">
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Ready to Become a Founding Creator?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Upload your first chapter in under 5 minutes. No complicated setup — just your art and your story.
              </p>
              <Button asChild size="lg" className="gap-2 text-base px-8">
                <Link to="/creator/dashboard">
                  <Upload className="w-5 h-5" />
                  Start Creating Today
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Floating Upload Button ─── */}
      <Link
        to="/creator/dashboard"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-primary-foreground font-semibold shadow-lg hover:scale-105 transition-all duration-200"
      >
        <Upload className="w-4 h-4" />
        Upload Now
      </Link>

      <Footer />
    </div>
  );
}
