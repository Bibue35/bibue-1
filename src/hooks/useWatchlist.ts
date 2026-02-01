import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

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
  created_at: string;
  updated_at: string;
}

export function useWatchlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: watchlist, isLoading } = useQuery({
    queryKey: ["watchlist", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("watchlist")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as WatchlistItem[];
    },
    enabled: !!user,
  });

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
      
      const { data, error } = await supabase
        .from("watchlist")
        .insert({
          user_id: user.id,
          mal_id: item.mal_id,
          media_type: item.media_type,
          title: item.title,
          title_japanese: item.title_japanese || null,
          image_url: item.image_url || null,
          score: item.score || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Added to watchlist!" });
    },
    onError: (error: Error) => {
      if (error.message.includes("duplicate")) {
        toast({ title: "Already in watchlist", variant: "destructive" });
      } else {
        toast({ title: "Failed to add", description: error.message, variant: "destructive" });
      }
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Removed from watchlist" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to remove", description: error.message, variant: "destructive" });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Status updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to update", description: error.message, variant: "destructive" });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
      toast({ title: "Rating saved" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to save rating", description: error.message, variant: "destructive" });
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
    isInWatchlist,
    getWatchlistItem,
  };
}
