import { useState } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { useReferralCode, useMyReferrals, useReferralLeaderboard, useMyCoins, getReferralTier, FOUNDER_TIERS } from "@/hooks/useReferral";
import {
  Copy, Check, Share2, QrCode, Gift, Users, Trophy, Zap, TrendingUp, Star,
  Crown, BookOpen, Upload, ChevronRight, ExternalLink, Sparkles, Shield, Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const HOW_IT_WORKS = [
  { step: 1, icon: Sparkles, title: "Get Your Founder Link", desc: "Sign up and get your exclusive BIBUE-FOUNDER code" },
  { step: 2, icon: Share2, title: "Share With Friends & Creators", desc: "Spread the word across social media" },
  { step: 3, icon: Users, title: "They Join With Your Code", desc: "Friends sign up using your unique link" },
  { step: 4, icon: Gift, title: "Both Earn Instantly", desc: "You both get 1,000 coins + bonuses right away" },
  { step: 5, icon: Trophy, title: "Climb & Claim Exclusives", desc: "Unlock Launch Phase tiers & lifetime perks" },
];

const ReferAndEarnPage = () => {
  const { user } = useAuth();
  const { data: referralCode } = useReferralCode();
  const { data: myReferrals } = useMyReferrals();
  const { data: myCoins } = useMyCoins();
  const [leaderboardTab, setLeaderboardTab] = useState<"monthly" | "alltime">("monthly");
  const { data: leaderboard } = useReferralLeaderboard(leaderboardTab);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const referralLink = referralCode ? `bibue.net/crew/${referralCode}` : "";
  const totalReferrals = myReferrals?.referrals?.length || 0;
  const currentTier = getReferralTier(totalReferrals);
  const nextTier = FOUNDER_TIERS.find(t => t.threshold > totalReferrals);

  const copyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Founder code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://${referralLink}`);
    setCopiedLink(true);
    toast.success("Founder link copied!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareMessage = `I'm in the Bibue Founder Crew — join with my link and we both get 1,000 coins instantly + launch-exclusive rewards 🔥 https://${referralLink}`;

  const shareLinks = [
    { name: "X", url: `https://x.com/intent/tweet?text=${encodeURIComponent(shareMessage)}` },
    { name: "TikTok", url: `https://www.tiktok.com` },
    { name: "Instagram", url: `https://www.instagram.com` },
    { name: "Discord", url: `https://discord.com` },
    { name: "WhatsApp", url: `https://wa.me/?text=${encodeURIComponent(shareMessage)}` },
    { name: "Email", url: `mailto:?subject=${encodeURIComponent("Join the Bibue Founder Crew!")}&body=${encodeURIComponent(shareMessage)}` },
  ];

  return (
    <>
      <SEO
        title="Bibue Crew — Refer & Earn Launch Rewards"
        description="Join the Founder Crew and unlock the highest rewards we'll ever offer. Earn up to 25,000 coins, Lifetime Premium, and creator bonuses."
        url="/refer"
      />
      <CollapsibleNavbar />
      <main className="min-h-screen bg-background">

        {/* ═══════════════ HERO ═══════════════ */}
        <section className="relative pt-24 sm:pt-32 pb-20 sm:pb-28 overflow-hidden">
          {/* Cinematic background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(270,70%,15%)] via-background to-background" />
          <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-[hsl(270,80%,50%)]/8 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-20 right-1/3 w-[400px] h-[400px] bg-[hsl(45,90%,55%)]/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

          {/* Particle dots */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-[hsl(270,80%,70%)]/40 animate-pulse"
              style={{
                top: `${10 + Math.random() * 70}%`,
                left: `${5 + Math.random() * 90}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`,
              }}
            />
          ))}

          <div className="container mx-auto px-4 relative z-10 text-center">
            <Badge className="mb-6 bg-[hsl(45,90%,55%)]/15 text-[hsl(45,90%,60%)] border-[hsl(45,90%,55%)]/30 text-xs uppercase tracking-widest font-semibold px-4 py-1.5">
              <Crown className="w-3.5 h-3.5 mr-1.5" /> Launch Phase — Limited Time
            </Badge>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
              <span className="bg-gradient-to-r from-[hsl(270,80%,65%)] via-[hsl(45,90%,60%)] to-[hsl(270,80%,65%)] bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                Bibue Crew
              </span>
              <br />
              <span className="text-foreground text-2xl sm:text-3xl md:text-4xl font-bold mt-2 block">
                Refer Friends. Earn Massive Rewards.
              </span>
            </h1>

            <p className="mt-6 text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Join the Founder Crew and unlock the <span className="text-[hsl(45,90%,60%)] font-semibold">highest rewards we'll ever offer</span> — available only during our Launch Phase.
            </p>

            {/* Social proof */}
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-[hsl(270,70%,50%)] to-[hsl(45,80%,50%)] border-2 border-background" />
                ))}
              </div>
              <span>Already <span className="text-foreground font-medium">2,347</span> creators & readers in the Crew</span>
            </div>

            {user && referralCode ? (
              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  size="lg"
                  onClick={copyLink}
                  className="bg-gradient-to-r from-[hsl(45,90%,45%)] to-[hsl(35,90%,50%)] hover:from-[hsl(45,90%,50%)] hover:to-[hsl(35,90%,55%)] text-black font-bold gap-2 text-lg px-8 shadow-lg shadow-[hsl(45,90%,50%)]/25 transition-all hover:scale-105 active:scale-95"
                >
                  {copiedLink ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  Get My Founder Link
                </Button>
                <Button size="lg" variant="outline" className="border-[hsl(270,70%,50%)]/40 text-foreground hover:bg-[hsl(270,70%,50%)]/10 gap-2">
                  <QrCode className="w-5 h-5" /> QR Code
                </Button>
              </div>
            ) : (
              <div className="mt-10">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[hsl(45,90%,45%)] to-[hsl(35,90%,50%)] hover:from-[hsl(45,90%,50%)] hover:to-[hsl(35,90%,55%)] text-black font-bold gap-2 text-lg px-8 shadow-lg shadow-[hsl(45,90%,50%)]/25"
                  onClick={() => toast.info("Sign up or log in to get your Founder link!")}
                >
                  <Sparkles className="w-5 h-5" /> Get My Founder Link
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* ═══════════════ FOUNDER LINK CARD ═══════════════ */}
        {user && referralCode && (
          <section className="container mx-auto px-4 -mt-10 mb-20 relative z-10">
            <div className="max-w-2xl mx-auto rounded-2xl border-2 border-[hsl(45,90%,55%)]/30 bg-card/90 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-[hsl(45,90%,50%)]/10">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-[hsl(45,90%,55%)]/10">
                  <Crown className="w-5 h-5 text-[hsl(45,90%,55%)]" />
                </div>
                <h2 className="font-bold text-lg">My Founder Link</h2>
                <Badge className="ml-auto bg-[hsl(45,90%,55%)]/15 text-[hsl(45,90%,60%)] border-[hsl(45,90%,55%)]/30 text-[10px]">
                  FOUNDER
                </Badge>
              </div>

              {/* Code */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 rounded-xl bg-muted/50 border border-[hsl(45,90%,55%)]/20 px-4 py-3.5 font-mono text-lg sm:text-xl font-bold tracking-widest text-center">
                  {referralCode}
                </div>
                <Button size="icon" variant="outline" onClick={copyCode} className="shrink-0 h-12 w-12 border-[hsl(45,90%,55%)]/30">
                  {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </Button>
              </div>

              {/* Link */}
              <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-2.5 text-sm text-muted-foreground mb-5 break-all flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                https://{referralLink}
              </div>

              {/* Share */}
              <div className="flex flex-wrap gap-2 mb-5">
                {shareLinks.map(link => (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-border/50 bg-muted/30 hover:bg-[hsl(270,70%,50%)]/10 transition-all hover:scale-105 active:scale-95"
                  >
                    {link.name}
                  </a>
                ))}
                <button
                  onClick={copyLink}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium border border-[hsl(45,90%,55%)]/30 bg-[hsl(45,90%,55%)]/10 text-[hsl(45,90%,60%)] hover:bg-[hsl(45,90%,55%)]/20 transition-all"
                >
                  <Copy className="w-3 h-3" /> Copy Link
                </button>
              </div>

              {/* Pre-written viral copy */}
              <div className="rounded-xl bg-muted/20 border border-border/30 p-4">
                <p className="text-xs text-muted-foreground mb-1 font-medium">Pre-written viral copy:</p>
                <p className="text-sm leading-relaxed">"{shareMessage}"</p>
                <Button
                  size="sm"
                  variant="ghost"
                  className="mt-2 text-xs gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(shareMessage);
                    toast.success("Copied to clipboard!");
                  }}
                >
                  <Copy className="w-3 h-3" /> Copy Message
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* ═══════════════ LAUNCH PHASE BANNER ═══════════════ */}
        <section className="container mx-auto px-4 mb-8">
          <div className="max-w-5xl mx-auto rounded-2xl bg-gradient-to-r from-[hsl(270,70%,50%)]/10 via-[hsl(45,90%,55%)]/10 to-[hsl(270,70%,50%)]/10 border border-[hsl(45,90%,55%)]/20 p-5 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-[hsl(45,90%,60%)]" />
              <span className="text-sm font-bold text-[hsl(45,90%,60%)] uppercase tracking-wider">Launch Phase Exclusive</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              These Launch Phase rewards are the <span className="text-foreground font-semibold">highest we will ever offer</span> — join the Founder Crew before they return to standard rates.
            </p>
          </div>
        </section>

        {/* ═══════════════ REWARD TIERS ═══════════════ */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black">Launch Phase Reward Tiers</h2>
            <p className="text-muted-foreground mt-2">Climb the ranks for increasingly massive rewards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {FOUNDER_TIERS.map((tier) => {
              const achieved = totalReferrals >= tier.threshold;
              const progress = Math.min(100, (totalReferrals / tier.threshold) * 100);
              return (
                <div
                  key={tier.name}
                  className={cn(
                    "relative rounded-2xl border-2 p-6 transition-all duration-500",
                    tier.border,
                    `bg-gradient-to-br ${tier.gradient}`,
                    achieved && `ring-2 ring-[hsl(45,90%,55%)]/50 ${tier.glow} shadow-lg`
                  )}
                >
                  {achieved && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[hsl(45,90%,45%)] to-[hsl(35,90%,50%)] text-black text-[10px] font-bold px-3 shadow-lg">
                      <Check className="w-3 h-3 mr-0.5" /> Unlocked
                    </Badge>
                  )}
                  <div className="text-4xl mb-3 text-center">{tier.icon}</div>
                  <h3 className={cn("font-black text-lg text-center", tier.text)}>{tier.name}</h3>
                  <p className="text-xs text-muted-foreground text-center mb-4">{tier.threshold} referrals</p>

                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-[hsl(45,90%,55%)] shrink-0" />
                      <span className="font-semibold">{tier.coins.toLocaleString()} coins</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[hsl(270,70%,60%)] shrink-0" />
                      {tier.badge}
                    </li>
                    {tier.premium && (
                      <li className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-[hsl(45,90%,55%)] shrink-0" />
                        {tier.premium}
                      </li>
                    )}
                    {tier.extra && (
                      <li className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[hsl(270,70%,60%)] shrink-0" />
                        <span className="text-xs">{tier.extra}</span>
                      </li>
                    )}
                  </ul>

                  {/* Progress bar */}
                  {!achieved && (
                    <div className="mt-5">
                      <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[hsl(270,70%,50%)] to-[hsl(45,90%,55%)] transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-1.5 text-center font-medium">
                        {totalReferrals}/{tier.threshold} — {tier.threshold - totalReferrals} more
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ═══════════════ TWO TRACKS ═══════════════ */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black">Two High-Value Tracks</h2>
            <p className="text-muted-foreground mt-2">Choose your path — or earn from both</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Reader Track */}
            <div className="rounded-2xl border-2 border-[hsl(270,70%,50%)]/30 bg-gradient-to-br from-[hsl(270,70%,50%)]/8 to-transparent p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-[hsl(270,70%,50%)]/15">
                  <BookOpen className="w-7 h-7 text-[hsl(270,70%,60%)]" />
                </div>
                <div>
                  <h3 className="font-black text-xl">Reader Track</h3>
                  <p className="text-xs text-muted-foreground">Earn when friends read & engage</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(270,70%,50%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(270,70%,60%)]" />
                  </div>
                  <span><strong className="text-foreground">1,000 coins</strong> when they sign up</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(270,70%,50%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(270,70%,60%)]" />
                  </div>
                  <span><strong className="text-foreground">+500</strong> when they read 5+ chapters</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(270,70%,50%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(270,70%,60%)]" />
                  </div>
                  <span><strong className="text-foreground">+1,000</strong> on first coin purchase</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(45,90%,55%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[hsl(45,90%,60%)]" />
                  </div>
                  <span>Your friend gets <strong className="text-[hsl(45,90%,60%)]">1,000 coins</strong> too!</span>
                </li>
              </ul>
            </div>

            {/* Creator Track */}
            <div className="rounded-2xl border-2 border-[hsl(45,90%,55%)]/30 bg-gradient-to-br from-[hsl(45,90%,55%)]/8 to-transparent p-7 sm:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-3 rounded-2xl bg-[hsl(45,90%,55%)]/15">
                  <Upload className="w-7 h-7 text-[hsl(45,90%,55%)]" />
                </div>
                <div>
                  <h3 className="font-black text-xl">Creator Track</h3>
                  <p className="text-xs text-muted-foreground">Refer Studio creators for bigger rewards</p>
                </div>
              </div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(45,90%,55%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                  </div>
                  <span><strong className="text-foreground">2,000 coins</strong> on creator approval</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(45,90%,55%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                  </div>
                  <span><strong className="text-foreground">+15%</strong> of their earnings for 3 months</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(45,90%,55%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[hsl(45,90%,55%)]" />
                  </div>
                  <span>"<strong className="text-foreground">Creator Scout</strong>" exclusive badge</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-[hsl(270,70%,50%)]/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[hsl(270,70%,60%)]" />
                  </div>
                  <span>New creator gets <strong className="text-[hsl(270,70%,60%)]">+5% bonus</strong> on top of 80%</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* ═══════════════ DASHBOARD ═══════════════ */}
        {user && (
          <section className="container mx-auto px-4 mb-20">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl sm:text-3xl font-black mb-8 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-[hsl(270,70%,60%)]" />
                My Referral Dashboard
              </h2>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <DashboardStat label="Total Referred" value={totalReferrals} icon={Users} color="text-[hsl(270,70%,60%)]" />
                <DashboardStat label="Coins Earned" value={myReferrals?.totalCoins || 0} icon={Gift} color="text-[hsl(45,90%,55%)]" />
                <DashboardStat label="Readers" value={myReferrals?.readerCount || 0} icon={BookOpen} color="text-[hsl(270,70%,60%)]" />
                <DashboardStat label="Creators" value={myReferrals?.creatorCount || 0} icon={Upload} color="text-[hsl(45,90%,55%)]" />
              </div>

              {/* Tier progress */}
              <div className="rounded-2xl border border-border/50 bg-card/50 p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{currentTier.icon}</span>
                    <div>
                      <span className="font-bold text-sm">{currentTier.name}</span>
                      {nextTier && (
                        <p className="text-xs text-muted-foreground">
                          {nextTier.threshold - totalReferrals} more to <span className={nextTier.text}>{nextTier.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge className="bg-[hsl(45,90%,55%)]/15 text-[hsl(45,90%,60%)] border-[hsl(45,90%,55%)]/30 text-xs">
                    {myCoins?.balance?.toLocaleString() || 0} 🪙 balance
                  </Badge>
                </div>
                {nextTier && (
                  <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[hsl(270,70%,50%)] via-[hsl(300,60%,55%)] to-[hsl(45,90%,55%)] transition-all duration-700"
                      style={{ width: `${Math.min(100, (totalReferrals / nextTier.threshold) * 100)}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Recent referrals */}
              {myReferrals?.referrals && myReferrals.referrals.length > 0 && (
                <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
                  <div className="px-5 py-4 border-b border-border/30 flex items-center justify-between">
                    <h3 className="font-bold text-sm">Recent Referrals</h3>
                    <Badge variant="outline" className="text-[10px]">
                      {myReferrals.referrals.length} total
                    </Badge>
                  </div>
                  <div className="divide-y divide-border/20">
                    {myReferrals.referrals.slice(0, 10).map((ref) => (
                      <div key={ref.id} className="px-5 py-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <StatusDot status={ref.status} />
                          <span className="text-sm capitalize font-medium">{ref.status.replace(/_/g, " ")}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-[hsl(45,90%,55%)] font-bold">+{ref.coins_earned} 🪙</span>
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

        {/* ═══════════════ LEADERBOARD ═══════════════ */}
        <section className="container mx-auto px-4 mb-20">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl sm:text-3xl font-black flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[hsl(45,90%,55%)]" />
                Founder Leaderboard
              </h2>
              <div className="flex rounded-xl border border-border/50 overflow-hidden bg-muted/30">
                <button
                  onClick={() => setLeaderboardTab("monthly")}
                  className={cn("px-4 py-2 text-xs font-medium transition-all", leaderboardTab === "monthly" ? "bg-[hsl(270,70%,50%)] text-white" : "hover:bg-muted/50")}
                >
                  This Month
                </button>
                <button
                  onClick={() => setLeaderboardTab("alltime")}
                  className={cn("px-4 py-2 text-xs font-medium transition-all", leaderboardTab === "alltime" ? "bg-[hsl(270,70%,50%)] text-white" : "hover:bg-muted/50")}
                >
                  All Time
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card/50 overflow-hidden">
              {leaderboard && leaderboard.length > 0 ? (
                <div className="divide-y divide-border/20">
                  {leaderboard.map((entry, index) => (
                    <div key={entry.user_id} className={cn(
                      "px-5 py-4 flex items-center gap-4 transition-colors",
                      index < 10 && "bg-[hsl(45,90%,55%)]/3",
                      index < 3 && "bg-[hsl(45,90%,55%)]/8"
                    )}>
                      <span className={cn(
                        "w-8 text-center font-black text-sm",
                        index === 0 && "text-[hsl(45,90%,55%)]",
                        index === 1 && "text-slate-300",
                        index === 2 && "text-amber-600",
                        index > 2 && "text-muted-foreground"
                      )}>
                        {index < 3 ? ["🥇", "🥈", "🥉"][index] : `#${index + 1}`}
                      </span>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={entry.avatar_url || undefined} />
                        <AvatarFallback className="text-xs bg-muted">{(entry.username || "U")[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{entry.display_name || entry.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {leaderboardTab === "monthly" ? entry.monthly_referrals : entry.total_referrals} referrals
                        </p>
                      </div>
                      <span className="text-sm font-black text-[hsl(45,90%,55%)]">
                        {(leaderboardTab === "monthly" ? entry.monthly_coins : entry.total_coins).toLocaleString()} 🪙
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-16 text-center text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm font-medium">No referrals yet — be the first Founder!</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ═══════════════ HOW IT WORKS ═══════════════ */}
        <section className="container mx-auto px-4 mb-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-black">How It Works</h2>
            <p className="text-muted-foreground mt-2">Five simple steps to massive rewards</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} className="flex-1 relative">
                  <div className="rounded-2xl border border-border/50 bg-card/50 p-6 text-center h-full hover:border-[hsl(270,70%,50%)]/30 transition-all">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(270,70%,50%)] to-[hsl(45,90%,55%)] flex items-center justify-center mb-4 shadow-lg shadow-[hsl(270,70%,50%)]/20">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-[10px] text-[hsl(45,90%,60%)] uppercase tracking-widest font-bold mb-1">Step {step.step}</div>
                    <h3 className="font-bold text-sm mb-1">{step.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  {i < HOW_IT_WORKS.length - 1 && (
                    <ChevronRight className="hidden sm:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/20 z-10" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════ ANTI-FRAUD TRUST BADGE ═══════════════ */}
        <section className="container mx-auto px-4 mb-10">
          <div className="max-w-2xl mx-auto flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <Shield className="w-4 h-4" />
            <span>Email verification required for rewards • Anti-fraud protected • Automatic coin distribution</span>
          </div>
        </section>

        {/* ═══════════════ FINAL CTA ═══════════════ */}
        <section className="container mx-auto px-4 pb-24">
          <div className="max-w-2xl mx-auto text-center rounded-2xl border-2 border-[hsl(45,90%,55%)]/20 bg-gradient-to-br from-[hsl(270,70%,50%)]/10 via-[hsl(300,60%,50%)]/5 to-[hsl(45,90%,55%)]/10 p-10 sm:p-14">
            <div className="text-4xl mb-4">🔥</div>
            <h2 className="text-2xl sm:text-3xl font-black mb-3">
              Ready to join the <span className="bg-gradient-to-r from-[hsl(270,80%,65%)] to-[hsl(45,90%,60%)] bg-clip-text text-transparent">Founder Crew</span>?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              The Launch Phase won't last forever. Lock in the highest rewards we'll ever offer — starting now.
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-[hsl(45,90%,45%)] to-[hsl(35,90%,50%)] hover:from-[hsl(45,90%,50%)] hover:to-[hsl(35,90%,55%)] text-black font-bold gap-2 text-lg px-10 shadow-lg shadow-[hsl(45,90%,50%)]/25 hover:scale-105 active:scale-95 transition-all"
              onClick={user ? copyLink : () => toast.info("Sign up to get your Founder link!")}
            >
              <Sparkles className="w-5 h-5" /> Get My Founder Link
            </Button>
          </div>
        </section>

        <Footer />
      </main>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% center; }
          100% { background-position: -200% center; }
        }
      `}</style>
    </>
  );
};

function DashboardStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/50 p-5 text-center">
      <Icon className={cn("w-5 h-5 mx-auto mb-2", color)} />
      <div className="text-2xl sm:text-3xl font-black">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

function StatusDot({ status }: { status: string }) {
  const colors: Record<string, string> = {
    signed_up: "bg-blue-500",
    reading: "bg-green-500",
    bought_coins: "bg-[hsl(45,90%,55%)]",
    became_creator: "bg-[hsl(270,70%,60%)]",
  };
  return <div className={cn("w-2.5 h-2.5 rounded-full", colors[status] || "bg-muted-foreground")} />;
}

export default ReferAndEarnPage;
