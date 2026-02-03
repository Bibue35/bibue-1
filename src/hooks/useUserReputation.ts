import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserReputation {
  karma: number;
  posts_count: number;
  comments_count: number;
  helpful_votes: number;
}

export function useUserReputation(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-reputation", userId],
    queryFn: async (): Promise<UserReputation | null> => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from("user_reputation")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useLeaderboard(limit: number = 10) {
  return useQuery({
    queryKey: ["leaderboard", limit],
    queryFn: async () => {
      const { data: reputations, error } = await supabase
        .from("user_reputation")
        .select("*")
        .order("karma", { ascending: false })
        .limit(limit);

      if (error) throw error;
      if (!reputations?.length) return [];

      // Get profiles for these users
      const userIds = reputations.map((r) => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]) || []);

      return reputations.map((rep) => ({
        ...rep,
        profile: profileMap.get(rep.user_id) || null,
      }));
    },
  });
}
