import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
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
  X,
  Sparkles,
  Upload,
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

const TESTIMONIALS = [
  {
    quote: "Finally a platform that actually pays indie creators! I made more in my first month here than six months elsewhere.",
    author: "@MangaRise",
    role: "Founding Creator",
  },
  {
    quote: "The instant publishing changed everything. No more waiting weeks for approval — my readers get chapters the moment they're ready.",
    author: "@InkStormArt",
    role: "Manhwa Artist",
  },
  {
    quote: "The stats dashboard is insane. I can see exactly what readers love and tailor my story accordingly.",
    author: "@DrawDreamRepeat",
    role: "Manga Creator",
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

export default function ForCreatorsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Creators | bibue.net — Turn Your Passion into Profit"
        description="Join bibue.net and earn 80-90% revenue from your original manga, manhwa & manhua. Instant publishing, full stats, and monthly payouts."
      />
      <CollapsibleNavbar />

      {/* ─── Hero ─── */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-primary/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,hsl(var(--primary)/0.1),transparent_60%)]" />

        {/* Floating sparkle accents */}
        <Sparkles className="absolute top-[15%] left-[10%] w-6 h-6 text-primary/30 animate-pulse" />
        <Sparkles className="absolute top-[25%] right-[15%] w-8 h-8 text-primary/20 animate-pulse delay-300" />
        <Sparkles className="absolute bottom-[30%] left-[20%] w-5 h-5 text-primary/25 animate-pulse delay-700" />

        <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5">
            <Star className="w-3.5 h-3.5 fill-primary text-primary" />
            Limited — Only 50 Founding Creator spots
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-sacred tracking-wide leading-tight mb-6">
            Turn Your Passion into{" "}
            <span className="text-primary">Profit</span> on bibue.net
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Join thousands of creators earning from their original manga, manhwa &amp; manhua.
            Keep up to <strong className="text-foreground">90% of revenue</strong> — the highest in the industry.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" variant="primary" className="gap-2 text-base px-8 shadow-lg">
              <Link to="/creator/dashboard">
                <Upload className="w-5 h-5" />
                Start Uploading Now
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
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
            <Badge variant="secondary" className="mb-4">Why bibue.net?</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              Everything You Need to <span className="text-primary">Succeed</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {PERKS.map((perk, i) => (
              <Card
                key={i}
                className={cn(
                  "group border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1",
                  i === 0 && "sm:col-span-2 lg:col-span-1"
                )}
              >
                <CardContent className="p-6 flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <perk.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{perk.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{perk.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="py-20 sm:py-28 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <Badge variant="secondary" className="mb-4">Creator Voices</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              Hear from Our <span className="text-primary">Creators</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {TESTIMONIALS.map((t, i) => (
              <Card key={i} className="border-border/50 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6 flex flex-col gap-4">
                  <Quote className="w-8 h-8 text-primary/30" />
                  <p className="text-sm leading-relaxed italic text-muted-foreground">"{t.quote}"</p>
                  <div className="mt-auto pt-4 border-t border-border/50">
                    <p className="font-semibold text-sm">{t.author}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
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
            <Badge variant="secondary" className="mb-4">Platform Comparison</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold font-sacred">
              See How We <span className="text-primary">Compare</span>
            </h2>
          </div>

          <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 px-3 font-semibold text-muted-foreground">Feature</th>
                  <th className="text-center py-4 px-3 font-bold text-primary">bibue.net</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Webtoon Canvas</th>
                  <th className="text-center py-4 px-3 font-semibold text-muted-foreground">Tapas</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((row, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-3 font-medium">{row.feature}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 text-primary font-semibold">
                        <Check className="w-4 h-4" />
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
          <Card className="max-w-3xl mx-auto border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 overflow-hidden relative">
            <Sparkles className="absolute top-6 right-6 w-8 h-8 text-primary/20 animate-pulse" />
            <CardContent className="p-8 sm:p-12 text-center">
              <h2 className="text-2xl sm:text-3xl font-bold font-sacred mb-4">
                Ready to Become a <span className="text-primary">Founding Creator</span>?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                Upload your first chapter in under 5 minutes. No complicated setup — just your art and your story.
              </p>
              <Button asChild size="lg" variant="primary" className="gap-2 text-base px-8 shadow-lg">
                <Link to="/creator/dashboard">
                  <Upload className="w-5 h-5" />
                  Start Creating Today
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
}
