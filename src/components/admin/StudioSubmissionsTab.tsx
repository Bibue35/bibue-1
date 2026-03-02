import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, XCircle, Search, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

export function StudioSubmissionsTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const queryClient = useQueryClient();

  const { data: submissions, isLoading } = useQuery({
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
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from("studio_submissions")
        .update({ status, reviewed_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-studio-submissions"] });
      toast.success(`Submission ${status}`);
    },
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
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === f
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : !submissions?.length ? (
        <p className="text-center text-muted-foreground py-12">No submissions found</p>
      ) : (
        <div className="space-y-4">
          {submissions.map((sub: any) => (
            <div key={sub.id} className="border border-border/50 rounded-2xl p-5 bg-card/50">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Cover */}
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

                  {/* Chapter files */}
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

                  {/* Actions */}
                  {sub.status === "pending" && (
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: sub.id, status: "approved" })}
                        disabled={updateStatus.isPending}
                        className="gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateStatus.mutate({ id: sub.id, status: "rejected" })}
                        disabled={updateStatus.isPending}
                        className="gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Reject
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
