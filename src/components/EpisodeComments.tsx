import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Send, User, ThumbsUp, ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { validateComment } from "@/lib/validation";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface EpisodeCommentsProps {
  animeId: number;
  episodeNumber: number;
  className?: string;
}

export function EpisodeComments({ animeId, episodeNumber, className }: EpisodeCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "likes">("latest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();

  const queryKey = ["episode-comments", animeId, episodeNumber, sortBy];

  const { data: comments, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("episode_comments")
        .select(`*, profiles:user_id (username, avatar_url)`)
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
      const { data, error } = await supabase.from("comment_likes").select("comment_id").eq("user_id", user.id);
      if (error) throw error;
      return data.map(l => l.comment_id);
    },
    enabled: !!user,
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error("Please sign in to comment");
      const { error } = await supabase.from("episode_comments").insert({ user_id: user.id, anime_id: animeId, episode_number: episodeNumber, content });
      if (error) throw error;
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Comment posted!" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const editMutation = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase.from("episode_comments").update({ content }).eq("id", id).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey });
      toast({ title: "Comment updated" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      // Delete likes first, then comment
      await supabase.from("comment_likes").delete().eq("comment_id", id);
      const { error } = await supabase.from("episode_comments").delete().eq("id", id).eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
      toast({ title: "Comment deleted" });
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
        const { error } = await supabase.from("comment_likes").delete().eq("user_id", user.id).eq("comment_id", commentId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("comment_likes").insert({ user_id: user.id, comment_id: commentId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["user-likes", user?.id] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    const validation = validateComment(trimmedComment);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    addCommentMutation.mutate(trimmedComment);
  };

  const handleEditSubmit = (id: string) => {
    const trimmed = editContent.trim();
    const validation = validateComment(trimmed);
    if (!validation.success) {
      toast({ title: "Validation Error", description: validation.error, variant: "destructive" });
      return;
    }
    editMutation.mutate({ id, content: trimmed });
  };

  return (
    <div className={cn("", className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <h3 className="text-lg font-semibold">
            {t("comments.episode")} {episodeNumber} {t("comments.discussion")}
          </h3>
          {comments && <span className="text-sm text-muted-foreground">({comments.length})</span>}
        </div>
        <div className="flex items-center gap-1">
          <Button variant={sortBy === "latest" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("latest")} className="gap-1.5 text-xs">
            <ArrowUpDown className="w-3 h-3" /> {t("comments.latest")}
          </Button>
          <Button variant={sortBy === "likes" ? "secondary" : "ghost"} size="sm" onClick={() => setSortBy("likes")} className="gap-1.5 text-xs">
            <ThumbsUp className="w-3 h-3" /> {t("comments.top")}
          </Button>
        </div>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={user ? t("comments.shareThoughts") : t("comments.signInPlaceholder")}
          className="mb-3 liquid-glass-subtle border-foreground/10 resize-none"
          rows={3}
          disabled={!user}
        />
        <Button type="submit" disabled={!user || !newComment.trim() || addCommentMutation.isPending} className="gap-2">
          <Send className="w-4 h-4" />
          {user ? t("comments.postComment") : t("comments.signInToComment")}
        </Button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">{t("comments.loadingComments")}</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => {
            const hasLiked = userLikes?.includes(comment.id);
            const isOwner = user?.id === comment.user_id;
            const isEditing = editingId === comment.id;

            return (
              <div key={comment.id} className="liquid-glass-subtle rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{(comment.profiles as any)?.username || "Anonymous"}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      {isOwner && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => { setEditingId(comment.id); setEditContent(comment.content); }}>
                              <Pencil className="w-3.5 h-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(comment.id)}>
                              <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="resize-none text-sm"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleEditSubmit(comment.id)} disabled={editMutation.isPending}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mb-2">{comment.content}</p>
                    )}

                    {!isEditing && (
                      <button
                        onClick={() => likeMutation.mutate(comment.id)}
                        disabled={!user || likeMutation.isPending}
                        className={cn(
                          "flex items-center gap-1.5 text-xs transition-colors",
                          hasLiked ? "text-primary" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <ThumbsUp className={cn("w-3.5 h-3.5", hasLiked && "fill-current")} />
                        <span>{comment.likes || 0}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-muted-foreground">{t("comments.noComments")}</div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete comment?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}