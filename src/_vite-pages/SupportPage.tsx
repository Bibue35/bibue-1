import { useState } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Headphones, Zap, MessageSquare, Send, Star, Clock,
  ChevronRight, Loader2, CheckCircle, ArrowLeft,
  HelpCircle, Award, Pencil, X, Trash2,
} from "lucide-react";

const CATEGORIES = [
  { value: "bug", label: "🐛 Bug Report" },
  { value: "account", label: "Account Issues" },
  { value: "upload", label: "Upload Issues" },
  { value: "payment", label: "Revenue & Payouts" },
  { value: "technical", label: "Technical" },
  { value: "content_report", label: "Content Report" },
  { value: "feature_request", label: "Feature Request" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-primary/20 text-primary border-primary/30",
  "in-progress": "bg-amber-500/20 text-amber-400 border-amber-500/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const FAQ_ITEMS = [
  { q: "How do I report a bug?", a: "Use the 'Submit Ticket' button above and select 'Bug Report' as the category. Describe the issue in detail and we'll look into it." },
  { q: "How do I upload chapters?", a: "Go to your Creator Dashboard, select a series (or create one), then click 'Add Chapter'. Upload your pages as images (JPG, PNG, or WebP)." },
  { q: "What file formats are supported?", a: "We support JPG, PNG, and WebP image formats. For best quality, use PNG at 800px width minimum." },
  { q: "How does moderation work?", a: "Your first few chapters go through a quick review to ensure quality standards. After 3 approved chapters, your future uploads are auto-approved." },
  { q: "Can I schedule chapter releases?", a: "Yes! In the Creator Dashboard, you can set a scheduled publish date for each chapter." },
  { q: "What content is not allowed?", a: "We prohibit explicit 18+ content, hate speech, AI-generated art, and copyrighted material. See our Terms of Service for details." },
  { q: "How can I delete my account?", a: "Submit a support ticket with the category 'Account Issues' and request account deletion. We'll process it within 48 hours." },
];

// ─── Hooks ───

function useIsCreator() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["isCreator", user?.id],
    queryFn: async () => {
      if (!user) return false;
      const { count } = await supabase
        .from("series")
        .select("id", { count: "exact", head: true })
        .eq("creator_id", user.id);
      return (count || 0) > 0;
    },
    enabled: !!user,
  });
}

function useMyTickets() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["myTickets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
}

