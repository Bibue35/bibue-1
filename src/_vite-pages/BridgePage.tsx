import { useState } from "react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import {
  useBridgeCredits,
  useBridgeTitles,
  useMyBridgeVotes,
  useSpendCredit,
  useSubscription,
} from "@/hooks/useBridgeCredits";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const CREDITS_GOAL = 50000;
const VOTERS_GOAL = 3000;

export default function BridgePage() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const { data: credits } = useBridgeCredits();
  const { data: titles } = useBridgeTitles();
  const { data: myVotes } = useMyBridgeVotes();
  const spendCredit = useSpendCredit();
  const [justVoted, setJustVoted] = useState<string | null>(null);
  const [pulsing, setPulsing] = useState<string | null>(null);

  const isSubscribed = !!subscription;
  const creditsRemaining = credits?.credits_remaining ?? 0;

  const daysUntilReset = (() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  })();

  const handleVote = async (titleId: string) => {
    if (spendCredit.isPending) return;
    try {
      await spendCredit.mutateAsync(titleId);
      setJustVoted(titleId);
      setPulsing(titleId);
      setTimeout(() => setJustVoted(null), 1200);
      setTimeout(() => setPulsing(null), 800);
    } catch {
      // error handled by mutation
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Bridge Voting — Bibue"
        description="Use your Bridge Credits to vote for unlicensed titles to be translated and released globally."
        url="/bridge"
      />
      <CollapsibleNavbar />

      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-2xl sm:text-3xl font-sacred font-bold tracking-wide mb-2">
              Bridge Voting
            </h1>
            <p className="text-sm text-muted-foreground max-w-md">
              Vote on unlicensed titles for translation &amp; global release.
              A title is bridged at 50,000 credits from 3,000+ unique voters.
            </p>
          </div>

          {/* Credits Dashboard */}
          {isSubscribed && credits ? (
            <div className="border border-border rounded-lg p-5 mb-10">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Your Bridge Credits
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Resets in {daysUntilReset} day{daysUntilReset !== 1 ? "s" : ""}
                </p>
              </div>
              <p className="text-4xl font-bold text-foreground">
                {creditsRemaining}
                <span className="text-base font-normal text-muted-foreground ml-1.5">
                  remaining this month
                </span>
              </p>
            </div>
          ) : (
            <div className="border border-border rounded-lg p-5 mb-10 text-center">
              <p className="text-sm text-muted-foreground mb-3">
                {user
                  ? "Subscribe to receive 15 Bridge Credits each month."
                  : "Sign in and subscribe to start voting."}
              </p>
              {user && (
                <Link to="/subscribe">
                  <Button variant="outline" size="sm">
                    Subscribe — $8.99/mo
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Titles List */}
          <div className="space-y-4">
            {(!titles || titles.length === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-12">
                No titles available for voting yet.
              </p>
            ) : (
              titles.map((title) => {
                const creditsPct = Math.min((title.total_credits / CREDITS_GOAL) * 100, 100);
                const votersPct = Math.min((title.unique_voters / VOTERS_GOAL) * 100, 100);
                const isBridged = title.status === "bridged";
                const hasVotedThisMonth = myVotes?.has(title.id) ?? false;

                return (
                  <div
                    key={title.id}
                    className="border border-border rounded-lg p-4 sm:p-5"
                  >
                    <div className="flex gap-4">
                      {title.cover_image_url && (
                        <img
                          src={title.cover_image_url}
                          alt={title.title}
                          className="w-16 h-22 object-cover rounded shrink-0"
                          loading="lazy"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-sm sm:text-base truncate">
                            {title.title}
                          </h3>
                          {isBridged && (
                            <span className="text-[10px] uppercase tracking-widest text-primary shrink-0">
                              Bridged
                            </span>
                          )}
                        </div>
                        {title.author && (
                          <p className="text-xs text-muted-foreground mb-2">
                            {title.author}
                          </p>
                        )}
                        {title.description && (
                          <p className="text-xs text-muted-foreground/80 line-clamp-2 mb-3">
                            {title.description}
                          </p>
                        )}

                        {/* Progress */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
                              <span>{title.total_credits.toLocaleString()} credits</span>
                              <span>{CREDITS_GOAL.toLocaleString()} goal</span>
                            </div>
                            <Progress
                              value={creditsPct}
                              className={cn(
                                "h-2 transition-all",
                                pulsing === title.id && "animate-bridge-pulse"
                              )}
                            />
                          </div>
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>{title.unique_voters.toLocaleString()} voters</span>
                            <span>{VOTERS_GOAL.toLocaleString()} needed</span>
                          </div>
                        </div>

                        {/* Vote button */}
                        {!isBridged && isSubscribed && (
                          <div className="mt-3 relative">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={creditsRemaining < 1 || spendCredit.isPending}
                              onClick={() => handleVote(title.id)}
                              className="text-xs"
                            >
                              Spend 1 Credit
                            </Button>
                            {/* Subtle fly-out feedback */}
                            {justVoted === title.id && (
                              <span className="absolute left-28 top-1/2 -translate-y-1/2 text-xs text-muted-foreground animate-vote-flyout">
                                +1 Vote added
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
