import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface FollowStats {
  followersCount: number;
  followingCount: number;
  isFollowing: boolean;
}

export function useFollow(targetUserId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get follow stats for a user
  const { data: stats, isLoading } = useQuery({
    queryKey: ["follow-stats", targetUserId],
    queryFn: async (): Promise<FollowStats> => {
      if (!targetUserId) {
        return { followersCount: 0, followingCount: 0, isFollowing: false };
      }

      const [followersRes, followingRes, isFollowingRes] = await Promise.all([
        supabase
          .from("user_follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", targetUserId),
        supabase
          .from("user_follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", targetUserId),
        user?.id
          ? supabase
              .from("user_follows")
              .select("id")
              .eq("follower_id", user.id)
              .eq("following_id", targetUserId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      return {
        followersCount: followersRes.count || 0,
        followingCount: followingRes.count || 0,
        isFollowing: !!isFollowingRes.data,
      };
    },
    enabled: !!targetUserId,
  });

  // Follow mutation
  const followMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !targetUserId) throw new Error("Not authenticated");
      
      const { error } = await supabase.from("user_follows").insert({
        follower_id: user.id,
        following_id: targetUserId,
      });

      if (error) throw error;
    },
    onMutate: async () => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["follow-stats", targetUserId] });
      const previous = queryClient.getQueryData<FollowStats>(["follow-stats", targetUserId]);
      
      queryClient.setQueryData<FollowStats>(["follow-stats", targetUserId], (old) => ({
        followersCount: (old?.followersCount || 0) + 1,
        followingCount: old?.followingCount || 0,
        isFollowing: true,
      }));

      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["follow-stats", targetUserId], context?.previous);
      toast.error("Failed to follow user");
    },
    onSuccess: () => {
      toast.success("Following!");
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserId] });
    },
  });

  // Unfollow mutation
  const unfollowMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !targetUserId) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user.id)
        .eq("following_id", targetUserId);

      if (error) throw error;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["follow-stats", targetUserId] });
      const previous = queryClient.getQueryData<FollowStats>(["follow-stats", targetUserId]);
      
      queryClient.setQueryData<FollowStats>(["follow-stats", targetUserId], (old) => ({
        followersCount: Math.max((old?.followersCount || 1) - 1, 0),
        followingCount: old?.followingCount || 0,
        isFollowing: false,
      }));

      return { previous };
    },
    onError: (err, _, context) => {
      queryClient.setQueryData(["follow-stats", targetUserId], context?.previous);
      toast.error("Failed to unfollow user");
    },
    onSuccess: () => {
      toast.success("Unfollowed");
      queryClient.invalidateQueries({ queryKey: ["followers", targetUserId] });
    },
  });

  const toggleFollow = useCallback(() => {
    if (!user) {
      toast.error("Please sign in to follow users");
      return;
    }
    if (user.id === targetUserId) {
      toast.error("You can't follow yourself");
      return;
    }

    if (stats?.isFollowing) {
      unfollowMutation.mutate();
    } else {
      followMutation.mutate();
    }
  }, [user, targetUserId, stats?.isFollowing, followMutation, unfollowMutation]);

  return {
    followersCount: stats?.followersCount || 0,
    followingCount: stats?.followingCount || 0,
    isFollowing: stats?.isFollowing || false,
    isLoading,
    toggleFollow,
    isToggling: followMutation.isPending || unfollowMutation.isPending,
  };
}

// Get followers/following lists
export function useFollowList(userId: string | undefined, type: "followers" | "following") {
  return useQuery({
    queryKey: [type, userId],
    queryFn: async () => {
      if (!userId) return [];

      const column = type === "followers" ? "following_id" : "follower_id";
      const selectColumn = type === "followers" ? "follower_id" : "following_id";

      const { data: follows, error } = await supabase
        .from("user_follows")
        .select("*")
        .eq(column, userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (!follows.length) return [];

      // Get profiles for the users
      const userIds = follows.map((f) => f[selectColumn as keyof typeof f]);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds as string[]);

      return profiles || [];
    },
    enabled: !!userId,
  });
}
