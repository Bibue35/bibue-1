import { useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface ViewingHistoryEntry {
  id: string;
  user_id: string;
  media_id: number;
  media_type: string;
  title: string;
  title_japanese: string | null;
  image_url: string | null;
  last_episode: number | null;
  last_chapter: number | null;
  viewed_at: string;
  created_at: string;
}

export function useViewingHistory(limit = 20) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ["viewingHistory", user?.id, limit],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("viewing_history")
        .select("*")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []) as ViewingHistoryEntry[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2, // 2 min cache
  });

  const logViewMutation = useMutation({
    mutationFn: async (entry: {
      media_id: number;
      media_type: string;
      title: string;
      title_japanese?: string | null;
      image_url?: string | null;
      last_episode?: number | null;
      last_chapter?: number | null;
    }) => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("viewing_history")
        .upsert(
          {
            user_id: user.id,
            media_id: entry.media_id,
            media_type: entry.media_type,
            title: entry.title,
            title_japanese: entry.title_japanese || null,
            image_url: entry.image_url || null,
            last_episode: entry.last_episode ?? null,
            last_chapter: entry.last_chapter ?? null,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,media_id,media_type" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewingHistory"] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) return;
      const { error } = await supabase
        .from("viewing_history")
        .delete()
        .eq("user_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewingHistory"] });
    },
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("viewing_history")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["viewingHistory"] });
    },
  });

  const logView = useCallback(
    (entry: Parameters<typeof logViewMutation.mutate>[0]) => {
      if (user?.id) logViewMutation.mutate(entry);
    },
    [user?.id]
  );

  return {
    history: history || [],
    isLoading,
    logView,
    clearHistory: clearHistoryMutation.mutate,
    deleteEntry: deleteEntryMutation.mutate,
    isClearingHistory: clearHistoryMutation.isPending,
  };
}
