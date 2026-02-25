import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import {
  Headphones, Search, Loader2, Star, Send, ArrowLeft, CheckCircle,
  MessageSquare, Clock, XCircle,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  open: "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30",
  "in-progress": "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

function useAllTickets(filter: string, search: string) {
  return useQuery({
    queryKey: ["adminTickets", filter, search],
    queryFn: async () => {
      let query = supabase.from("support_tickets").select("*").order("created_at", { ascending: false });
      if (filter === "priority") query = query.eq("is_creator_priority", true);
      else if (filter === "open") query = query.eq("status", "open");
      if (search) query = query.ilike("subject", `%${search}%`);
      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });
}

function useAdminTicketReplies(ticketId: string | null) {
  return useQuery({
    queryKey: ["adminTicketReplies", ticketId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ticket_replies")
        .select("*")
        .eq("ticket_id", ticketId!)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!ticketId,
  });
}

export function SupportTicketsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [replyMsg, setReplyMsg] = useState("");
  const [newStatus, setNewStatus] = useState("");

  const { data: tickets = [], isLoading } = useAllTickets(filter, search);
  const { data: replies = [], isLoading: repliesLoading } = useAdminTicketReplies(selectedTicket?.id);

  const sendReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: selectedTicket.id,
        user_id: user!.id,
        message: replyMsg.trim().slice(0, 5000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyMsg("");
      queryClient.invalidateQueries({ queryKey: ["adminTicketReplies", selectedTicket.id] });
      toast.success("Reply sent");
    },
  });

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const { error } = await supabase.from("support_tickets").update({ status }).eq("id", selectedTicket.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTickets"] });
      setSelectedTicket((prev: any) => prev ? { ...prev, status: newStatus } : null);
      toast.success("Status updated");
    },
  });

  if (selectedTicket) {
    return (
      <div>
        <button onClick={() => setSelectedTicket(null)} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tickets
        </button>

        <Card className="border-border/50 mb-4">
          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-semibold">{selectedTicket.subject}</h3>
              <div className="flex items-center gap-2 shrink-0">
                {selectedTicket.is_creator_priority && (
                  <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 text-xs gap-1"><Star className="w-2.5 h-2.5" /> Priority</Badge>
                )}
                <Badge className={cn("text-xs", STATUS_COLORS[selectedTicket.status])}>{selectedTicket.status}</Badge>
              </div>
            </div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-3">{selectedTicket.message}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>User: {selectedTicket.user_id.slice(0, 8)}...</span>
              <span>{selectedTicket.category}</span>
              <span>{formatDistanceToNow(new Date(selectedTicket.created_at), { addSuffix: true })}</span>
            </div>

            {/* Status changer */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50">
              <Select value={newStatus || selectedTicket.status} onValueChange={setNewStatus}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="primary"
                disabled={!newStatus || newStatus === selectedTicket.status || updateStatus.isPending}
                onClick={() => updateStatus.mutate(newStatus)}
              >
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-3 mb-4">
          {repliesLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : replies.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No replies yet</p>
          ) : (
            replies.map((r: any) => (
              <Card key={r.id} className={cn("border-border/50", r.user_id !== selectedTicket.user_id && "border-neon-cyan/20 bg-neon-cyan/5")}>
                <CardContent className="p-4">
                  <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {r.user_id === selectedTicket.user_id ? "User" : "Admin"} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="flex gap-2">
          <Textarea value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Reply as admin..." rows={2} className="flex-1" maxLength={5000} />
          <Button variant="cyan" size="icon" className="shrink-0 self-end" disabled={!replyMsg.trim() || sendReply.isPending} onClick={() => sendReply.mutate()}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold font-sacred mb-6 flex items-center gap-2">
        <Headphones className="w-6 h-6 text-neon-cyan" />
        Support Tickets
      </h1>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {["all", "priority", "open"].map((f) => (
          <Button key={f} variant={filter === f ? "cyan" : "ghost"} size="sm" onClick={() => setFilter(f)} className="capitalize text-xs">
            {f === "priority" && <Star className="w-3 h-3 mr-1" />}
            {f}
          </Button>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="text-left py-3 px-2 font-medium">Subject</th>
                <th className="text-center py-3 px-2 font-medium">Category</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-center py-3 px-2 font-medium">Priority</th>
                <th className="text-center py-3 px-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t: any) => (
                <tr key={t.id} onClick={() => setSelectedTicket(t)} className="border-b border-border/30 hover:bg-muted/20 cursor-pointer">
                  <td className="py-3 px-2 font-medium max-w-[250px] truncate">{t.subject}</td>
                  <td className="py-3 px-2 text-center"><Badge variant="secondary" className="text-xs">{t.category}</Badge></td>
                  <td className="py-3 px-2 text-center"><Badge className={cn("text-xs", STATUS_COLORS[t.status])}>{t.status}</Badge></td>
                  <td className="py-3 px-2 text-center">
                    {t.is_creator_priority && <Star className="w-4 h-4 text-neon-gold mx-auto" />}
                  </td>
                  <td className="py-3 px-2 text-center text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No tickets found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
