import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import bibueIcon from "@/assets/bibue-tower.png";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useBridgeCredits";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const FEATURES = [
  "Unlimited access to all licensed and bridged titles",
  "15 Bridge Credits every month to vote on new stories",
  "Cancel anytime — no hidden fees",
];

const MONTHLY_RATE = 8.99;

const PLANS = [
  {
    key: "monthly",
    label: "Monthly",
    price: MONTHLY_RATE,
    months: 1,
    period: "/ month",
    tagline: "Perfect for quickly finishing a series.",
  },
  {
    key: "quarterly",
    label: "Quarterly",
    price: MONTHLY_RATE * 3,
    months: 3,
    period: "/ 3 months",
    tagline: "Best when you want one full season of reading.",
  },
  {
    key: "annual",
    label: "Annual",
    price: MONTHLY_RATE * 12,
    months: 12,
    period: "/ year",
    tagline: "Great if you want all 4 quarters covered.",
  },
] as const;

export default function SubscribePage() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const isSubscribed = !!subscription;
  const [selected, setSelected] = useState<string>("monthly");

  const plan = PLANS.find((p) => p.key === selected)!;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Subscribe to Bibue"
        description="Unlimited manga reading and 15 Bridge Credits every month. Cancel anytime."
        url="/subscribe"
      />
      <CollapsibleNavbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl sm:text-4xl font-sacred font-bold tracking-wide mb-2">
              Subscribe to Bibue
            </h1>
          </div>

          {/* Plan toggle */}
          <div className="flex gap-1.5 p-1.5 rounded-xl bg-muted/50 mb-8">
            {PLANS.map((p) => (
              <button
                key={p.key}
                onClick={() => setSelected(p.key)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  selected === p.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Price display */}
          <div className="text-center mb-2">
            <p className="text-5xl sm:text-6xl font-bold text-foreground mb-1 tabular-nums transition-all duration-200">
              ${plan.price.toFixed(2)}
            </p>
            <p className="text-muted-foreground text-sm tracking-wide">
              {plan.period}
            </p>
            {plan.months > 1 && (
              <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                Same rate: ${MONTHLY_RATE.toFixed(2)}/mo billed upfront
              </p>
            )}
          </div>

          {/* Tagline */}
          <p className="text-center text-sm text-muted-foreground mb-10 min-h-[2.5rem] transition-all duration-200">
            {plan.tagline}
          </p>

          {/* Features */}
          <ul className="space-y-4 mb-10">
            {FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-3 text-sm sm:text-base text-foreground/90">
                <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          {isSubscribed ? (
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You're subscribed. Thank you for supporting Bibue.
              </p>
              <Link to="/bridge">
                <Button variant="outline" className="w-full">
                  Go to Bridge Voting
                </Button>
              </Link>
            </div>
          ) : (
            <div className="text-center">
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Sign in to subscribe.
                </p>
              ) : (
                <Button className="w-full h-12 text-base font-medium" disabled>
                  Subscribe — Coming Soon
                </Button>
              )}
            </div>
          )}

          {/* Fine print */}
          <p className="text-center text-[11px] text-muted-foreground/60 mt-6">
            Cancel anytime. No hidden fees.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
