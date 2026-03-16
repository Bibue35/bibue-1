import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Bug, Loader2, Send, ArrowLeft, AlertCircle, Clock, CheckCircle, XCircle } from "lucide-react";

const COLUMNS = [
  { status: "open", label: "Open", icon: AlertCircle, color: "text-primary" },
  { status: "in-progress", label: "In Progress", icon: Clock, color: "text-neon-gold" },
  { status: "resolved", label: "Resolved", icon: CheckCircle, color: "text-green-400" },
  { status: "closed", label: "Closed", icon: XCircle, color: "text-muted-foreground" },
];

function useBugReports() {
  return useQuery({
    queryKey: ["admin-bugs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("category", "bug")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });
}

function useTicketReplies(ticketId: string | null) {
  return useQuery({
    queryKey: ["adminBugReplies", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!ticketId,
  });
}

export function BugRoadmapTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: bugs = [], isLoading } = useBugReports();
  const [selected, setSelected] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newSeverity, setNewSeverity] = useState("minor");
  const [newDescription, setNewDescription] = useState("");

  const addBug = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("support_tickets").insert({
        user_id: user!.id,
        subject: `[BUG] ${newSubject.trim()}`.slice(0, 200),
        category: "bug",
        message: `Severity: ${newSeverity}\n\n${newDescription.trim()}`.slice(0, 5000),
        status: "open",
        is_creator_priority: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bugs"] });
      toast.success("Bug added");
      setShowAdd(false);
      setNewSubject("");
      setNewSeverity("minor");
      setNewDescription("");
    },
    onError: () => toast.error("Failed to add bug"),
  });
  const { data: replies = [], isLoading: repliesLoading } = useTicketReplies(selected?.id);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bugs"] });
      toast.success("Bug status updated");
    },
  });

  const sendReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: selected.id,
        user_id: user!.id,
        message: replyMsg.trim().slice(0, 5000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyMsg("");
      queryClient.invalidateQueries({ queryKey: ["adminBugReplies", selected.id] });
      toast.success("Reply sent");
    },
  });

  if (selected) {
    const severity = selected.message?.match(/^Severity: (\w+)/)?.[1] || "unknown";
    const body = selected.message?.replace(/^Severity: \w+\n\n/, "") || selected.message;

    return (
      <div>
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to roadmap
        </button>

        <Card className="border-border/50 mb-4">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold">{selected.subject.replace(/^\[BUG\] /, "")}</h3>
              <Badge className={cn("text-xs", severity === "critical" ? "bg-red-500/20 text-red-400" : severity === "major" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400")}>
                {severity}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{body}</p>
            <div className="text-xs text-muted-foreground mb-4">
              User: {selected.user_id.slice(0, 8)}... · {formatDistanceToNow(new Date(selected.created_at), { addSuffix: true })}
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-border/50">
              <Select value={selected.status} onValueChange={(s) => { updateStatus.mutate({ id: selected.id, status: s }); setSelected({ ...selected, status: s }); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((c) => <SelectItem key={c.status} value={c.status}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3 mb-4">
          {repliesLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : replies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No replies yet</p>
          ) : (
            replies.map((r: any) => (
              <Card key={r.id} className={cn("border-border/50", r.user_id !== selected.user_id && "border-primary/20 bg-primary/5")}>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {r.user_id === selected.user_id ? "Reporter" : "Admin"} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Textarea value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Reply as admin..." rows={2} className="flex-1" maxLength={5000} />
          <Button variant="amber" size="icon" className="shrink-0 self-end" disabled={!replyMsg.trim() || sendReply.isPending} onClick={() => sendReply.mutate()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <Bug className="w-6 h-6 text-primary" />
        Bug Roadmap
      </h1>

      {bugs.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Bug className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No bug reports yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const items = bugs.filter((b: any) => b.status === col.status);
            return (
              <div key={col.status}>
                <div className="flex items-center gap-2 mb-3 px-1">
                  <col.icon className={cn("w-4 h-4", col.color)} />
                  <span className="text-sm font-semibold">{col.label}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{items.length}</Badge>
                </div>
                <div className="space-y-2">
                  {items.map((bug: any) => {
                    const severity = bug.message?.match(/^Severity: (\w+)/)?.[1] || "minor";
                    return (
                      <Card
                        key={bug.id}
                        className="border-border/50 hover:border-primary/30 cursor-pointer transition-colors"
                        onClick={() => setSelected(bug)}
                      >
                        <CardContent className="p-3">
                          <p className="text-sm font-medium mb-1.5 line-clamp-2">{bug.subject.replace(/^\[BUG\] /, "")}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className={cn("text-[10px]", severity === "critical" ? "bg-red-500/20 text-red-400" : severity === "major" ? "bg-orange-500/20 text-orange-400" : "bg-blue-500/20 text-blue-400")}>
                              {severity}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground">
                              {formatDistanceToNow(new Date(bug.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-6 border border-dashed border-border/50 rounded-xl">No bugs</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
