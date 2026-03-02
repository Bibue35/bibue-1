import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface Props {
  chapterId: string;
}

export function OriginalChapterComments({ chapterId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");

  // Fetch comments with profile join
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["chapter-comments", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_comments" as any)
        .select("*")
        .eq("chapter_id", chapterId)
        .eq("is_hidden", false)
        .order("created_at", { ascending: true });
      if (error) throw error;

      // Fetch profiles for all user_ids
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      let profiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", userIds);
        (profileData || []).forEach((p) => {
          profiles[p.user_id] = p;
        });
      }

      return (data || []).map((c: any) => ({
        ...c,
        profile: profiles[c.user_id] || null,
      }));
    },
  });

  // Fetch user's likes
  const { data: userLikes = [] } = useQuery({
    queryKey: ["chapter-comment-likes", chapterId, user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("chapter_comment_likes" as any)
        .select("comment_id")
        .eq("user_id", user.id);
      return (data || []).map((l: any) => l.comment_id);
    },
    enabled: !!user,
  });

  const likedSet = new Set(userLikes);

  // Post comment
  const postMutation = useMutation({
    mutationFn: async () => {
      const trimmed = content.trim();
      if (!trimmed || !user) throw new Error("Invalid");
      if (trimmed.length > 2000) throw new Error("Comment too long");
      const { error } = await supabase
        .from("chapter_comments" as any)
        .insert({ chapter_id: chapterId, user_id: user.id, content: trimmed });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", chapterId] });
    },
    onError: () => toast.error("Failed to post comment"),
  });

  // Like/unlike
  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) return;
      if (likedSet.has(commentId)) {
        await supabase
          .from("chapter_comment_likes" as any)
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        await supabase
          .from("chapter_comment_likes" as any)
          .insert({ comment_id: commentId, user_id: user.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", chapterId] });
      queryClient.invalidateQueries({ queryKey: ["chapter-comment-likes", chapterId] });
    },
  });

  // Delete own comment
  const deleteMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from("chapter_comments" as any)
        .delete()
        .eq("id", commentId)
        .eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", chapterId] });
      toast.success("Comment deleted");
    },
  });

  return (
    <section>
      <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-primary" />
        Comments
        {comments.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h3>

      {/* Comment box */}
      {user ? (
        <div className="mb-6">
          <Textarea
            placeholder="Share your thoughts on this chapter..."
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, 2000))}
            className="min-h-[80px] resize-none mb-2"
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{content.length}/2000</span>
            <Button
              size="sm"
              disabled={!content.trim() || postMutation.isPending}
              onClick={() => postMutation.mutate()}
              className="gap-1.5"
            >
              {postMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              Post Comment
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-6 p-4 rounded-xl bg-muted/30 text-center">
          <p className="text-sm text-muted-foreground">Sign in to leave a comment</p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-muted-foreground">No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment: any) => {
            const isOwn = user?.id === comment.user_id;
            const isLiked = likedSet.has(comment.id);

            return (
              <div
                key={comment.id}
                className="group rounded-xl p-4 bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-muted overflow-hidden shrink-0">
                    {comment.profile?.avatar_url ? (
                      <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                        {(comment.profile?.display_name || comment.profile?.username || "?").charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {comment.profile?.display_name || comment.profile?.username || "User"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>

                {/* Body */}
                <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed mb-3">
                  {comment.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => user && likeMutation.mutate(comment.id)}
                    disabled={!user || likeMutation.isPending}
                    className={cn(
                      "flex items-center gap-1 text-xs transition-colors",
                      isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                  >
                    <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
                    {comment.likes > 0 && <span>{comment.likes}</span>}
                  </button>

                  {isOwn && (
                    <button
                      onClick={() => deleteMutation.mutate(comment.id)}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
