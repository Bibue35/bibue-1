import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle, Search, Loader2, EyeOff, Eye, Trash2, CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

export function AdminChapterComments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-chapter-comments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapter_comments" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;

      // Fetch profiles + chapter info
      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const chapterIds = [...new Set((data || []).map((c: any) => c.chapter_id))];

      let profiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, username, display_name")
          .in("user_id", userIds);
        (p || []).forEach((pr) => { profiles[pr.user_id] = pr; });
      }

      let chapterInfo: Record<string, any> = {};
      if (chapterIds.length > 0) {
        const { data: ch } = await supabase
          .from("chapters")
          .select("id, chapter_number, title, series_id, series!inner(title)")
          .in("id", chapterIds);
        (ch || []).forEach((c: any) => { chapterInfo[c.id] = c; });
      }

      return (data || []).map((c: any) => ({
        ...c,
        profile: profiles[c.user_id],
        chapter: chapterInfo[c.chapter_id],
      }));
    },
  });

  const toggleHide = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      const { error } = await supabase
        .from("chapter_comments" as any)
        .update({ is_hidden: !isHidden })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapter-comments"] });
      toast.success("Comment updated");
    },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("chapter_comments" as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-chapter-comments"] });
      toast.success("Comment deleted");
    },
  });

  const filtered = search
    ? comments.filter((c: any) =>
        c.content?.toLowerCase().includes(search.toLowerCase()) ||
        c.profile?.display_name?.toLowerCase().includes(search.toLowerCase())
      )
    : comments;

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        Chapter Comments
        <Badge variant="secondary" className="ml-2">{comments.length}</Badge>
      </h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search comments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-border/50">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No comments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((comment: any) => (
            <Card
              key={comment.id}
              className={cn(
                "border-border/50",
                comment.is_hidden && "opacity-50"
              )}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Meta */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium">
                        {comment.profile?.display_name || comment.profile?.username || "Unknown"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.is_hidden && (
                        <Badge variant="secondary" className="text-xs">Hidden</Badge>
                      )}
                    </div>

                    {/* Chapter context */}
                    <p className="text-xs text-muted-foreground mb-2">
                      on{" "}
                      <span className="font-medium text-foreground/70">
                        {comment.chapter?.series?.title || "Series"}
                      </span>
                      {" · "}Ch. {comment.chapter?.chapter_number || "?"}
                      {comment.chapter?.title && ` — ${comment.chapter.title}`}
                    </p>

                    {/* Content */}
                    <p className="text-sm text-foreground/80 line-clamp-3">{comment.content}</p>

                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>♥ {comment.likes}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleHide.mutate({ id: comment.id, isHidden: comment.is_hidden })}
                      title={comment.is_hidden ? "Show comment" : "Hide comment"}
                    >
                      {comment.is_hidden ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:text-destructive"
                      onClick={() => deleteComment.mutate(comment.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
