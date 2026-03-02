import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Heart, MessageCircle, Loader2, Trash2, Reply, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { validateComment } from "@/lib/validation";

interface Props {
  chapterId: string;
}

type SortMode = "newest" | "likes";

export function OriginalChapterComments({ chapterId }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState<{ id: string; username: string } | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("newest");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());

  // Fetch all comments for this chapter
  const { data: rawComments = [], isLoading } = useQuery({
    queryKey: ["chapter-comments", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_comments" as any)
        .select("*")
        .eq("chapter_id", chapterId)
        .eq("is_hidden", false)
        .in("status", ["approved"])
        .order("created_at", { ascending: false });
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      let profiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
          .in("user_id", userIds);
        (profileData || []).forEach((p) => { profiles[p.user_id] = p; });
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

  // Organize into tree: top-level + replies (max 2 levels)
  const { topLevel, repliesMap, totalCount } = useMemo(() => {
    const top: any[] = [];
    const replies: Record<string, any[]> = {};
    let count = 0;

    rawComments.forEach((c: any) => {
      count++;
      if (!c.parent_id) {
        top.push(c);
      } else {
        if (!replies[c.parent_id]) replies[c.parent_id] = [];
        replies[c.parent_id].push(c);
      }
    });

    // Sort top-level
    if (sortMode === "likes") {
      top.sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }
    // newest is default from query

    // Sort replies by oldest first
    Object.values(replies).forEach((arr) => arr.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    ));

    return { topLevel: top, repliesMap: replies, totalCount: count };
  }, [rawComments, sortMode]);

  // Post comment
  const postMutation = useMutation({
    mutationFn: async ({ text, parentId }: { text: string; parentId?: string }) => {
      const trimmed = text.trim();
      if (!trimmed || !user) throw new Error("Invalid");
      const validation = validateComment(trimmed);
      if (!validation.success) throw new Error(validation.error);

      const { error } = await supabase
        .from("chapter_comments" as any)
        .insert({
          chapter_id: chapterId,
          user_id: user.id,
          content: trimmed,
          parent_id: parentId || null,
          status: "approved",
        });
      if (error) throw error;
    },
    onSuccess: () => {
      setContent("");
      setReplyContent("");
      setReplyTo(null);
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", chapterId] });
      toast.success("Comment posted!");
    },
    onError: (err: Error) => toast.error(err.message || "Failed to post comment"),
  });

  // Like/unlike
  const likeMutation = useMutation({
    mutationFn: async (commentId: string) => {
      if (!user) return;
      if (likedSet.has(commentId)) {
        await supabase.from("chapter_comment_likes" as any).delete().eq("comment_id", commentId).eq("user_id", user.id);
      } else {
        await supabase.from("chapter_comment_likes" as any).insert({ comment_id: commentId, user_id: user.id });
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
      const { error } = await supabase.from("chapter_comments" as any).delete().eq("id", commentId).eq("user_id", user?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", chapterId] });
      toast.success("Comment deleted");
    },
  });

  const toggleReplies = (id: string) => {
    setExpandedReplies((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const renderComment = (comment: any, depth: number = 0) => {
    const isOwn = user?.id === comment.user_id;
    const isLiked = likedSet.has(comment.id);
    const replies = repliesMap[comment.id] || [];
    const hasReplies = replies.length > 0;
    const isExpanded = expandedReplies.has(comment.id);
    const displayName = comment.profile?.display_name || comment.profile?.username || "User";

    return (
      <div key={comment.id} className={cn(depth > 0 && "ml-8 sm:ml-12")}>
        <div className="group py-5 first:pt-0">
          {/* Avatar + content */}
          <div className="flex gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-muted overflow-hidden shrink-0 mt-0.5">
              {comment.profile?.avatar_url ? (
                <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-muted-foreground">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium">{displayName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>

              {/* Body */}
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">
                {comment.content}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => user && likeMutation.mutate(comment.id)}
                  disabled={!user || likeMutation.isPending}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors touch-manipulation",
                    isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", isLiked && "fill-current")} />
                  {comment.likes > 0 && <span>{comment.likes}</span>}
                </button>

                {/* Reply button — only on top-level and first-level replies (max 2 levels) */}
                {depth < 1 && user && (
                  <button
                    onClick={() => setReplyTo(replyTo?.id === comment.id ? null : { id: comment.id, username: displayName })}
                    className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                  >
                    <Reply className="w-3.5 h-3.5" />
                    Reply
                  </button>
                )}

                {isOwn && (
                  <button
                    onClick={() => deleteMutation.mutate(comment.id)}
                    className="text-xs text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100 touch-manipulation"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Inline reply form */}
              {replyTo?.id === comment.id && (
                <div className="mt-4 pl-0.5">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder={`Reply to ${replyTo.username}...`}
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value.slice(0, 1000))}
                      className="min-h-[60px] resize-none text-sm flex-1"
                      rows={2}
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => { setReplyTo(null); setReplyContent(""); }}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="text-xs h-7 gap-1"
                      disabled={!replyContent.trim() || postMutation.isPending}
                      onClick={() => postMutation.mutate({ text: replyContent, parentId: comment.id })}
                    >
                      {postMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                      Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Replies */}
        {hasReplies && (
          <div className="ml-8 sm:ml-12">
            {!isExpanded && replies.length > 0 && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 mb-2 touch-manipulation"
              >
                <ChevronDown className="w-3.5 h-3.5" />
                {replies.length} {replies.length === 1 ? "reply" : "replies"}
              </button>
            )}
            {isExpanded && (
              <>
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 mb-1 touch-manipulation"
                >
                  <ChevronDown className="w-3.5 h-3.5 rotate-180" />
                  Hide replies
                </button>
                <div className="border-l-2 border-border/30 pl-4 sm:pl-5 space-y-0">
                  {replies.map((r: any) => renderComment(r, depth + 1))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-primary" />
          Comments
          {totalCount > 0 && (
            <span className="text-sm font-normal text-muted-foreground">({totalCount})</span>
          )}
        </h3>

        {/* Sort toggle */}
        {totalCount > 1 && (
          <div className="flex gap-1 p-0.5 rounded-lg bg-muted/30">
            {(["newest", "likes"] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortMode(mode)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  sortMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {mode === "newest" ? "Newest" : "Most Liked"}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment box */}
      {user ? (
        <div className="mb-8">
          <div className="rounded-xl border border-border/30 bg-muted/10 p-4 focus-within:border-primary/30 transition-colors">
            <Textarea
              placeholder="Write a comment..."
              value={content}
              onChange={(e) => setContent(e.target.value.slice(0, 2000))}
              className="min-h-[80px] resize-none border-0 bg-transparent p-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/50"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
              <span className="text-[11px] text-muted-foreground/50">{content.length}/2000</span>
              <Button
                size="sm"
                disabled={!content.trim() || postMutation.isPending}
                onClick={() => postMutation.mutate({ text: content })}
                className="gap-1.5 h-8 text-xs"
              >
                {postMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Post Comment
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-8 rounded-xl bg-muted/20 border border-border/20 p-6 text-center">
          <p className="text-sm text-muted-foreground">Sign in to leave a comment</p>
        </div>
      )}

      {/* Comments list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-12">
          <MessageCircle className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No comments yet — be the first!</p>
        </div>
      ) : (
        <div className="divide-y divide-border/15">
          {topLevel.map((comment: any) => renderComment(comment))}
        </div>
      )}
    </section>
  );
}
