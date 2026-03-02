import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Launch Phase reward tiers
export const FOUNDER_TIERS = [
  {
    name: "Bronze Crew",
    threshold: 5,
    coins: 1500,
    badge: "Founder Badge",
    premium: null,
    extra: null,
    gradient: "from-amber-700/30 to-amber-900/20",
    border: "border-amber-600/40",
    text: "text-amber-400",
    glow: "shadow-amber-500/20",
    icon: "🥉",
  },
  {
    name: "Silver Crew",
    threshold: 15,
    coins: 5000,
    badge: "Silver Founder",
    premium: "30 days Premium",
    extra: "Exclusive Reading Frame",
    gradient: "from-slate-300/20 to-slate-500/15",
    border: "border-slate-400/40",
    text: "text-slate-300",
    glow: "shadow-slate-400/20",
    icon: "🥈",
  },
  {
    name: "Gold Crew",
    threshold: 40,
    coins: 12000,
    badge: "Gold Founder",
    premium: "90 days Premium",
    extra: "Featured on Originals homepage",
    gradient: "from-yellow-500/25 to-amber-600/15",
    border: "border-yellow-500/50",
    text: "text-yellow-400",
    glow: "shadow-yellow-500/30",
    icon: "🥇",
  },
  {
    name: "Diamond Crew",
    threshold: 100,
    coins: 25000,
    badge: "Diamond Legend",
    premium: "Lifetime Premium",
    extra: "3% permanent creator revenue bonus + Personal shoutout",
    gradient: "from-cyan-400/25 to-violet-600/20",
    border: "border-cyan-400/50",
    text: "text-cyan-400",
    glow: "shadow-cyan-400/30",
    icon: "💎",
  },
] as const;

export function useReferralCode() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referralCode", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code, is_founder")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data?.referral_code as string | null;
    },
    enabled: !!user,
  });
}

export function useMyReferrals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["myReferrals", user?.id],
    queryFn: async () => {
      if (!user) return { referrals: [], totalCoins: 0, readerCount: 0, creatorCount: 0 };

      const { data, error } = await supabase
        .from("user_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const referrals = data || [];
      const totalCoins = referrals.reduce((sum, r) => sum + (r.coins_earned || 0), 0);
      const readerCount = referrals.filter(r => r.status !== 'became_creator').length;
      const creatorCount = referrals.filter(r => r.status === 'became_creator').length;

      return { referrals, totalCoins, readerCount, creatorCount };
    },
    enabled: !!user,
  });
}

export function useReferralLeaderboard(type: "monthly" | "alltime" = "alltime") {
  return useQuery({
    queryKey: ["referralLeaderboard", type],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_referrals")
        .select("referrer_id, coins_earned, created_at");

      if (error) throw error;

      const aggregated = new Map<string, { totalCoins: number; totalReferrals: number; monthlyCoins: number; monthlyReferrals: number }>();
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);

      for (const row of data || []) {
        const existing = aggregated.get(row.referrer_id) || { totalCoins: 0, totalReferrals: 0, monthlyCoins: 0, monthlyReferrals: 0 };
        existing.totalCoins += row.coins_earned || 0;
        existing.totalReferrals += 1;
        if (new Date(row.created_at) >= monthStart) {
          existing.monthlyCoins += row.coins_earned || 0;
          existing.monthlyReferrals += 1;
        }
        aggregated.set(row.referrer_id, existing);
      }

      const referrerIds = Array.from(aggregated.keys());
      if (referrerIds.length === 0) return [];

      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, username, display_name, avatar_url")
        .in("user_id", referrerIds);

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

      return referrerIds
        .map(id => {
          const stats = aggregated.get(id)!;
          const profile = profileMap.get(id);
          return {
            user_id: id,
            username: profile?.username || "User",
            display_name: profile?.display_name,
            avatar_url: profile?.avatar_url,
            total_referrals: stats.totalReferrals,
            total_coins: stats.totalCoins,
            monthly_referrals: stats.monthlyReferrals,
            monthly_coins: stats.monthlyCoins,
          };
        })
        .sort((a, b) => type === "monthly" ? b.monthly_coins - a.monthly_coins : b.total_coins - a.total_coins)
        .slice(0, 50);
    },
    staleTime: 60_000,
  });
}

export function useMyCoins() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["myCoins", user?.id],
    queryFn: async () => {
      if (!user) return { balance: 0, lifetime_earned: 0 };
      const { data } = await supabase
        .from("user_coins")
        .select("balance, lifetime_earned")
        .eq("user_id", user.id)
        .single();
      return data || { balance: 0, lifetime_earned: 0 };
    },
    enabled: !!user,
  });
}

export function useApplyReferralCode() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (code: string) => {
      if (!user) throw new Error("Must be logged in");

      const { data: referrer, error: findError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", code.toUpperCase().trim())
        .single();

      if (findError || !referrer) throw new Error("Invalid referral code");
      if (referrer.user_id === user.id) throw new Error("Cannot refer yourself");

      const { data: existing } = await supabase
        .from("user_referrals")
        .select("id")
        .eq("referred_id", user.id)
        .single();

      if (existing) throw new Error("You've already used a referral code");

      // Launch phase: 1000 coins instead of 500
      const { error: insertError } = await supabase
        .from("user_referrals")
        .insert({
          referrer_id: referrer.user_id,
          referred_id: user.id,
          status: "signed_up",
          coins_earned: 1000,
        });

      if (insertError) throw insertError;

      await supabase
        .from("profiles")
        .update({ referred_by: code.toUpperCase().trim() })
        .eq("user_id", user.id);

      // Distribute coins to both parties via DB function
      await supabase.rpc("distribute_referral_coins", {
        p_user_id: referrer.user_id,
        p_amount: 1000,
        p_description: "Launch Phase referral bonus",
      });
      
      await supabase.rpc("distribute_referral_coins", {
        p_user_id: user.id,
        p_amount: 1000,
        p_description: "Welcome bonus from referral",
      });

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReferrals"] });
      queryClient.invalidateQueries({ queryKey: ["myCoins"] });
    },
  });
}

export function getReferralTier(count: number) {
  if (count >= 100) return FOUNDER_TIERS[3];
  if (count >= 40) return FOUNDER_TIERS[2];
  if (count >= 15) return FOUNDER_TIERS[1];
  if (count >= 5) return FOUNDER_TIERS[0];
  return { name: "Starter", threshold: 0, coins: 0, badge: "", premium: null, extra: null, gradient: "from-muted to-muted", border: "border-border/50", text: "text-muted-foreground", glow: "", icon: "🌱" };
}
