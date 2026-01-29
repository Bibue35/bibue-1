import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface EpisodeCommentsProps {
  animeId: number;
  episodeNumber: number;
  className?: string;
}

export function EpisodeComments({ animeId, episodeNumber, className }: EpisodeCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const queryClient = useQueryClient();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["episode-comments", animeId, episodeNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("anime_id", animeId)
        .eq("episode_number", episodeNumber)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Please sign in to comment");

      const { error } = await supabase
        .from("episode_comments")
        .insert({
          user_id: user.id,
          anime_id: animeId,
          episode_number: episodeNumber,
          content,
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["episode-comments", animeId, episodeNumber] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      addCommentMutation.mutate(newComment.trim());
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Episode {episodeNumber} Comments
        </h3>
        {comments && (
          <span className="text-sm text-muted-foreground">
            ({comments.length})
          </span>
        )}
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts on this episode..."
          className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
          rows={3}
        />
        <Button 
          type="submit" 
          disabled={!newComment.trim() || addCommentMutation.isPending}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Post Comment
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              className="liquid-glass-subtle rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">
                      {(comment.profiles as any)?.username || "Anonymous"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
