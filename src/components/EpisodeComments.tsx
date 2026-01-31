import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, ThumbsUp, ArrowUpDown } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface EpisodeCommentsProps {
  animeId: number;
  episodeNumber: number;
  className?: string;
}

export function EpisodeComments({ animeId, episodeNumber, className }: EpisodeCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: comments, isLoading } = useQuery({
    queryKey: ["episode-comments", animeId, episodeNumber, sortBy],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select(`
          *,
          profiles:user_id (username, avatar_url)
        `)
        .eq("anime_id", animeId)
        .eq("episode_number", episodeNumber)
        .order(sortBy === "likes" ? "likes" : "created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: userLikes } = useQuery({
    queryKey: ["user-likes", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("comment_likes")
        .select("comment_id")
        .eq("user_id", user.id);
      if (error) throw error;
      return data.map(l => l.comment_id);
    },
    enabled: !!user,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
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
      queryClient.invalidateQueries({ queryKey: ["episode-comments", animeId, episodeNumber, sortBy] });
      toast({ title: "Comment posted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) throw new Error("Please sign in to like");
      
      const hasLiked = userLikes?.includes(commentId);
      
      if (hasLiked) {
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("comment_likes")
          .insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["episode-comments", animeId, episodeNumber, sortBy] });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
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
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
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
        
        {/* Sort Buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant={sortBy === "latest" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("latest")}
            className="gap-1.5 text-xs"
          >
            <ArrowUpDown className="w-3 h-3" />
            Latest
          </Button>
          <Button
            variant={sortBy === "likes" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setSortBy("likes")}
            className="gap-1.5 text-xs"
          >
            <ThumbsUp className="w-3 h-3" />
            Top
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? "Share your thoughts on this episode..." : "Sign in to comment..."}
          className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
          rows={3}
          disabled={!user}
        />
        <Button 
          type="submit" 
          disabled={!user || !newComment.trim() || addCommentMutation.isPending}
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {user ? "Post Comment" : "Sign in to Comment"}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading comments...
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            const hasLiked = userLikes?.includes(comment.id);
            return (
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
                    <p className="text-sm text-muted-foreground mb-2">
                      {comment.content}
                    </p>
                    
                    {/* Like button */}
                    <button
                      onClick={() => likeMutation.mutate(comment.id)}
                      disabled={!user || likeMutation.isPending}
                      className={cn(
                        "flex items-center gap-1.5 text-xs transition-colors",
                        hasLiked 
                          ? "text-primary" 
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <ThumbsUp className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                      <span>{comment.likes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
