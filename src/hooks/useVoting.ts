import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type VoteType = "like" | "dislike";

// Hook for comment likes (existing functionality)
export function useCommentVote(commentId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: hasLiked } = useQuery({
    queryKey: ["comment-like", commentId, user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { data } = await supabase
        .from("comment_likes")
        .select("id")
        .eq("comment_id", commentId)
        .eq("user_id", user.id)
        .maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const toggleLike = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to like comments");

      if (hasLiked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ comment_id: commentId, user_id: user.id });
        if (error) {
          // Handle unique constraint violation gracefully
          if (error.code === "23505") {
            throw new Error("You've already liked this comment");
          }
          throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comment-like", commentId] });
      queryClient.invalidateQueries({ queryKey: ["episode-comments"] });
      queryClient.invalidateQueries({ queryKey: ["user-likes"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return { hasLiked: hasLiked ?? false, toggleLike };
}

// Hook for episode votes (like/dislike an episode)
export function useEpisodeVote(animeId: number, episodeNumber: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userVote } = useQuery({
    queryKey: ["episode-vote", animeId, episodeNumber, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("episode_votes")
        .select("vote_type")
        .eq("anime_id", animeId)
        .eq("episode_number", episodeNumber)
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.vote_type as VoteType | null;
    },
    enabled: !!user,
  });

  const { data: voteCounts } = useQuery({
    queryKey: ["episode-vote-counts", animeId, episodeNumber],
    queryFn: async () => {
      const { data } = await supabase
        .from("episode_votes")
        .select("vote_type")
        .eq("anime_id", animeId)
        .eq("episode_number", episodeNumber);

      const likes = data?.filter((v) => v.vote_type === "like").length ?? 0;
      const dislikes = data?.filter((v) => v.vote_type === "dislike").length ?? 0;
      return { likes, dislikes };
    },
  });

  const vote = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!user) throw new Error("Please sign in to vote");

      // If already voted with this type, remove the vote
      if (userVote === voteType) {
        const { error } = await supabase
          .from("episode_votes")
          .delete()
          .eq("anime_id", animeId)
          .eq("episode_number", episodeNumber)
          .eq("user_id", user.id);
        if (error) throw error;
        return "removed";
      }

      // Otherwise, upsert the vote
      const { error } = await supabase
        .from("episode_votes")
        .upsert(
          {
            user_id: user.id,
            anime_id: animeId,
            episode_number: episodeNumber,
            vote_type: voteType,
          },
          { onConflict: "user_id,anime_id,episode_number" }
        );
      if (error) throw error;
      return voteType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-vote", animeId, episodeNumber] });
      queryClient.invalidateQueries({ queryKey: ["episode-vote-counts", animeId, episodeNumber] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    userVote,
    likes: voteCounts?.likes ?? 0,
    dislikes: voteCounts?.dislikes ?? 0,
    vote,
  };
}

// Hook for chapter votes (like/dislike a manga chapter)
export function useChapterVote(mangaId: number, chapterNumber: number) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userVote } = useQuery({
    queryKey: ["chapter-vote", mangaId, chapterNumber, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("chapter_votes")
        .select("vote_type")
        .eq("manga_id", mangaId)
        .eq("chapter_number", chapterNumber)
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.vote_type as VoteType | null;
    },
    enabled: !!user,
  });

  const { data: voteCounts } = useQuery({
    queryKey: ["chapter-vote-counts", mangaId, chapterNumber],
    queryFn: async () => {
      const { data } = await supabase
        .from("chapter_votes")
        .select("vote_type")
        .eq("manga_id", mangaId)
        .eq("chapter_number", chapterNumber);

      const likes = data?.filter((v) => v.vote_type === "like").length ?? 0;
      const dislikes = data?.filter((v) => v.vote_type === "dislike").length ?? 0;
      return { likes, dislikes };
    },
  });

  const vote = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!user) throw new Error("Please sign in to vote");

      if (userVote === voteType) {
        const { error } = await supabase
          .from("chapter_votes")
          .delete()
          .eq("manga_id", mangaId)
          .eq("chapter_number", chapterNumber)
          .eq("user_id", user.id);
        if (error) throw error;
        return "removed";
      }

      const { error } = await supabase
        .from("chapter_votes")
        .upsert(
          {
            user_id: user.id,
            manga_id: mangaId,
            chapter_number: chapterNumber,
            vote_type: voteType,
          },
          { onConflict: "user_id,manga_id,chapter_number" }
        );
      if (error) throw error;
      return voteType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-vote", mangaId, chapterNumber] });
      queryClient.invalidateQueries({ queryKey: ["chapter-vote-counts", mangaId, chapterNumber] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    userVote,
    likes: voteCounts?.likes ?? 0,
    dislikes: voteCounts?.dislikes ?? 0,
    vote,
  };
}

// Hook for general media votes (like/dislike anime or manga as a whole)
export function useMediaVote(mediaId: number, mediaType: "anime" | "manga") {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userVote } = useQuery({
    queryKey: ["media-vote", mediaId, mediaType, user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("media_votes")
        .select("vote_type")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType)
        .eq("user_id", user.id)
        .maybeSingle();
      return data?.vote_type as VoteType | null;
    },
    enabled: !!user,
  });

  const { data: voteCounts } = useQuery({
    queryKey: ["media-vote-counts", mediaId, mediaType],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_votes")
        .select("vote_type")
        .eq("media_id", mediaId)
        .eq("media_type", mediaType);

      const likes = data?.filter((v) => v.vote_type === "like").length ?? 0;
      const dislikes = data?.filter((v) => v.vote_type === "dislike").length ?? 0;
      return { likes, dislikes };
    },
  });

  const vote = useMutation({
    mutationFn: async (voteType: VoteType) => {
      if (!user) throw new Error("Please sign in to vote");

      if (userVote === voteType) {
        const { error } = await supabase
          .from("media_votes")
          .delete()
          .eq("media_id", mediaId)
          .eq("media_type", mediaType)
          .eq("user_id", user.id);
        if (error) throw error;
        return "removed";
      }

      const { error } = await supabase
        .from("media_votes")
        .upsert(
          {
            user_id: user.id,
            media_id: mediaId,
            media_type: mediaType,
            vote_type: voteType,
          },
          { onConflict: "user_id,media_id,media_type" }
        );
      if (error) throw error;
      return voteType;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-vote", mediaId, mediaType] });
      queryClient.invalidateQueries({ queryKey: ["media-vote-counts", mediaId, mediaType] });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    userVote,
    likes: voteCounts?.likes ?? 0,
    dislikes: voteCounts?.dislikes ?? 0,
    vote,
  };
}
