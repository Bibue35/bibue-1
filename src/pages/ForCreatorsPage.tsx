import { useState } from "react";
import { Link } from "react-router-dom";
import bibueTower from "@/assets/bibue-tower.png";
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
    color: "cyan" as const,
  },
  {
    icon: Award,
    title: "Founding Creator Badge",
    description: "First 50 creators get a permanent badge and featured placement on the homepage — forever.",
    color: "gold" as const,
  },
  {
    icon: Zap,
    title: "Instant Publishing",
    description: "No long review queues for your first 100 uploads. Get your work in front of readers immediately.",
    color: "magenta" as const,
  },
  {
    icon: BarChart3,
    title: "Full Stats Dashboard",
    description: "Track views, likes, earnings, and reader retention for every series in real time.",
    color: "cyan" as const,
  },
  {
    icon: CreditCard,
    title: "Easy Monthly Payouts",
    description: "Get paid every month via Stripe or PayPal. No hidden fees, no hoops to jump through.",
    color: "gold" as const,
  },
  {
    icon: Headphones,
    title: "Priority Support",
    description: "Direct access to the team. Your feature requests actually get built — fast.",
    color: "magenta" as const,
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
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Yuki&backgroundColor=00f5ff",
    quote: "I uploaded my first chapter and had 2,000 reads in a week. The revenue share is insane compared to other platforms.",
    series: "Neon Ronin",
  },
  {
    name: "Carlos Mendez",
    handle: "@cmendezart",
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Carlos&backgroundColor=ff00aa",
    quote: "The instant publishing changed everything. No more waiting weeks for approval — my readers get chapters the day I finish them.",
    series: "Abyssal Tide",
  },
  {
    name: "Mina Park",
    handle: "@minapark_ink",
    avatar: "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Mina&backgroundColor=facc15",
    quote: "Bibue treats creators like partners, not content farms. I earned more in my first month here than 6 months on other platforms.",
    series: "Dreamweaver",
  },
];

const PERK_COLORS = {
  cyan: {
    icon: "text-neon-cyan",
    bg: "bg-neon-cyan/10",
    hoverBg: "group-hover:bg-neon-cyan/20",
    border: "hover:border-neon-cyan/40",
    glow: "hover:shadow-[0_0_30px_hsl(183,100%,50%,0.15)]",
  },
  magenta: {
    icon: "text-neon-magenta",
    bg: "bg-neon-magenta/10",
    hoverBg: "group-hover:bg-neon-magenta/20",
    border: "hover:border-neon-magenta/40",
    glow: "hover:shadow-[0_0_30px_hsl(320,100%,50%,0.15)]",
  },
  gold: {
    icon: "text-neon-gold",
    bg: "bg-neon-gold/10",
    hoverBg: "group-hover:bg-neon-gold/20",
    border: "hover:border-neon-gold/40",
    glow: "hover:shadow-[0_0_30px_hsl(48,96%,53%,0.15)]",
  },
};

