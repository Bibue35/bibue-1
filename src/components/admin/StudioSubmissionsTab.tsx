import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function StudioSubmissionsTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const queryClient = useQueryClient();

  const { data: submissions, isLoading, isError } = useQuery({
    queryKey: ["admin-studio-submissions", statusFilter],
    queryFn: async () => {
      let q = supabase.from("studio_submissions").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data;
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, submission }: { id: string; status: string; submission?: any }) => {
      const { error } = await supabase
        .from("studio_submissions")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;

      if (status === "approved" && submission) {
        const { data: { user } } = await supabase.auth.getUser();
        const creatorId = submission.user_id || user?.id;
        if (!creatorId) throw new Error("No creator ID available");

        const { data: existingProfile } = await supabase
          .from("creator_profiles")
          .select("user_id")
          .eq("user_id", creatorId)
          .maybeSingle();

        if (!existingProfile) {
          await supabase.from("creator_profiles").insert({
            user_id: creatorId,
            display_name: submission.name || "Studio Creator",
            status: "active",
          });
        }

        const { error: seriesError } = await supabase.from("series").insert({
          creator_id: creatorId,
          title: submission.series_title,
          description: submission.description,
          cover_image_url: submission.cover_url,
          genre_tags: submission.genre ? [submission.genre] : [],
          status: "approved",
          content_rating: "everyone",
        });
        if (seriesError) throw seriesError;
      }
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-studio-submissions"] });
      if (status === "approved") {
        toast.success("Submission approved & series created in Originals!");
      } else {
        toast.success(`Submission ${status}`);
      }
    },
    onError: (e) => toast.error(e.message),
  });

  const updateNotes = useMutation({
    mutationFn: async ({ id, admin_notes }: { id: string; admin_notes: string }) => {
      const { error } = await supabase.from("studio_submissions").update({ admin_notes }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-studio-submissions"] });
      toast.success("Notes saved");
      setEditingNotes(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const filters = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6">Studio Submissions</h1>

      <div className="flex gap-1 p-1 rounded-xl bg-muted/30 mb-6 w-fit">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setStatusFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              statusFilter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">Failed to load submissions. Check your admin permissions.</p>
        </div>
      ) : !submissions?.length ? (
        <p className="text-center text-muted-foreground py-12">No submissions found</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="border border-border/50 rounded-2xl p-5 bg-card/50">
              <div className="flex flex-col sm:flex-row gap-4">
                {sub.cover_url && (
                  <div className="w-20 h-28 rounded-xl overflow-hidden bg-muted shrink-0">
                    <img src={sub.cover_url} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-semibold text-lg">{sub.series_title}</h3>
                      <p className="text-sm text-muted-foreground">
                        by {sub.name} · {sub.email}
                      </p>
                    </div>
                    <Badge
                      variant={
                        sub.status === "approved" ? "default" :
                        sub.status === "rejected" ? "destructive" : "secondary"
                      }
                    >
                      {sub.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{sub.genre}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{sub.description}</p>

                  {sub.chapter_urls?.length > 0 && (
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {sub.chapter_urls.map((url: string, i: number) => (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Chapter {i + 1}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Admin Notes */}
                  {editingNotes === sub.id ? (
                    <div className="space-y-2 mt-3">
                      <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Admin notes..." rows={2} maxLength={2000} />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateNotes.mutate({ id: sub.id, admin_notes: notesValue })} disabled={updateNotes.isPending}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingNotes(sub.id); setNotesValue(sub.admin_notes || ""); }}
                      className="text-xs text-muted-foreground hover:text-foreground mt-2 block"
                    >
                      {sub.admin_notes ? `Notes: ${sub.admin_notes}` : "＋ Add admin notes"}
                    </button>
                  )}

                  {sub.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: sub.id, status: "approved", submission: sub })}
                        disabled={updateStatus.isPending}
                        className="gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ id: sub.id, status: "rejected" })}
                        disabled={updateStatus.isPending}
                        className="gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
