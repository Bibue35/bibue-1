import { useState } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralCode, useMyReferrals, useReferralLeaderboard, useMyCoins, getReferralTier, FOUNDER_TIERS } from "@/hooks/useReferral";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HOW_IT_WORKS = [
  { step: "01", title: "Get Your Founder Link", desc: "Sign up and receive your unique BIBUE-FOUNDER code" },
  { step: "02", title: "Share It", desc: "Send your link to friends, creators, or communities" },
  { step: "03", title: "They Join", desc: "Friends sign up using your referral link" },
  { step: "04", title: "Both Earn", desc: "You both receive 1,000 coins instantly" },
  { step: "05", title: "Climb Tiers", desc: "Unlock Launch Phase rewards and lifetime perks" },
];

const SHARE_PLATFORMS = ["X", "WhatsApp", "Discord", "Email"];

const ReferAndEarnPage = () => {
  const { user } = useAuth();
  const { data: referralCode } = useReferralCode();
  const { data: myReferrals } = useMyReferrals();
  const { data: myCoins } = useMyCoins();
  const [leaderboardTab, setLeaderboardTab] = useState<"monthly" | "alltime">("monthly");
  const { data: leaderboard } = useReferralLeaderboard(leaderboardTab);
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode ? `bibue.net/crew/${referralCode}` : "";
  const totalReferrals = myReferrals?.referrals?.length || 0;
  const currentTier = getReferralTier(totalReferrals);
  const nextTier = FOUNDER_TIERS.find(t => t.threshold > totalReferrals);

  const shareMessage = `Join Bibue with my link — we both get 1,000 coins https://${referralLink}`;

  const getShareUrl = (platform: string) => {
    switch (platform) {
      case "X": return `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`;
      case "WhatsApp": return `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;
      case "Discord": return `https://discord.com`;
      case "Email": return `mailto:?subject=${encodeURIComponent("Join Bibue")}&body=${encodeURIComponent(shareMessage)}`;
      default: return "#";
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO
        title="Bibue Crew — Refer & Earn"
        description="Join the Founder Crew. Refer friends and creators. Earn coins, badges, and lifetime perks."
        url="/refer"
      />
      <CollapsibleNavbar />
      <main className="min-h-screen bg-background">

        {/* ── HERO ── */}
        <section className="pt-32 sm:pt-40 pb-20 sm:pb-28">
          <div className="container mx-auto px-4 max-w-3xl">
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
              Launch Phase — Limited Time
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-sacred font-bold tracking-wide leading-[1.1] mb-6">
              Bibue Crew
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Refer friends and creators. Earn the highest rewards we'll ever offer.
            </p>

            {user && referralCode ? (
              <div className="mt-12">
                {/* Code display */}
                <div className="flex items-center gap-3 max-w-md">
                  <div className="flex-1 border border-border rounded-lg px-4 py-3 font-mono text-sm sm:text-base tracking-widest text-foreground">
                    {referralCode}
                  </div>
                  <button
                    onClick={copyLink}
                    className="shrink-0 border border-border rounded-lg px-4 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground/60 mt-2">
                  bibue.net/crew/{referralCode}
                </p>

                {/* Share row */}
                <div className="flex flex-wrap gap-2 mt-5">
                  {SHARE_PLATFORMS.map(p => (
                    <a
                      key={p}
                      href={getShareUrl(p)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {p}
                    </a>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-12 text-sm text-muted-foreground">
                Sign in to get your Founder link.
              </p>
            )}
          </div>
        </section>

        {/* ── REWARD TIERS ── */}
        <section className="pb-24 sm:pb-32">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-10">
              Launch Phase Tiers
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/30 border border-border/30 rounded-lg overflow-hidden">
              {FOUNDER_TIERS.map((tier) => {
                const achieved = totalReferrals >= tier.threshold;
                return (
                  <div
                    key={tier.name}
                    className={cn(
                      "bg-background p-6 sm:p-7 flex flex-col",
                      achieved && "bg-accent/30"
                    )}
                  >
                    <div className="flex items-baseline justify-between mb-4">
                      <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {tier.threshold}+ referrals
                      </span>
                      {achieved && (
                        <span className="text-[10px] uppercase tracking-widest text-primary">
                          Unlocked
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-sacred font-bold mb-4">
                      {tier.name.replace(" Crew", "")}
                    </h3>

                    <ul className="space-y-2 text-sm text-muted-foreground flex-1">
                      <li>{tier.coins.toLocaleString()} coins</li>
                      <li>{tier.badge}</li>
                      {tier.premium && <li>{tier.premium}</li>}
                      {tier.extra && <li className="text-xs">{tier.extra}</li>}
                    </ul>

                    {!achieved && (
                      <div className="mt-5">
                        <div className="h-px bg-border relative overflow-hidden">
                          <div
                            className="absolute inset-y-0 left-0 bg-foreground/30 transition-all duration-700"
                            style={{ width: `${Math.min(100, (totalReferrals / tier.threshold) * 100)}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground/50 mt-1.5">
                          {totalReferrals}/{tier.threshold}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── TWO TRACKS ── */}
        <section className="pb-24 sm:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-10">
              Reward Tracks
            </h2>

            <div className="grid md:grid-cols-2 gap-px bg-border/30 border border-border/30 rounded-lg overflow-hidden">
              {/* Reader */}
              <div className="bg-background p-7 sm:p-9">
                <h3 className="text-lg font-sacred font-bold mb-1">Reader Track</h3>
                <p className="text-xs text-muted-foreground mb-6">Earn when friends read</p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>1,000 coins on sign-up</li>
                  <li>+500 at 5 chapters read</li>
                  <li>+1,000 on first coin purchase</li>
                </ul>
                <p className="text-xs text-muted-foreground/50 mt-6">
                  Your friend also gets 1,000 coins.
                </p>
              </div>

              {/* Creator */}
              <div className="bg-background p-7 sm:p-9">
                <h3 className="text-lg font-sacred font-bold mb-1">Creator Track</h3>
                <p className="text-xs text-muted-foreground mb-6">Refer Studio creators</p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>2,000 coins on approval</li>
                  <li>+15% of their earnings for 3 months</li>
                  <li>"Creator Scout" badge</li>
                </ul>
                <p className="text-xs text-muted-foreground/50 mt-6">
                  New creator gets +5% bonus on top of 80%.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── DASHBOARD ── */}
        {user && (
          <section className="pb-24 sm:pb-32">
            <div className="container mx-auto px-4 max-w-3xl">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-10">
                Your Dashboard
              </h2>

              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/30 border border-border/30 rounded-lg overflow-hidden mb-8">
                <StatCell label="Referred" value={totalReferrals} />
                <StatCell label="Coins Earned" value={myReferrals?.totalCoins || 0} />
                <StatCell label="Readers" value={myReferrals?.readerCount || 0} />
                <StatCell label="Creators" value={myReferrals?.creatorCount || 0} />
              </div>

              {/* Tier progress */}
              <div className="border border-border/30 rounded-lg p-5 mb-8">
                <div className="flex items-baseline justify-between mb-3">
                  <div>
                    <span className="text-sm font-medium">{currentTier.name}</span>
                    {nextTier && (
                      <span className="text-xs text-muted-foreground ml-2">
                        → {nextTier.threshold - totalReferrals} to {nextTier.name.replace(" Crew", "")}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {myCoins?.balance?.toLocaleString() || 0} coins
                  </span>
                </div>
                {nextTier && (
                  <div className="h-px bg-border relative overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 bg-foreground/40 transition-all duration-700"
                      style={{ width: `${Math.min(100, (totalReferrals / nextTier.threshold) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Recent referrals */}
              {myReferrals?.referrals && myReferrals.referrals.length > 0 && (
                <div className="border border-border/30 rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-border/20">
                    <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                      Recent — {myReferrals.referrals.length} total
                    </span>
                  </div>
                  <div className="divide-y divide-border/10">
                    {myReferrals.referrals.slice(0, 8).map((ref) => (
                      <div key={ref.id} className="px-5 py-3 flex items-center justify-between">
                        <span className="text-sm text-muted-foreground capitalize">
                          {ref.status.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="text-foreground font-medium">+{ref.coins_earned}</span>
                          <span className="text-xs text-muted-foreground/50">
                            {new Date(ref.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── LEADERBOARD ── */}
        <section className="pb-24 sm:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
                Founder Leaderboard
              </h2>
              <div className="flex gap-1">
                {(["monthly", "alltime"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setLeaderboardTab(tab)}
                    className={cn(
                      "px-3.5 py-1.5 text-xs uppercase tracking-wider transition-colors rounded-md",
                      leaderboardTab === tab
                        ? "bg-foreground/8 text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "monthly" ? "Month" : "All Time"}
                  </button>
                ))}
              </div>
            </div>

            <div className="border border-border/30 rounded-lg overflow-hidden">
              {leaderboard && leaderboard.length > 0 ? (
                <div className="divide-y divide-border/10">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className="px-5 py-3.5 flex items-center gap-4">
                      <span className={cn(
                        "w-6 text-xs text-right tabular-nums",
                        index < 3 ? "text-foreground font-medium" : "text-muted-foreground/50"
                      )}>
                        {index + 1}
                      </span>
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="text-[10px] bg-muted">
                          {(entry.username || "U")[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {entry.display_name || entry.username}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {leaderboardTab === "monthly" ? entry.monthly_referrals : entry.total_referrals} ref
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {(leaderboardTab === "monthly" ? entry.monthly_coins : entry.total_coins).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-16 text-center">
                  <p className="text-sm text-muted-foreground">No referrals yet.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="pb-24 sm:pb-32">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-10">
              How It Works
            </h2>

            <div className="space-y-0 border border-border/30 rounded-lg overflow-hidden divide-y divide-border/10">
              {HOW_IT_WORKS.map((step) => (
                <div key={step.step} className="flex items-start gap-6 px-6 py-5">
                  <span className="text-xs text-muted-foreground/40 font-mono tabular-nums pt-0.5">
                    {step.step}
                  </span>
                  <div>
                    <h3 className="text-sm font-medium mb-0.5">{step.title}</h3>
                    <p className="text-xs text-muted-foreground">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TRUST LINE ── */}
        <section className="pb-10">
          <div className="container mx-auto px-4 text-center">
            <p className="text-[11px] text-muted-foreground/40 tracking-wide">
              Email verification required · Anti-fraud protected · Automatic coin distribution
            </p>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        {!user && (
          <section className="pb-24 sm:pb-32">
            <div className="container mx-auto px-4 max-w-lg text-center">
              <h2 className="text-2xl sm:text-3xl font-sacred font-bold mb-3">
                Join the Founder Crew
              </h2>
              <p className="text-sm text-muted-foreground mb-8">
                These Launch Phase rewards won't last. Sign in to get started.
              </p>
            </div>
          </section>
        )}

        <Footer />
      </main>
    </>
  );
};

function StatCell({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-background p-5 text-center">
      <div className="text-xl sm:text-2xl font-medium tabular-nums">{value.toLocaleString()}</div>
      <div className="text-[11px] text-muted-foreground/60 uppercase tracking-wider mt-1">{label}</div>
    </div>
  );
}

export default ReferAndEarnPage;
