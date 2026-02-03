import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
}

export interface UserBadge {
  id: string;
  badge_id: string;
  awarded_at: string;
  badge: Badge;
}

export function useUserBadges(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-badges", userId],
    queryFn: async (): Promise<UserBadge[]> => {
      if (!userId) return [];

      const { data: userBadges, error: ubError } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", userId);

      if (ubError) throw ubError;
      if (!userBadges?.length) return [];

      // Get badge details
      const badgeIds = userBadges.map((ub) => ub.badge_id);
      const { data: badges, error: bError } = await supabase
        .from("badges")
        .select("*")
        .in("id", badgeIds);

      if (bError) throw bError;

      const badgeMap = new Map(badges?.map((b) => [b.id, b]) || []);

      return userBadges.map((ub) => ({
        ...ub,
        badge: badgeMap.get(ub.badge_id) as Badge,
      })).filter((ub) => ub.badge);
    },
    enabled: !!userId,
  });
}

export function useAllBadges() {
  return useQuery({
    queryKey: ["all-badges"],
    queryFn: async (): Promise<Badge[]> => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });
}