function useTicketReplies(ticketId: string | null) {
  return useQuery({
    queryKey: ["ticketReplies", ticketId],
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

// ─── Ticket Form ───

function TicketForm({ isCreator, onSuccess }: { isCreator: boolean; onSuccess: () => void }) {
  const { user } = useAuth();
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !category || !subject.trim() || !message.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("support_tickets").insert({
      user_id: user.id,
      is_creator_priority: isCreator,
      subject: subject.trim().slice(0, 200),
      category,
      message: message.trim().slice(0, 5000),
      status: "open",
    });
    setSubmitting(false);

    if (error) {
      toast.error("Failed to submit ticket");
      return;
    }

    setShowSuccess(true);
    setCategory("");
    setSubject("");
    setMessage("");
    onSuccess();
    setTimeout(() => setShowSuccess(false), 4000);
  };

  if (showSuccess) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Ticket Submitted!</h3>
        <p className="text-muted-foreground">
          {isCreator ? "We'll reply within 24 hours — creator priority." : "We'll get back to you as soon as possible."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreator && (
        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 gap-1">
          <Award className="w-3 h-3" /> Creator Priority — 24h response
        </Badge>
      )}

      <div>
        <label className="text-sm font-medium mb-1.5 block">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Subject</label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Brief summary of your issue"
          maxLength={200}
        />
      </div>

      <div>
        <label className="text-sm font-medium mb-1.5 block">Message</label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe your issue in detail..."
          rows={5}
          maxLength={5000}
        />
      </div>

      <Button
        type="submit"
        className="w-full gap-2"
        disabled={submitting || !category || !subject.trim() || !message.trim()}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {isCreator ? "Submit Priority Ticket" : "Submit Ticket"}
      </Button>
    </form>
  );
}

// ─── Ticket Detail (User View) ───

function TicketDetail({ ticket, onBack, onUpdate }: { ticket: any; onBack: () => void; onUpdate: () => void }) {
  const { user } = useAuth();
  const { data: replies = [], isLoading } = useTicketReplies(ticket.id);
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState(ticket.subject);
  const [editMessage, setEditMessage] = useState(ticket.message);

  const sendReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("ticket_replies").insert({
        ticket_id: ticket.id,
        user_id: user!.id,
        message: replyMessage.trim().slice(0, 5000),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReplyMessage("");
      queryClient.invalidateQueries({ queryKey: ["ticketReplies", ticket.id] });
      toast.success("Reply sent");
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const updateTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("support_tickets")
        .update({
          subject: editSubject.trim().slice(0, 200),
          message: editMessage.trim().slice(0, 5000),
        })
        .eq("id", ticket.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
      toast.success("Ticket updated");
    },
    onError: () => toast.error("Failed to update"),
  });

  const closeTicket = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("support_tickets")
        .update({ status: "closed" })
        .eq("id", ticket.id);
      if (error) throw error;
    },
    onSuccess: () => {
      onUpdate();
      onBack();
      toast.success("Ticket closed");
    },
  });

  const isOpen = ticket.status !== "closed" && ticket.status !== "resolved";

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </button>

      {/* Ticket header */}
      <Card className="border-border/50 mb-6">
        <CardContent className="p-5">
          {isEditing ? (
            <div className="space-y-3">
              <Input
                value={editSubject}
                onChange={(e) => setEditSubject(e.target.value)}
                maxLength={200}
                className="font-semibold"
              />
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={4}
                maxLength={5000}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateTicket.mutate()} disabled={updateTicket.isPending}>
                  Save Changes
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-lg">{ticket.subject}</h3>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={cn("text-xs", STATUS_COLORS[ticket.status])}>{ticket.status}</Badge>
                  {isOpen && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      title="Edit ticket"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{ticket.message}</p>
              <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                <Badge variant="secondary" className="text-xs">{ticket.category}</Badge>
                {ticket.is_creator_priority && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs gap-1">
                    <Star className="w-2.5 h-2.5" /> Priority
                  </Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Conversation thread */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Conversation</h4>
        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
          ) : replies.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-border/50 rounded-xl">
              <MessageSquare className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No replies yet. We'll respond soon.</p>
            </div>
          ) : (
            replies.map((r: any) => {
              const isStaff = r.user_id !== ticket.user_id;
              return (
                <div
                  key={r.id}
                  className={cn(
                    "p-4 rounded-xl",
                    isStaff
                      ? "bg-primary/5 border border-primary/15 ml-4"
                      : "bg-card border border-border/50 mr-4"
                  )}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium">
                      {isStaff ? "Bibue Support" : "You"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{r.message}</p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Reply / Close actions */}
      {isOpen && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <Textarea
              value={replyMessage}
              onChange={(e) => setReplyMessage(e.target.value)}
              placeholder="Write a reply..."
              rows={3}
              className="flex-1"
              maxLength={5000}
            />
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              disabled={!replyMessage.trim() || sendReply.isPending}
              onClick={() => sendReply.mutate()}
            >
              <Send className="w-4 h-4" />
              Send Reply
            </Button>
            <Button
              variant="ghost"
              className="gap-1.5 text-muted-foreground"
              onClick={() => closeTicket.mutate()}
              disabled={closeTicket.isPending}
            >
              <X className="w-4 h-4" />
              Close Ticket
            </Button>
          </div>
        </div>
      )}

      {!isOpen && (
        <div className="text-center py-6 border border-dashed border-border/30 rounded-xl">
          <p className="text-sm text-muted-foreground">This ticket is <strong>{ticket.status}</strong>.</p>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───

export default function SupportPage() {
  const { user } = useAuth();
  const { data: isCreator } = useIsCreator();
  const { data: tickets = [], refetch } = useMyTickets();
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [view, setView] = useState<"tickets" | "faq">("tickets");

  const openTickets = tickets.filter((t: any) => t.status === "open" || t.status === "in-progress");
  const closedTickets = tickets.filter((t: any) => t.status === "closed" || t.status === "resolved");

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Support & Help Center | Bibue"
        description="Get help with your Bibue account, library, and more."
      />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="relative pt-24 pb-8 sm:pt-32 sm:pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sacred tracking-wide leading-tight mb-3">
            Bibue Support
          </h1>
          <p className="text-base text-muted-foreground">
            How can we help?
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-3xl pb-20">
        {/* Tab navigation */}
        <div className="flex gap-1.5 p-1.5 rounded-xl bg-muted/50 mb-8">
          {[
            { id: "tickets" as const, label: `My Tickets${tickets.length ? ` (${tickets.length})` : ""}` },
            { id: "faq" as const, label: "FAQ" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setView(tab.id); setSelectedTicket(null); }}
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                view === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {view === "tickets" && (
          <>
            {/* New Ticket button */}
            {!showForm && !selectedTicket && (
              <div className="mb-8">
                {isCreator ? (
                  <Card className="border-2 border-amber-500/30">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">Creator Priority Support</p>
                          <p className="text-xs text-muted-foreground">24-hour response time</p>
                        </div>
                      </div>
                      <Button size="sm" className="gap-1.5 shrink-0" onClick={() => setShowForm(true)}>
                        <Send className="w-3.5 h-3.5" /> New Ticket
                      </Button>
                    </CardContent>
                  </Card>
                ) : user ? (
                  <Button className="w-full gap-2" onClick={() => setShowForm(true)}>
                    <Send className="w-4 h-4" /> Submit a Ticket
                  </Button>
                ) : (
                  <div className="text-center py-8 border border-dashed border-border/30 rounded-xl">
                    <p className="text-sm text-muted-foreground">Sign in to submit a support ticket.</p>
                  </div>
                )}
              </div>
            )}

            {/* Ticket Form */}
            {showForm && user && (
              <Card className="border-border/50 mb-8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold">New Ticket</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <TicketForm
                    isCreator={!!isCreator}
                    onSuccess={() => {
                      refetch();
                      setTimeout(() => setShowForm(false), 4000);
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Ticket Detail */}
            {selectedTicket ? (
              <TicketDetail
                ticket={selectedTicket}
                onBack={() => setSelectedTicket(null)}
                onUpdate={() => refetch()}
              />
            ) : (
              /* Ticket List */
              user && tickets.length > 0 && !showForm && (
                <div className="space-y-6">
                  {/* Open tickets */}
                  {openTickets.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Open ({openTickets.length})
                      </h3>
                      <div className="space-y-2">
                        {openTickets.map((t: any) => (
                          <TicketRow key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Closed/Resolved tickets */}
                  {closedTickets.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                        Resolved ({closedTickets.length})
                      </h3>
                      <div className="space-y-2">
                        {closedTickets.map((t: any) => (
                          <TicketRow key={t.id} ticket={t} onClick={() => setSelectedTicket(t)} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )
            )}

            {/* Empty state */}
            {user && tickets.length === 0 && !showForm && (
              <div className="text-center py-12">
                <MessageSquare className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No tickets yet. Need help? Submit one above.</p>
              </div>
            )}
          </>
        )}

        {view === "faq" && (
          <Accordion type="single" collapsible className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border border-border/50 rounded-xl px-4 data-[state=open]:border-primary/30">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-4">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-4">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ─── Ticket Row Component ───

function TicketRow({ ticket, onClick }: { ticket: any; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-all flex items-center justify-between gap-3"
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="font-medium text-sm truncate">{ticket.subject}</p>
          {ticket.is_creator_priority && (
            <Star className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{ticket.category}</span>
          <span>·</span>
          <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Badge className={cn("text-xs", STATUS_COLORS[ticket.status])}>{ticket.status}</Badge>
        <ChevronRight className="w-4 h-4 text-muted-foreground" />
      </div>
    </button>
  );
}
