import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Shield, Loader2, CheckCircle, XCircle, ExternalLink, AlertTriangle, Clock } from "lucide-react";

function useDmcaRequests(statusFilter: string) {
  return useQuery({
    queryKey: ["admin-dmca", statusFilter],
    queryFn: async () => {
      let q = supabase.from("dmca_requests").select("*").order("created_at", { ascending: false });
      if (statusFilter !== "all") q = q.eq("status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data || [];
    },
  });
}

export function DmcaTab() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");
  const queryClient = useQueryClient();

  const { data: requests, isLoading, isError } = useDmcaRequests(statusFilter);

  const updateDmca = useMutation({
    mutationFn: async ({ id, status, admin_notes }: { id: string; status?: string; admin_notes?: string }) => {
      const update: Record<string, any> = {};
      if (status) { update.status = status; update.reviewed_at = new Date().toISOString(); }
      if (admin_notes !== undefined) update.admin_notes = admin_notes;
      const { error } = await supabase.from("dmca_requests").update(update).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-dmca"] });
      queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
      toast.success("DMCA request updated");
      setEditingNotes(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const filters = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <Shield className="w-6 h-6 text-red-500" /> DMCA Requests
      </h1>

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
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : isError ? (
        <div className="text-center py-12">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-muted-foreground">Failed to load DMCA requests</p>
        </div>
      ) : !requests?.length ? (
        <p className="text-center text-muted-foreground py-12">No DMCA requests found</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req: any) => (
            <div key={req.id} className="border border-border/50 rounded-2xl p-5 bg-card/50">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-semibold">{req.claimant_name}</h3>
                  <p className="text-sm text-muted-foreground">{req.claimant_email} {req.claimant_company && `· ${req.claimant_company}`}</p>
                </div>
                <Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"}>
                  {req.status}
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground mb-2">{req.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                <a href={req.content_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Content URL
                </a>
                {req.original_work_url && (
                  <a href={req.original_work_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Original Work
                  </a>
                )}
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(req.created_at), { addSuffix: true })}
                </span>
                {req.sworn_statement && <Badge variant="outline" className="text-[10px]">Sworn Statement</Badge>}
              </div>

              {/* Admin Notes */}
              {editingNotes === req.id ? (
                <div className="space-y-2 mb-3">
                  <Textarea value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Admin notes..." rows={2} maxLength={2000} />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => updateDmca.mutate({ id: req.id, admin_notes: notesValue })} disabled={updateDmca.isPending}>Save Notes</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingNotes(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => { setEditingNotes(req.id); setNotesValue(req.admin_notes || ""); }}
                  className="text-xs text-muted-foreground hover:text-foreground mb-3 block"
                >
                  {req.admin_notes ? `Notes: ${req.admin_notes}` : "＋ Add admin notes"}
                </button>
              )}

              {req.status === "pending" && (
                <div className="flex gap-2">
                  <Button size="sm" className="gap-1" onClick={() => updateDmca.mutate({ id: req.id, status: "approved" })} disabled={updateDmca.isPending}>
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </Button>
                  <Button size="sm" variant="destructive" className="gap-1" onClick={() => updateDmca.mutate({ id: req.id, status: "rejected" })} disabled={updateDmca.isPending}>
                    <XCircle className="w-3.5 h-3.5" /> Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
