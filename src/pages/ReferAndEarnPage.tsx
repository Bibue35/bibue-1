import { useState } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralCode, useMyReferrals, useReferralLeaderboard, useMyCoins, getReferralTier } from "@/hooks/useReferral";
import { Copy, Check, Share2, QrCode, Gift, Users, Trophy, Zap, TrendingUp, Star, Crown, BookOpen, Upload, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const REWARD_TIERS = [
  { name: "Bronze", emoji: "🥉", threshold: 5, coins: 1000, badge: "Crew Member", premium: null, extra: null, gradient: "from-amber-700/20 to-amber-900/20", border: "border-amber-700/30", text: "text-amber-500" },
  { name: "Silver", emoji: "🥈", threshold: 15, coins: 3000, badge: "Silver Recruiter", premium: "14 days Premium", extra: "Special reading frame", gradient: "from-gray-400/20 to-gray-600/20", border: "border-gray-400/30", text: "text-gray-300" },
  { name: "Gold", emoji: "🥇", threshold: 40, coins: 8000, badge: "Gold Ambassador", premium: "60 days Premium", extra: "Featured on Originals", gradient: "from-yellow-500/20 to-amber-600/20", border: "border-yellow-500/30", text: "text-yellow-400" },
  { name: "Diamond", emoji: "💎", threshold: 100, coins: 20000, badge: "Diamond Legend", premium: "Lifetime Premium", extra: "+2% creator revenue forever", gradient: "from-cyan-400/20 to-blue-600/20", border: "border-cyan-400/30", text: "text-cyan-400" },
];

const HOW_IT_WORKS = [
  { step: 1, icon: Share2, title: "Share Your Link", desc: "Copy your unique code & share everywhere" },
  { step: 2, icon: Users, title: "Friend Signs Up", desc: "They create an account with your code" },
  { step: 3, icon: BookOpen, title: "They Read or Publish", desc: "Friend reads 5+ chapters or publishes" },
  { step: 4, icon: Gift, title: "Both Get Rewarded", desc: "You both earn coins instantly" },
  { step: 5, icon: Trophy, title: "Climb the Ranks", desc: "Unlock tiers & top the leaderboard" },
];

const ReferAndEarnPage = () => {
  const { user } = useAuth();
  const { data: referralCode } = useReferralCode();
  const { data: myReferrals } = useMyReferrals();
  const { data: myCoins } = useMyCoins();
  const [leaderboardTab, setLeaderboardTab] = useState<"monthly" | "alltime">("monthly");
  const { data: leaderboard } = useReferralLeaderboard(leaderboardTab);
  const [copied, setCopied] = useState(false);

  const referralLink = referralCode ? `bibue.net/ref/${referralCode}` : "";
  const totalReferrals = myReferrals?.referrals?.length || 0;
  const currentTier = getReferralTier(totalReferrals);
  const nextTier = REWARD_TIERS.find(t => t.threshold > totalReferrals);

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    toast.success("Referral link copied!");
  };

  const shareMessage = `I just found the best new manga platform — join with my code for 500 free coins! 🔥 https://${referralLink}`;

  const shareLinks = [
    { name: "X", url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}`, color: "hover:bg-foreground/10" },
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}`, color: "hover:bg-green-500/10" },
    { name: "Discord", url: `https://discord.com`, color: "hover:bg-indigo-500/10" },
    { name: "Email", url: `mailto:?subject=${encodeURIComponent("Join Bibue!")}&body=${encodeURIComponent(shareMessage)}`, color: "hover:bg-blue-500/10" },
  ];

  return (
    <>
      <SEO
        title="Refer & Earn — Bibue Crew"
        description="Invite friends to Bibue and earn up to 20,000 coins, Premium months, and creator bonuses. The more you share, the more you win."
        url="/refer"
      />
      <CollapsibleNavbar />
      <main className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative pt-24 sm:pt-32 pb-16 sm:pb-24 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/10 via-background to-background" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-3xl" />
          <div className="absolute top-40 right-1/4 w-72 h-72 bg-[#FACC15]/5 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge className="mb-6 bg-[#7C3AED]/20 text-[#7C3AED] border-[#7C3AED]/30 text-xs uppercase tracking-wider">
              <Star className="w-3 h-3 mr-1" /> Bibue Crew Program
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight max-w-4xl mx-auto">
              <span className="bg-gradient-to-r from-[#7C3AED] to-[#FACC15] bg-clip-text text-transparent">
                Bibue Crew
              </span>
              <br />
              <span className="text-foreground text-3xl sm:text-4xl md:text-5xl">
                Refer Friends. Unlock More Stories. Get Paid.
              </span>
            </h1>

            <p className="mt-6 text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto">
              Earn up to 20,000 coins, Premium months, and creator bonuses. The more you share, the more you win.
            </p>

            {user && referralCode ? (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" onClick={copyLink} className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 text-lg px-8">
                  {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  Copy My Link
                </Button>
                <Button size="lg" variant="outline" className="border-[#FACC15]/30 text-[#FACC15] hover:bg-[#FACC15]/10 gap-2">
                  <QrCode className="w-5 h-5" /> QR Code
                </Button>
              </div>
            ) : (
              <div className="mt-10">
                <Button size="lg" className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 text-lg px-8" onClick={() => toast.info("Sign up or log in to get your referral code!")}>
                  <Gift className="w-5 h-5" /> Get Started — Sign Up Free
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* My Referral Code Card */}
        {user && referralCode && (
          <section className="container mx-auto px-4 -mt-8 mb-16 relative z-10">
            <div className="max-w-2xl mx-auto rounded-2xl border border-[#7C3AED]/20 bg-card/80 backdrop-blur-sm p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-[#FACC15]" />
                <h2 className="font-bold text-lg">My Referral Code</h2>
              </div>

              {/* Code display */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 rounded-xl bg-muted/50 border border-border/50 px-4 py-3 font-mono text-xl sm:text-2xl font-bold tracking-wider text-center">
                  {referralCode}
                </div>
                <Button size="icon" variant="outline" onClick={copyCode} className="shrink-0 h-12 w-12">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>

              {/* Link */}
              <div className="rounded-lg bg-muted/30 px-4 py-2 text-sm text-muted-foreground mb-4 break-all">
                https://{referralLink}
              </div>

              {/* Share buttons */}
              <div className="flex flex-wrap gap-2">
                {shareLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-border/50 transition-colors",
                      link.color
                    )}
                  >
                    <ExternalLink className="w-3 h-3" /> {link.name}
                  </a>
                ))}
              </div>

              <p className="mt-4 text-xs text-muted-foreground italic">
                Pre-written: "{shareMessage.substring(0, 80)}…"
              </p>
            </div>
          </section>
        )}

        {/* Reward Tiers */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">Reward Tiers</h2>
            <p className="text-muted-foreground mt-2">The more you refer, the bigger the rewards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {REWARD_TIERS.map((tier) => {
              const achieved = totalReferrals >= tier.threshold;
              return (
                <div
                  key={tier.name}
                  className={cn(
                    "relative rounded-2xl border p-5 transition-all",
                    tier.border,
                    `bg-gradient-to-br ${tier.gradient}`,
                    achieved && "ring-2 ring-[#FACC15]/50"
                  )}
                >
                  {achieved && (
                    <Badge className="absolute -top-2 -right-2 bg-[#FACC15] text-black text-[10px]">
                      <Check className="w-3 h-3 mr-0.5" /> Unlocked
                    </Badge>
                  )}
                  <div className="text-3xl mb-2">{tier.emoji}</div>
                  <h3 className={cn("font-bold text-lg", tier.text)}>{tier.name}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{tier.threshold} referrals</p>

                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-1.5">
                      <Gift className="w-3.5 h-3.5 text-[#FACC15]" />
                      {tier.coins.toLocaleString()} coins
                    </li>
                    <li className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-[#7C3AED]" />
                      "{tier.badge}" badge
                    </li>
                    {tier.premium && (
                      <li className="flex items-center gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-[#FACC15]" />
                        {tier.premium}
                      </li>
                    )}
                    {tier.extra && (
                      <li className="flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-[#7C3AED]" />
                        {tier.extra}
                      </li>
                    )}
                  </ul>

                  {/* Progress bar */}
                  {!achieved && (
                    <div className="mt-4">
                      <div className="h-1.5 rounded-full bg-muted/50 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#FACC15] transition-all"
                          style={{ width: `${Math.min(100, (totalReferrals / tier.threshold) * 100)}%` }}
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">{totalReferrals}/{tier.threshold}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Two Tracks */}
        <section className="container mx-auto px-4 mb-16">
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Reader Track */}
            <div className="rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/5 to-transparent p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-[#7C3AED]/10">
                  <BookOpen className="w-6 h-6 text-[#7C3AED]" />
                </div>
                <h3 className="font-bold text-xl">Reader Track</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Earn coins when friends you refer sign up, read 5+ chapters, or buy coins.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7C3AED]" /> 500 coins on sign-up</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7C3AED]" /> +200 when they read 5 chapters</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7C3AED]" /> +500 on first coin purchase</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#7C3AED]" /> New friend gets 500 coins too!</li>
              </ul>
            </div>

            {/* Creator Track */}
            <div className="rounded-2xl border border-[#FACC15]/20 bg-gradient-to-br from-[#FACC15]/5 to-transparent p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-xl bg-[#FACC15]/10">
                  <Upload className="w-6 h-6 text-[#FACC15]" />
                </div>
                <h3 className="font-bold text-xl">Creator Track</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Extra 10% bonus on the first 3 months of earnings from creators you refer who get approved on Studio.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FACC15]" /> 1,000 coins on approval</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FACC15]" /> +10% of their earnings (3 months)</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FACC15]" /> "Creator Scout" badge</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-[#FACC15]" /> New creator gets +5% bonus too</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Referral Dashboard */}
        {user && (
          <section className="container mx-auto px-4 mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#7C3AED]" />
                My Referral Dashboard
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <StatCard label="Total Referred" value={totalReferrals} icon="👥" />
                <StatCard label="Readers" value={myReferrals?.readerCount || 0} icon="📖" />
                <StatCard label="Creators" value={myReferrals?.creatorCount || 0} icon="✍️" />
                <StatCard label="Coins Earned" value={myReferrals?.totalCoins || 0} icon="🪙" />
              </div>

              <div className="flex items-center gap-3 mb-3">
                <span className="text-sm font-medium">Current Tier:</span>
                <Badge className="bg-[#7C3AED]/20 text-[#7C3AED] border-[#7C3AED]/30">
                  {currentTier.emoji} {currentTier.name}
                </Badge>
                {nextTier && (
                  <span className="text-xs text-muted-foreground">
                    {nextTier.threshold - totalReferrals} more to {nextTier.name}
                  </span>
                )}
              </div>

              {/* Recent referrals */}
              {myReferrals?.referrals && myReferrals.referrals.length > 0 && (
                <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-border/50">
                    <h3 className="text-sm font-medium">Recent Referrals</h3>
                  </div>
                  <div className="divide-y divide-border/30">
                    {myReferrals.referrals.slice(0, 10).map((ref) => (
                      <div key={ref.id} className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <StatusDot status={ref.status} />
                          <span className="text-sm capitalize">{ref.status.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-[#FACC15] font-medium">+{ref.coins_earned} 🪙</span>
                          <span className="text-xs text-muted-foreground">
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

        {/* Leaderboard */}
        <section className="container mx-auto px-4 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#FACC15]" />
                Leaderboard
              </h2>
              <div className="flex rounded-lg border border-border/50 overflow-hidden">
                <button
                  onClick={() => setLeaderboardTab("monthly")}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors", leaderboardTab === "monthly" ? "bg-[#7C3AED] text-white" : "hover:bg-muted/50")}
                >
                  This Month
                </button>
                <button
                  onClick={() => setLeaderboardTab("alltime")}
                  className={cn("px-3 py-1.5 text-xs font-medium transition-colors", leaderboardTab === "alltime" ? "bg-[#7C3AED] text-white" : "hover:bg-muted/50")}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden">
              {leaderboard && leaderboard.length > 0 ? (
                <div className="divide-y divide-border/30">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className={cn(
                      "px-4 py-3 flex items-center gap-3",
                      index < 3 && "bg-[#FACC15]/5"
                    )}>
                      <span className={cn(
                        "w-8 text-center font-bold text-sm",
                        index === 0 && "text-[#FACC15]",
                        index === 1 && "text-gray-300",
                        index === 2 && "text-amber-600",
                        index > 2 && "text-muted-foreground"
                      )}>
                        {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">{(entry.username || "U")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.display_name || entry.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {leaderboardTab === "monthly" ? entry.monthly_referrals : entry.total_referrals} referrals
                        </p>
                      </div>
                      <span className="text-sm font-bold text-[#FACC15]">
                        {(leaderboardTab === "monthly" ? entry.monthly_coins : entry.total_coins).toLocaleString()} 🪙
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-12 text-center text-muted-foreground">
                  <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">No referrals yet — be the first!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold">How It Works</h2>
            <p className="text-muted-foreground mt-2">Five simple steps to start earning</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 max-w-4xl mx-auto">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="flex-1 relative">
                <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-center h-full">
                  <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#FACC15] flex items-center justify-center mb-3">
                    <step.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Step {step.step}</div>
                  <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                  <p className="text-xs text-muted-foreground">{step.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <ChevronRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/30 z-10" />
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="container mx-auto px-4 pb-20">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border border-[#7C3AED]/20 bg-gradient-to-br from-[#7C3AED]/10 to-[#FACC15]/5 p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">
              Ready to build your <span className="text-[#7C3AED]">Bibue Crew</span>?
            </h2>
            <p className="text-muted-foreground mb-6">
              Every referral helps grow the manga community & puts coins in your pocket.
            </p>
            <Button size="lg" className="bg-[#7C3AED] hover:bg-[#7C3AED]/90 text-white gap-2 text-lg px-8" onClick={copyLink}>
              <Copy className="w-5 h-5" /> Copy My Referral Link
            </Button>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/50 p-4 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl sm:text-2xl font-bold">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    signed_up: "bg-blue-500",
    reading: "bg-green-500",
    bought_coins: "bg-[#FACC15]",
    became_creator: "bg-[#7C3AED]",
  };
  return <div className={cn("w-2 h-2 rounded-full", colors[status] || "bg-muted-foreground")} />;
}

export default ReferAndEarnPage;
