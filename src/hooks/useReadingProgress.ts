import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReadingProgress {
  last_chapter_read: number | null;
  last_episode_watched: number | null;
  chapters_read: number | null;
  episodes_watched: number | null;
}

export function useReadingProgress(malId: number, mediaType: "anime" | "manga") {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["reading-progress", malId, mediaType, user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("watchlist")
        .select("last_chapter_read, last_episode_watched, chapters_read, episodes_watched")
        .eq("user_id", user.id)
        .eq("mal_id", malId)
        .eq("media_type", mediaType)
        .maybeSingle();
      
      if (error) throw error;
      return data as ReadingProgress | null;
    },
    enabled: !!user,
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ 
      chapterNumber, 
      episodeNumber,
      title,
      imageUrl 
    }: { 
      chapterNumber?: number; 
      episodeNumber?: number;
      title: string;
      imageUrl?: string;
    }) => {
      if (!user) throw new Error("Must be logged in");

      // First check if entry exists
      const { data: existing } = await supabase
        .from("watchlist")
        .select("id, chapters_read, episodes_watched")
        .eq("user_id", user.id)
        .eq("mal_id", malId)
        .eq("media_type", mediaType)
        .maybeSingle();

      if (existing) {
        // Update existing entry
        const updateData: Record<string, any> = {};
        
        if (chapterNumber !== undefined) {
          updateData.last_chapter_read = chapterNumber;
          // Also update chapters_read count if this is higher
          if (!existing.chapters_read || chapterNumber > existing.chapters_read) {
            updateData.chapters_read = chapterNumber;
          }
        }
        
        if (episodeNumber !== undefined) {
          updateData.last_episode_watched = episodeNumber;
          if (!existing.episodes_watched || episodeNumber > existing.episodes_watched) {
            updateData.episodes_watched = episodeNumber;
          }
        }

        const { error } = await supabase
          .from("watchlist")
          .update(updateData)
          .eq("id", existing.id);

        if (error) throw error;
      } else {
        // Create new watchlist entry with reading status
        const { error } = await supabase
          .from("watchlist")
          .insert({
            user_id: user.id,
            mal_id: malId,
            media_type: mediaType,
            title,
            image_url: imageUrl,
            status: "reading",
            last_chapter_read: chapterNumber,
            last_episode_watched: episodeNumber,
            chapters_read: chapterNumber,
            episodes_watched: episodeNumber,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reading-progress", malId, mediaType, user?.id] });
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });

  return {
    progress,
    isLoading,
    lastChapterRead: progress?.last_chapter_read ?? null,
    lastEpisodeWatched: progress?.last_episode_watched ?? null,
    updateProgress: updateProgressMutation.mutate,
    isUpdating: updateProgressMutation.isPending,
  };
}
