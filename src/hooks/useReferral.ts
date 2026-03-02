import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useReferralCode() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["referralCode", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("referral_code")
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
      // Query profiles with referral counts via user_referrals
      const { data, error } = await supabase
        .from("user_referrals")
        .select("referrer_id, coins_earned, created_at");

      if (error) throw error;

      // Aggregate by referrer
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

      // Fetch profiles for all referrers
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

      // Find the referrer by code
      const { data: referrer, error: findError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", code.toUpperCase().trim())
        .single();

      if (findError || !referrer) throw new Error("Invalid referral code");
      if (referrer.user_id === user.id) throw new Error("Cannot refer yourself");

      // Check if already referred
      const { data: existing } = await supabase
        .from("user_referrals")
        .select("id")
        .eq("referred_id", user.id)
        .single();

      if (existing) throw new Error("You've already used a referral code");

      // Create the referral
      const { error: insertError } = await supabase
        .from("user_referrals")
        .insert({
          referrer_id: referrer.user_id,
          referred_id: user.id,
          status: "signed_up",
          coins_earned: 500,
        });

      if (insertError) throw insertError;

      // Update profile with referred_by
      await supabase
        .from("profiles")
        .update({ referred_by: code.toUpperCase().trim() })
        .eq("user_id", user.id);

      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myReferrals"] });
      queryClient.invalidateQueries({ queryKey: ["myCoins"] });
    },
  });
}

export function getReferralTier(count: number) {
  if (count >= 100) return { name: "Diamond", color: "from-cyan-400 to-blue-500", emoji: "💎", threshold: 100 };
  if (count >= 40) return { name: "Gold", color: "from-yellow-400 to-amber-500", emoji: "🥇", threshold: 40 };
  if (count >= 15) return { name: "Silver", color: "from-gray-300 to-gray-400", emoji: "🥈", threshold: 15 };
  if (count >= 5) return { name: "Bronze", color: "from-amber-600 to-amber-700", emoji: "🥉", threshold: 5 };
  return { name: "Starter", color: "from-muted to-muted", emoji: "🌱", threshold: 0 };
}
