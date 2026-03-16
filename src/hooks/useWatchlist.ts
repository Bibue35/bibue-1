import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIncognito } from "@/contexts/IncognitoContext";
import { useToast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";

export interface WatchlistItem {
  id: string;
  user_id: string;
  mal_id: number;
  media_type: "anime" | "manga";
  title: string;
  title_japanese: string | null;
  image_url: string | null;
  score: number | null;
  status: string;
  category: string | null;
  notes: string | null;
  episodes_watched: number;
  chapters_read: number;
  last_episode_watched: number | null;
  last_chapter_read: number | null;
  created_at: string;
  updated_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const { isIncognito } = useIncognito();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, user_id, mal_id, media_type, title, title_japanese, image_url, score, status, category, notes, episodes_watched, chapters_read, last_episode_watched, last_chapter_read, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

  // Helper to log activity (only if not incognito)
  const logActivity = async (
    activityType: string,
    malId: number,
    mediaType: "anime" | "manga",
    title: string,
    imageUrl?: string | null,
    details?: Record<string, Json> | null
  ) => {
    if (isIncognito || !user) return;
    
    try {
      await supabase.from("activity_logs").insert([{
        user_id: user.id,
        activity_type: activityType,
        mal_id: malId,
        media_type: mediaType,
        title,
        image_url: imageUrl || null,
        details: details || {},
      }]);
    } catch (error) {
      // silently fail
    }
  };

  const addToWatchlist = useMutation({
    mutationFn: async (item: {
      mal_id: number;
      media_type: "anime" | "manga";
      title: string;
      title_japanese?: string;
      image_url?: string;
      score?: number;
    }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .insert({
          user_id: user.id,
          mal_id: item.mal_id,
          media_type: item.media_type,
          title: item.title,
          title_japanese: item.title_japanese || null,
          image_url: item.image_url || null,
          score: item.score || null,
        });

      if (error) throw error;
      void logActivity("added", item.mal_id, item.media_type, item.title, item.image_url);
    },
    // Optimistic update: immediately add to local cache
    onMutate: async (item) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist", user?.id] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(["watchlist", user?.id]);
      
      const optimisticItem: WatchlistItem = {
        id: `temp-${Date.now()}`,
        user_id: user!.id,
        mal_id: item.mal_id,
        media_type: item.media_type,
        title: item.title,
        title_japanese: item.title_japanese || null,
        image_url: item.image_url || null,
        score: item.score || null,
        status: "plan_to_watch",
        category: null,
        notes: null,
        episodes_watched: 0,
        chapters_read: 0,
        last_episode_watched: null,
        last_chapter_read: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist", user?.id],
        (old) => [optimisticItem, ...(old || [])]
      );

      return { previous };
    },
    onError: (error: Error, _item, context) => {
      // Revert on failure
      if (context?.previous) {
        queryClient.setQueryData(["watchlist", user?.id], context.previous);
      }
      if (error.message.includes("duplicate")) {
        toast({ title: "Already in watchlist", variant: "destructive" });
      } else {
        toast({ title: "Failed to add", description: error.message, variant: "destructive" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Added to watchlist!" });
    },
  });

  const removeFromWatchlist = useMutation({
    mutationFn: async ({ mal_id, media_type }: { mal_id: number; media_type: "anime" | "manga" }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .delete()
        .eq("user_id", user.id)
        .eq("mal_id", mal_id)
        .eq("media_type", media_type);

      if (error) throw error;
    },
    // Optimistic: immediately remove from cache
    onMutate: async ({ mal_id, media_type }) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist", user?.id] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(["watchlist", user?.id]);
      
      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist", user?.id],
        (old) => old?.filter(i => !(i.mal_id === mal_id && i.media_type === media_type)) || []
      );

      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["watchlist", user?.id], context.previous);
      }
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Removed from watchlist" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ mal_id, media_type, status }: { mal_id: number; media_type: "anime" | "manga"; status: string }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .update({ status })
        .eq("user_id", user.id)
        .eq("mal_id", mal_id)
        .eq("media_type", media_type);

      if (error) throw error;
    },
    onMutate: async ({ mal_id, media_type, status }) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist", user?.id] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(["watchlist", user?.id]);
      
      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist", user?.id],
        (old) => old?.map(i => 
          i.mal_id === mal_id && i.media_type === media_type ? { ...i, status } : i
        ) || []
      );

      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["watchlist", user?.id], context.previous);
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Status updated" });
    },
  });

  const updateScore = useMutation({
    mutationFn: async ({ mal_id, media_type, score }: { mal_id: number; media_type: "anime" | "manga"; score: number | null }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .update({ score })
        .eq("user_id", user.id)
        .eq("mal_id", mal_id)
        .eq("media_type", media_type);

      if (error) throw error;
    },
    onMutate: async ({ mal_id, media_type, score }) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist", user?.id] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(["watchlist", user?.id]);
      
      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist", user?.id],
        (old) => old?.map(i => 
          i.mal_id === mal_id && i.media_type === media_type ? { ...i, score } : i
        ) || []
      );

      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["watchlist", user?.id], context.previous);
      toast({ title: "Failed to save rating", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Rating saved" });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ mal_id, media_type, field, value }: { 
      mal_id: number; 
      media_type: "anime" | "manga"; 
      field: "episodes_watched" | "chapters_read" | "last_episode_watched" | "last_chapter_read";
      value: number;
    }) => {
      if (!user) throw new Error("Must be logged in");
      
      const { error } = await supabase
        .from("watchlist")
        .update({ [field]: value })
        .eq("user_id", user.id)
        .eq("mal_id", mal_id)
        .eq("media_type", media_type);

      if (error) throw error;
    },
    onMutate: async ({ mal_id, media_type, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ["watchlist", user?.id] });
      const previous = queryClient.getQueryData<WatchlistItem[]>(["watchlist", user?.id]);
      
      queryClient.setQueryData<WatchlistItem[]>(
        ["watchlist", user?.id],
        (old) => old?.map(i => 
          i.mal_id === mal_id && i.media_type === media_type ? { ...i, [field]: value } : i
        ) || []
      );

      return { previous };
    },
    onError: (error: Error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(["watchlist", user?.id], context.previous);
      toast({ title: "Failed to update progress", description: error.message, variant: "destructive" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  const isInWatchlist = (mal_id: number, media_type: "anime" | "manga") => {
    return watchlist?.some((item) => item.mal_id === mal_id && item.media_type === media_type) ?? false;
  };

  const getWatchlistItem = (mal_id: number, media_type: "anime" | "manga") => {
    return watchlist?.find((item) => item.mal_id === mal_id && item.media_type === media_type);
  };

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    updateStatus,
    updateScore,
    updateProgress,
    isInWatchlist,
    getWatchlistItem,
  };
}
