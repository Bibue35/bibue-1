import { useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useSeriesFollow(seriesId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["series-follow", seriesId, user?.id],
    queryFn: async () => {
      if (!seriesId) return { count: 0, isFollowing: false };

      const [countRes, followRes] = await Promise.all([
        supabase
          .from("series_follows")
          .select("id", { count: "exact", head: true })
          .eq("series_id", seriesId),
        user?.id
          ? supabase
              .from("series_follows")
              .select("id")
              .eq("series_id", seriesId)
              .eq("user_id", user.id)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        count: countRes.count || 0,
        isFollowing: !!followRes.data,
      };
    },
    enabled: !!seriesId,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !seriesId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("series_follows")
        .insert({ user_id: user.id, series_id: seriesId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series-follow", seriesId] });
      toast.success("Following series!");
    },
    onError: () => toast.error("Failed to follow series"),
  });

  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !seriesId) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("series_follows")
        .delete()
        .eq("user_id", user.id)
        .eq("series_id", seriesId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["series-follow", seriesId] });
      toast.success("Unfollowed series");
    },
    onError: () => toast.error("Failed to unfollow"),
  });

  const toggleFollow = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to follow series");
      return;
    }
    if (data?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [user, data?.isFollowing, followMutation, unfollowMutation]);

  return {
    followersCount: data?.count || 0,
    isFollowing: data?.isFollowing || false,
    isLoading,
    toggleFollow,
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  };
}
