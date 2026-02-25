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
  Quote,
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

const TESTIMONIALS = [
  {
    name: "Yuki Tanaka",
    handle: "@yukidraws",
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Yuki&backgroundColor=b6e3f4",
    quote: "I uploaded my first chapter and had 2,000 reads in a week. The revenue share is insane compared to other platforms.",
    series: "Neon Ronin",
  },
  {
    name: "Carlos Mendez",
    handle: "@cmendezart",
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Carlos&backgroundColor=c0aede",
    quote: "The instant publishing changed everything. No more waiting weeks for approval — my readers get chapters the day I finish them.",
    series: "Abyssal Tide",
  },
  {
    name: "Mina Park",
    handle: "@minapark_ink",
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Mina&backgroundColor=d1d4f9",
    quote: "Bibue treats creators like partners, not content farms. I earned more in my first month here than 6 months on other platforms.",
    series: "Dreamweaver",
  },
];

const SHARE_OPTIONS = [80, 85, 90] as const;
const COMPARISON_TABLE = [
  { views: 10000, webtoon: 2.5, bibue: 8.5 },
  { views: 100000, webtoon: 25, bibue: 85 },
  { views: 500000, webtoon: 125, bibue: 425 },
  { views: 1000000, webtoon: 250, bibue: 850 },
];

function EarningsComparisonCalculator() {
  const [views, setViews] = useState([100000]);
  const [share, setShare] = useState(85);
  const viewCount = views[0];

  const webtoonCpm = 0.25;
  const bibueCpm = (share / 100) * 1.0;
  const webtoonEarnings = (viewCount / 1000) * webtoonCpm;
  const bibueEarnings = (viewCount / 1000) * bibueCpm;
  const extra = bibueEarnings - webtoonEarnings;

  const formatK = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-border/50 bg-card overflow-hidden">
        <CardContent className="p-6 sm:p-8">
          {/* Views Slider */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Monthly Page Views
              </label>
              <span className="text-lg font-bold text-primary tabular-nums">{viewCount.toLocaleString()}</span>
            </div>
            <Slider
              value={views}
              onValueChange={setViews}
              min={10000}
              max={1000000}
              step={10000}
              className="mb-2"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>10K</span>
              <span>1M</span>
            </div>
          </div>

          {/* Revenue Share Toggle */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-sm text-muted-foreground">Revenue Share:</span>
            <div className="flex gap-1.5">
              {SHARE_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setShare(s)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
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

          {/* Side-by-side Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-border/50 bg-muted/30">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">On Webtoon Canvas</p>
              <p className="text-xs text-muted-foreground mb-3">~$0.25 per 1,000 views</p>
              <p className="text-3xl sm:text-4xl font-bold text-muted-foreground/60 tabular-nums transition-all duration-300">
                ${webtoonEarnings.toFixed(webtoonEarnings < 10 ? 2 : 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </div>

            <div className="p-5 rounded-xl border-2 border-primary/30 bg-primary/5">
              <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">On bibue.net</p>
              <p className="text-xs text-muted-foreground mb-3">{share}% revenue share</p>
              <p className="text-3xl sm:text-4xl font-bold text-primary tabular-nums transition-all duration-300">
                ${bibueEarnings.toFixed(bibueEarnings < 10 ? 2 : 0)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">per month</p>
            </div>
          </div>

          {/* Extra Earnings Highlight */}
          <div className="text-center p-4 rounded-xl bg-green-500/5 border border-green-500/20">
            <p className="text-sm text-muted-foreground mb-1">You earn extra on Bibue</p>
            <p className="text-2xl sm:text-3xl font-bold text-green-400 tabular-nums transition-all duration-300">
              +${extra.toFixed(extra < 10 ? 2 : 0)}/mo
            </p>
            <p className="text-xs text-green-400/80 mt-1">
              That's {webtoonEarnings > 0 ? `${(bibueEarnings / webtoonEarnings).toFixed(1)}×` : "∞"} more revenue
            </p>
          </div>

          <p className="text-xs text-muted-foreground mt-6 leading-relaxed">
            Webtoon Canvas pays creators ~$0.20–$0.45 per 1,000 views (average $0.25).
            bibue.net gives you {share}% of all ad + tip revenue — up to 3–4× more!
          </p>
        </CardContent>
      </Card>

      {/* Comparison Table */}
      <div className="mt-8 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs sm:text-sm">Views</th>
              <th className="text-center py-3 px-2 font-semibold text-muted-foreground text-xs sm:text-sm">Webtoon</th>
              <th className="text-center py-3 px-2 font-bold text-primary text-xs sm:text-sm">Bibue ({share}%)</th>
              <th className="text-center py-3 px-2 font-semibold text-green-400 text-xs sm:text-sm">Extra</th>
            </tr>
          </thead>
          <tbody>
            {COMPARISON_TABLE.map((row) => {
              const bEarnings = (row.views / 1000) * ((share / 100) * 1.0);
              const diff = bEarnings - row.webtoon;
              return (
                <tr key={row.views} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-2 font-medium text-sm">{formatK(row.views)}</td>
                  <td className="py-3 px-2 text-center text-muted-foreground text-sm">~${row.webtoon.toFixed(row.webtoon < 10 ? 2 : 0)}</td>
                  <td className="py-3 px-2 text-center font-semibold text-primary text-sm">~${bEarnings.toFixed(bEarnings < 10 ? 2 : 0)}</td>
                  <td className="py-3 px-2 text-center font-semibold text-green-400 text-sm">+${diff.toFixed(diff < 10 ? 2 : 0)}</td>
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

      {/* ─── Earnings Comparison Calculator ─── */}
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
              How Much Can You Earn?
            </h2>
            <p className="text-muted-foreground mt-2 text-sm">Slide to compare your earnings on Webtoon Canvas vs bibue.net</p>
          </div>
          <EarningsComparisonCalculator />
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <Quote className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Creator Voices</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Hear From Our Creators
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-border/50 bg-card">
                <CardContent className="p-5 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-10 h-10 rounded-full bg-secondary"
                    />
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.handle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">"{t.quote}"</p>
                  <p className="text-xs text-primary font-medium">Series: {t.series}</p>
                </CardContent>
              </Card>
            ))}
          </div>
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
                        <Check className="w-4 h-4 text-green-400" />
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
