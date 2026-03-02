import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  MessageCircle, Search, Loader2, EyeOff, Eye, Trash2, CheckCircle, Flag, Ban, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

type StatusFilter = "all" | "approved" | "flagged" | "pending" | "hidden";

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "approved", label: "Approved" },
  { value: "pending", label: "Pending" },
  { value: "flagged", label: "Flagged" },
  { value: "hidden", label: "Hidden" },
];

export function AdminChapterComments() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["admin-chapter-comments", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("chapter_comments" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (statusFilter === "hidden") {
        query = query.eq("is_hidden", true);
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter).eq("is_hidden", false);
      }

      const { data, error } = await query;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c: any) => c.user_id))];
      const chapterIds = [...new Set((data || []).map((c: any) => c.chapter_id))];

      let profiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: p } = await supabase
          .from("profiles")
          .select("user_id, username, display_name, avatar_url")
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

  // Counts for tabs
  const { data: counts } = useQuery({
    queryKey: ["admin-comment-counts"],
    queryFn: async () => {
      const results: Record<string, number> = { all: 0, approved: 0, pending: 0, flagged: 0, hidden: 0 };
      
      const { count: total } = await supabase.from("chapter_comments" as any).select("*", { count: "exact", head: true });
      const { count: approved } = await supabase.from("chapter_comments" as any).select("*", { count: "exact", head: true }).eq("status", "approved").eq("is_hidden", false);
      const { count: pending } = await supabase.from("chapter_comments" as any).select("*", { count: "exact", head: true }).eq("status", "pending");
      const { count: flagged } = await supabase.from("chapter_comments" as any).select("*", { count: "exact", head: true }).eq("status", "flagged");
      const { count: hidden } = await supabase.from("chapter_comments" as any).select("*", { count: "exact", head: true }).eq("is_hidden", true);

      results.all = total || 0;
      results.approved = approved || 0;
      results.pending = pending || 0;
      results.flagged = flagged || 0;
      results.hidden = hidden || 0;
      return results;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-chapter-comments"] });
    queryClient.invalidateQueries({ queryKey: ["admin-comment-counts"] });
  };

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("chapter_comments" as any).update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Status updated"); },
  });

  const toggleHide = useMutation({
    mutationFn: async ({ id, isHidden }: { id: string; isHidden: boolean }) => {
      const { error } = await supabase.from("chapter_comments" as any).update({ is_hidden: !isHidden }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Comment visibility updated"); },
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("chapter_comments" as any).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("Comment deleted"); },
  });

  // Ban user from commenting (hide all their comments)
  const banUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("chapter_comments" as any).update({ is_hidden: true, status: "flagged" }).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => { invalidate(); toast.success("User's comments have been hidden"); },
  });

  const filtered = search
    ? comments.filter((c: any) =>
        c.content?.toLowerCase().includes(search.toLowerCase()) ||
        c.profile?.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        c.profile?.username?.toLowerCase().includes(search.toLowerCase())
      )
    : comments;

  const getStatusBadge = (comment: any) => {
    if (comment.is_hidden) return <Badge variant="secondary" className="text-[10px]">Hidden</Badge>;
    switch (comment.status) {
      case "flagged": return <Badge variant="destructive" className="text-[10px]">Flagged</Badge>;
      case "pending": return <Badge className="text-[10px] bg-yellow-500/20 text-yellow-400 border-0">Pending</Badge>;
      default: return <Badge variant="default" className="text-[10px]">Approved</Badge>;
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <MessageCircle className="w-6 h-6 text-primary" />
        Comments Moderation
      </h1>

      {/* Status filter tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/30 mb-5 overflow-x-auto">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap",
              statusFilter === tab.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {counts && counts[tab.value] > 0 && (
              <span className="ml-1.5 text-[10px] opacity-70">({counts[tab.value]})</span>
            )}
          </button>
        ))}
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by content or username..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-sm">No comments found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">User</th>
                <th className="text-left py-3 px-2 font-medium">Comment</th>
                <th className="text-left py-3 px-2 font-medium">Chapter</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">♥</th>
                <th className="text-center py-3 px-2 font-medium">Date</th>
                <th className="text-right py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((comment: any) => (
                <tr key={comment.id} className={cn("border-b border-border/20 hover:bg-muted/10", comment.is_hidden && "opacity-50")}>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2 min-w-[120px]">
                      <div className="w-7 h-7 rounded-full bg-muted overflow-hidden shrink-0">
                        {comment.profile?.avatar_url ? (
                          <img src={comment.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                            {(comment.profile?.display_name || "?").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-medium truncate max-w-[100px]">
                        {comment.profile?.display_name || comment.profile?.username || "Unknown"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs text-foreground/80 line-clamp-2 max-w-[280px]">{comment.content}</p>
                    {comment.parent_id && (
                      <span className="text-[10px] text-muted-foreground mt-0.5 block">↳ Reply</span>
                    )}
                  </td>
                  <td className="py-3 px-2">
                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                      {comment.chapter?.series?.title || "—"} · Ch. {comment.chapter?.chapter_number || "?"}
                    </p>
                  </td>
                  <td className="py-3 px-2 text-center">{getStatusBadge(comment)}</td>
                  <td className="py-3 px-2 text-center text-xs">{comment.likes || 0}</td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground whitespace-nowrap">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-end gap-1">
                      {comment.status !== "approved" && (
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => updateStatus.mutate({ id: comment.id, status: "approved" })}
                          title="Approve"
                        >
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                        </Button>
                      )}
                      {comment.status !== "flagged" && (
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7"
                          onClick={() => updateStatus.mutate({ id: comment.id, status: "flagged" })}
                          title="Flag"
                        >
                          <Flag className="w-3.5 h-3.5 text-yellow-500" />
                        </Button>
                      )}
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7"
                        onClick={() => toggleHide.mutate({ id: comment.id, isHidden: comment.is_hidden })}
                        title={comment.is_hidden ? "Show" : "Hide"}
                      >
                        {comment.is_hidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
                        onClick={() => deleteComment.mutate(comment.id)}
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive"
                        onClick={() => {
                          if (confirm(`Hide all comments from this user?`)) {
                            banUser.mutate(comment.user_id);
                          }
                        }}
                        title="Ban user from commenting"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