function EarningsCalculator() {
  const [views, setViews] = useState([10000]);
  const viewCount = views[0];
  const cpm = 4.5; // $4.50 CPM
  const platformCut = 0.15;
  const earnings = Math.round((viewCount / 1000) * cpm * (1 - platformCut));

  return (
    <div className="max-w-xl mx-auto p-6 sm:p-8 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <Eye className="w-5 h-5 text-neon-cyan" />
        <h3 className="text-lg font-semibold">Earnings Calculator</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        If your series gets <strong className="text-neon-cyan">{viewCount.toLocaleString()}</strong> views/month:
      </p>
      <Slider
        value={views}
        onValueChange={setViews}
        min={1000}
        max={500000}
        step={1000}
        className="mb-6"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-6">
        <span>1K</span>
        <span>500K</span>
      </div>
      <div className="text-center p-6 rounded-xl bg-background/50 border border-neon-cyan/20">
        <p className="text-sm text-muted-foreground mb-1">Estimated monthly earnings</p>
        <p className="text-4xl sm:text-5xl font-bold text-neon-cyan">${earnings}</p>
        <p className="text-xs text-muted-foreground mt-2">Based on $4.50 CPM with 85% revenue share</p>
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
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <img
          src={creatorsHeroBg}
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          loading="eager"
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(183,100%,50%,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(320,100%,50%,0.08),transparent_60%)]" />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5 border-neon-gold/30">
            <Star className="w-3.5 h-3.5 fill-neon-gold text-neon-gold" />
            Limited — Only 50 Founding Creator spots
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sacred tracking-wide leading-tight mb-6">
            Turn Your Manga Into{" "}
            <span className="text-neon-cyan" style={{ textShadow: "0 0 40px hsl(183 100% 50% / 0.4)" }}>
              Money
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of creators earning from their original manga, manhwa &amp; manhua.
            Keep up to <strong className="text-neon-cyan">90% of revenue</strong> — the highest in the industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="cyan" className="gap-2 text-base px-8">
              <Link to="/creator/dashboard">
                <Upload className="w-5 h-5" />
                Start Uploading Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="magenta" className="gap-2 text-base px-8">
              <a href="#perks">
                Learn More
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Perks Grid ─── */}
      <section id="perks" className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 border-neon-cyan/30">
              <Sparkles className="w-3 h-3 mr-1 text-neon-cyan" />
              Why Bibue?
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              Everything You Need to{" "}
              <span className="text-neon-cyan">Succeed</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((perk, i) => {
              const colors = PERK_COLORS[perk.color];
              return (
                <Card
                  key={i}
                  className={cn(
                    "group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1",
                    colors.border,
                    colors.glow
                  )}
                >
                  <CardContent className="p-6 flex flex-col gap-4">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", colors.bg, colors.hoverBg)}>
                      <perk.icon className={cn("w-6 h-6", colors.icon)} />
                    </div>
                    <h3 className="text-lg font-semibold">{perk.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{perk.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Earnings Calculator ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              How Much Could You <span className="text-neon-gold">Earn</span>?
            </h2>
            <p className="text-muted-foreground mt-3">Drag the slider to estimate your monthly earnings</p>
          </div>
          <EarningsCalculator />
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 border-neon-magenta/30">
              <Quote className="w-3 h-3 mr-1 text-neon-magenta" />
              Creator Voices
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              Hear From Our <span className="text-neon-magenta">Creators</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col gap-4">
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
                  <p className="text-xs text-neon-cyan font-medium">Series: {t.series}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Comparison Table ─── */}
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4 border-neon-cyan/30">Platform Comparison</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              See How We <span className="text-neon-cyan">Compare</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-3 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-3 font-bold text-neon-cyan">Bibue</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Webtoon Canvas</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Tapas</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-3 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-neon-cyan font-semibold">
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
      <section className="py-20 sm:py-28">
        <div className="container mx-auto px-4">
          <Card className="max-w-3xl mx-auto border-neon-cyan/20 bg-gradient-to-br from-neon-cyan/5 via-card to-neon-magenta/5 overflow-hidden relative">
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-neon-cyan/20 animate-pulse" />
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold font-sacred mb-4">
                Ready to Become a{" "}
                <span className="text-neon-gold">Founding Creator</span>?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Upload your first chapter in under 5 minutes. No complicated setup — just your art and your story.
              </p>
              <Button asChild size="lg" variant="cyan" className="gap-2 text-base px-8">
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
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-5 py-3 rounded-full bg-neon-cyan text-[hsl(0,0%,4%)] font-semibold shadow-lg shadow-neon-cyan/30 hover:shadow-neon-cyan/50 hover:scale-105 transition-all duration-200"
      >
        <Upload className="w-4 h-4" />
        Upload Now
      </Link>

      <Footer />
    </div>
  );
}
