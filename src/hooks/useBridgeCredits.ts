import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useBridgeCredits() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bridge-credits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bridge_credits")
        .select("*")
        .eq("user_id", user!.id)
        .gte("period_start", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0])
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSubscription() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["subscription", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user!.id)
        .eq("status", "active")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useBridgeTitles() {
  return useQuery({
    queryKey: ["bridge-titles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bridge_titles")
        .select("*")
        .order("total_credits", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useMyBridgeVotes() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["bridge-votes", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data, error } = await supabase
        .from("bridge_votes")
        .select("title_id")
        .eq("user_id", user!.id)
        .gte("created_at", startOfMonth);
      if (error) throw error;
      return new Set((data ?? []).map((v) => v.title_id));
    },
  });
}

export function useSpendCredit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (titleId: string) => {
      const { data, error } = await supabase.rpc("spend_bridge_credit", {
        p_title_id: titleId,
      });
      if (error) throw error;
      const result = data as unknown as { success: boolean; error?: string; credits_remaining?: number };
      if (!result.success) throw new Error(result.error || "Failed to vote");
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bridge-credits"] });
      queryClient.invalidateQueries({ queryKey: ["bridge-titles"] });
      queryClient.invalidateQueries({ queryKey: ["bridge-votes"] });
    },
  });
}
