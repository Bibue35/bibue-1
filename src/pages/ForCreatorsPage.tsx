import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
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
  BarChart3,
  CreditCard,
  Upload,
  Eye,
  Check,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Ban,
  Skull,
  Paintbrush,
  AlertTriangle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── Earnings Calculator ─── */

const COMPARISON_TABLE = [
  { views: 10000 },
  { views: 100000 },
  { views: 500000 },
  { views: 1000000 },
];

function EarningsCalculator() {
  const [views, setViews] = useState([100000]);
  const [isBonus, setIsBonus] = useState(true);
  const viewCount = views[0];
  const sharePercent = isBonus ? 80 : 75;

  // Simplified: assume $1 CPM net after platform costs
  const netCpm = 1.0;
  const bibueEarnings = (viewCount / 1000) * netCpm * (sharePercent / 100);

  const formatK = (n: number) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(n % 1000000 === 0 ? 0 : 1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
    return n.toString();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/50 bg-card">
        <CardContent className="p-6 sm:p-8 space-y-8">
          {/* Explanation */}
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>
              bibue.net first covers hosting, maintenance, payment processing and all platform costs.
              Creators then receive <strong className="text-foreground">75% of the remaining net revenue</strong> from ads and tips.
            </p>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-sm">
                <strong className="text-primary">+5% Founding Bonus:</strong> For your first 6 months you get an extra 5% (80% total).
                This bonus can continue longer or increase based on your series performance.
              </p>
            </div>
          </div>

          {/* Views Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                Monthly Page Views
              </label>
              <span className="text-lg font-bold text-primary tabular-nums">{viewCount.toLocaleString()}</span>
            </div>
            <Slider value={views} onValueChange={setViews} min={10000} max={1000000} step={10000} className="mb-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>10K</span>
              <span>1M</span>
            </div>
          </div>

          {/* Bonus toggle */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Revenue tier:</span>
            <div className="flex gap-1.5">
              {[
                { label: "75% (Standard)", value: false },
                { label: "80% (Founding Bonus)", value: true },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => setIsBonus(opt.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200",
                    isBonus === opt.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground hover:text-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Result */}
          <div className="text-center p-6 rounded-2xl bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground mb-2">Your estimated monthly earnings</p>
            <p className="text-4xl sm:text-5xl font-bold text-primary tabular-nums transition-all duration-300">
              ${bibueEarnings.toFixed(bibueEarnings < 10 ? 2 : 0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">at {sharePercent}% of net revenue</p>
          </div>

          {/* Quick comparison table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-semibold text-muted-foreground text-xs">Views/mo</th>
                  <th className="text-center py-3 px-2 font-bold text-primary text-xs">Bibue ({sharePercent}%)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_TABLE.map((row) => {
                  const earnings = (row.views / 1000) * netCpm * (sharePercent / 100);
                  return (
                    <tr key={row.views} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-2 font-medium text-sm">{formatK(row.views)}</td>
                      <td className="py-3 px-2 text-center font-semibold text-primary text-sm">~${earnings.toFixed(earnings < 10 ? 2 : 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Content Guidelines ─── */

const GUIDELINES = [
  { icon: Check, text: "All work must be 100% original — you own the rights", positive: true },
  { icon: Ban, text: "No sexual content of any kind (including nudity, explicit scenes, or sexual themes)", positive: false },
  { icon: Skull, text: "Gore, violence, horror, dark themes and mature storytelling are welcome and encouraged", positive: true },
  { icon: Paintbrush, text: "No AI-generated art or writing", positive: false },
  { icon: AlertTriangle, text: "No hate speech, real-person content, or illegal material", positive: false },
];

/* ─── Perks ─── */

const PERKS = [
  {
    icon: DollarSign,
    title: "75% Net Revenue",
    description: "Earn from ads and tips after platform costs. Plus a 5% founding bonus for your first 6 months.",
  },
  {
    icon: Award,
    title: "Founding Creator Badge",
    description: "Early creators get a permanent badge and featured placement on the homepage — forever.",
  },
  {
    icon: BarChart3,
    title: "Full Analytics Dashboard",
    description: "Track views, likes, earnings, and reader retention for every series in real time.",
  },
  {
    icon: CreditCard,
    title: "Monthly Payouts",
    description: "Get paid every month. No hidden fees, no hoops to jump through.",
  },
];

/* ─── Page ─── */

export default function ForCreatorsPage() {
  const [searchParams] = useSearchParams();

  // Store referral code in localStorage when arriving via ?ref=
  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("bibue_referral_code", ref);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="For Creators | Bibue — Publish Your Original Manga"
        description="Create and publish your original manga, manhwa & manhua on bibue.net. Keep 75% of net revenue with a 5% founding bonus."
      />
      <CollapsibleNavbar />

      {/* ─── Hero ─── */}
      <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5">
            <Award className="w-3.5 h-3.5 text-primary" />
            Founding Creator Spots Available
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Create Your Manga,{" "}
            <span className="text-primary">Manhwa or Manhua</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4 leading-relaxed">
            Keep <strong className="text-foreground">75% of net revenue</strong> after platform costs.
          </p>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-10">
            Founding creators get an extra 5% bonus (80% total) for their first 6 months.
          </p>

          <Button asChild size="lg" className="gap-2 text-base px-10">
            <Link to="/creator/dashboard">
              <Upload className="w-5 h-5" />
              Start Uploading
            </Link>
          </Button>
        </div>
      </section>

      {/* ─── Perks ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PERKS.map((perk, i) => (
              <Card key={i} className="group border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-6 flex flex-col gap-3">
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

      {/* ─── Earnings Calculator ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Earnings Estimator</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How Much Can You Earn?
            </h2>
          </div>
          <EarningsCalculator />
        </div>
      </section>

      {/* ─── Content Guidelines ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="p-1.5 rounded-xl bg-primary/10">
                <ShieldCheck className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-muted-foreground">Content Policy</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Submission Rules
            </h2>
          </div>

          <Card className="border-border/50 bg-card">
            <CardContent className="p-6 sm:p-8 space-y-4">
              {GUIDELINES.map((g, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    g.positive ? "bg-primary/10" : "bg-destructive/10"
                  )}>
                    <g.icon className={cn("w-4 h-4", g.positive ? "text-primary" : "text-destructive")} />
                  </div>
                  <p className="text-sm leading-relaxed">{g.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Referral Section ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 max-w-2xl">
          <Card className="border-border/50 bg-card">
            <CardContent className="p-6 sm:p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Bring Your Friends</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Both of you earn extra. When a referred creator uploads their first series, you both get <strong className="text-foreground">+5% revenue share for 30 days</strong>.
              </p>
              <div className="p-4 rounded-xl bg-muted/30 text-sm text-muted-foreground">
                Invite 3 friends who upload = up to <strong className="text-foreground">15% extra revenue</strong> for a month
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link to="/creator/dashboard">
                  Get Your Referral Link <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto border-primary/10 bg-card overflow-hidden">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Award className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-4">
                Ready to Start?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Upload your first chapter in under 5 minutes. Your art, your story, your revenue.
              </p>
              <Button asChild size="lg" className="gap-2 text-base px-10">
                <Link to="/creator/dashboard">
                  <Upload className="w-5 h-5" />
                  Start Uploading
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
