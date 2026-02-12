import { useState } from "react";
import { MessageCircle, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { validateComment } from "@/lib/validation";
import { useLanguage } from "@/contexts/LanguageContext";

interface ChapterCommentsProps {
  mangaId: number;
  chapterNumber: number;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string | null;
    avatar_url: string | null;
  };
}

export function ChapterComments({ mangaId, chapterNumber }: ChapterCommentsProps) {
  const [newComment, setNewComment] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();

  // Fetch comments for this chapter (using discussions table with manga_id filter)
  const { data: comments, isLoading } = useQuery({
    queryKey: ["chapter-comments", mangaId, chapterNumber],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("discussions")
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles:user_id (username, avatar_url)
        `)
        .eq("manga_id", mangaId)
        .eq("category", `chapter-${chapterNumber}`)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      return data as unknown as Comment[];
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to comment");
      
      const { error } = await supabase.from("discussions").insert({
        manga_id: mangaId,
        category: `chapter-${chapterNumber}`,
        title: `Chapter ${chapterNumber} Discussion`,
        content,
        user_id: user.id,
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chapter-comments", mangaId, chapterNumber] });
      setNewComment("");
      toast({ title: "Comment added" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive" 
      });
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-bold">{t("comments.chapter")} {chapterNumber} {t("comments.discussion")}</h3>
      </div>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          placeholder={t("comments.shareChapterThoughts")}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[80px] resize-none bg-background/50"
        />
        <div className="flex justify-end">
          <Button 
            type="submit" 
            size="sm" 
            disabled={!newComment.trim() || addCommentMutation.isPending}
            className="gap-2"
          >
            <Send className="w-4 h-4" />
            {t("comments.post")}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="text-center text-muted-foreground py-4">{t("common.loading")}</div>
        ) : comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="p-3 rounded-lg bg-background/30 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                  {comment.profiles?.avatar_url ? (
                    <img 
                      src={comment.profiles.avatar_url} 
                      alt="" 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <User className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {comment.profiles?.username || "Anonymous"}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(comment.created_at)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{comment.content}</p>
            </div>
          ))
        ) : (
          <div className="text-center text-muted-foreground py-8">
            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t("comments.noChapterComments")}</p>
          </div>
        )}
      </div>
    </div>
  );
}