import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useBridgeCredits";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const FEATURES = [
  "Unlimited access to all licensed and bridged titles",
  "15 Bridge Credits every month to vote on new stories",
  "Cancel anytime — no hidden fees, no tiers",
];

export default function SubscribePage() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const isSubscribed = !!subscription;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Subscribe to Bibue — $8.99/mo"
        description="Unlimited manga reading and 15 Bridge Credits every month. Cancel anytime."
        url="/subscribe"
      />
      <CollapsibleNavbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-lg">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-sacred font-bold tracking-wide mb-2">
              Subscribe to Bibue
            </h1>
            <p className="text-5xl sm:text-6xl font-bold text-foreground mt-6 mb-1">
              $8.99
            </p>
            <p className="text-muted-foreground text-sm tracking-wide">
              per month
            </p>
          </div>

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
            Cancel anytime. No hidden fees. No tiers.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
