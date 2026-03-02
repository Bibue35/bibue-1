import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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
  Headphones, Zap, MessageSquare, Send, Upload, Star, Clock,
  ChevronRight, Loader2, CheckCircle, AlertCircle, ArrowLeft,
  HelpCircle, Sparkles, Award,
} from "lucide-react";

const CATEGORIES = [
  { value: "upload", label: "Upload Issues" },
  { value: "payment", label: "Revenue & Payouts" },
  { value: "technical", label: "Technical" },
  { value: "content_report", label: "Content Report" },
  { value: "series_management", label: "Series Management" },
  { value: "feature_request", label: "Feature Request" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<string, string> = {
  open: "bg-primary/20 text-primary border-primary/30",
  "in-progress": "bg-neon-gold/20 text-neon-gold border-neon-gold/30",
  resolved: "bg-green-500/20 text-green-400 border-green-500/30",
  closed: "bg-muted text-muted-foreground border-border",
};

const FAQ_ITEMS = [
  { q: "How do I become a creator on Bibue?", a: "Head to the For Creators page and click 'Start Uploading Now'. You'll create a creator profile and can start uploading your first chapter immediately. The first 50 creators get a permanent Founding Creator badge!" },
  { q: "When do payouts happen?", a: "Payouts are processed monthly via Stripe or PayPal. Once your earnings reach the minimum threshold, your payout is automatically queued for the next payment cycle." },
  { q: "How much revenue do I keep?", a: "Creators keep 75% of net revenue (80% for Founding Creators in their first 6 months) — one of the highest rates in the industry. This includes ad revenue, tips, and subscription earnings." },
  { q: "How do I upload chapters?", a: "Go to your Creator Dashboard, select a series (or create one), then click 'Add Chapter'. Upload your pages as images (JPG, PNG, or WebP). Your first 100 uploads get instant publishing!" },
  { q: "What file formats are supported for uploads?", a: "We support JPG, PNG, and WebP image formats. For best quality, use PNG at 800px width minimum. WebP is recommended for smaller file sizes with great quality." },
  { q: "How does the moderation process work?", a: "Your first few chapters go through a quick review to ensure quality standards. After 3 approved chapters, your future uploads are auto-approved instantly." },
  { q: "Can I schedule chapter releases?", a: "Yes! In the Creator Dashboard, you can set a scheduled publish date for each chapter. Your readers will see a countdown timer." },
  { q: "What content is not allowed?", a: "We prohibit explicit 18+ content, hate speech, and copyrighted material. We follow a three-strikes policy — see our Terms of Service for full details." },
  { q: "How do I report a bug or issue?", a: "Use the ticket form above! Select 'Technical' as the category and describe the issue in detail. If you're a creator, you'll automatically get priority support." },
  { q: "How can I contact the team directly?", a: "Creators with active series get priority support with direct team access. Submit a priority ticket above and we'll respond within 24 hours." },
];

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
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4 animate-bounce">
          <CheckCircle className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-bold mb-2">Ticket Submitted! 🎉</h3>
        <p className="text-muted-foreground">
          {isCreator ? "We'll reply within 24 hours — creator priority!" : "We'll get back to you as soon as possible."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isCreator && (
        <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 gap-1">
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
        variant={isCreator ? "amber" : "magenta"}
        className="w-full gap-2"
        disabled={submitting || !category || !subject.trim() || !message.trim()}
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {isCreator ? "Submit Priority Ticket" : "Submit Ticket"}
      </Button>
    </form>
  );
}

// ─── Ticket Detail ───
function TicketDetail({ ticket, onBack }: { ticket: any; onBack: () => void }) {
  const { user } = useAuth();
  const { data: replies = [], isLoading } = useTicketReplies(ticket.id);
  const queryClient = useQueryClient();
  const [replyMessage, setReplyMessage] = useState("");

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

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to tickets
      </button>

      <Card className="border-border/50 mb-4">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-semibold">{ticket.subject}</h3>
            <Badge className={cn("text-xs shrink-0", STATUS_COLORS[ticket.status])}>{ticket.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{ticket.message}</p>
          <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
            <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
            <Badge variant="secondary" className="text-xs">{ticket.category}</Badge>
            {ticket.is_creator_priority && (
              <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 text-xs gap-1">
                <Star className="w-2.5 h-2.5" /> Priority
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Replies */}
      <div className="space-y-3 mb-4">
        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
        ) : replies.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No replies yet</p>
        ) : (
          replies.map((r: any) => (
            <Card key={r.id} className={cn("border-border/50", r.user_id !== ticket.user_id && "border-primary/20 bg-primary/5")}>
              <CardContent className="p-4">
                <p className="text-sm whitespace-pre-wrap">{r.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {r.user_id === ticket.user_id ? "You" : "Support Team"} · {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Reply form */}
      {ticket.status !== "closed" && (
        <div className="flex gap-2">
          <Textarea
            value={replyMessage}
            onChange={(e) => setReplyMessage(e.target.value)}
            placeholder="Write a reply..."
            rows={2}
            className="flex-1"
            maxLength={5000}
          />
          <Button
             variant="amber"
            size="icon"
            className="shrink-0 self-end"
            disabled={!replyMessage.trim() || sendReply.isPending}
            onClick={() => sendReply.mutate()}
          >
            <Send className="w-4 h-4" />
          </Button>
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

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Support & Help Center | Bibue"
        description="Get help with your Bibue account, uploads, payouts, and more. Priority support for creators."
      />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.08),transparent_60%)]" />
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-sm gap-1.5 border-primary/30">
            <Headphones className="w-3.5 h-3.5 text-primary" />
            Help Center
          </Badge>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-sacred tracking-wide leading-tight mb-4">
            <span className="text-primary">
              bibue.net Support
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Fast help for creators &amp; readers
          </p>
        </div>
      </section>

      {/* Support Cards */}
      <section className="container mx-auto px-4 pb-12">
        <div className="grid gap-6 max-w-2xl mx-auto grid-cols-1">
          {isCreator ? (
            /* Creator Priority — full width when creator */
            <Card className="border-2 border-neon-gold/40 shadow-[0_0_30px_hsl(48,96%,53%,0.1)]">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-neon-gold/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-neon-gold" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-lg">Creator Priority Support</h3>
                      <Badge className="bg-neon-gold/20 text-neon-gold border-neon-gold/30 text-xs gap-1">
                        <Award className="w-3 h-3" /> Creator
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">Direct access to the team — you're a verified creator</p>
                  </div>
                </div>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-5">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Upload Issues</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Revenue & Payouts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Series Management</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Technical Support</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Account issues</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-neon-gold" /> Feature requests</li>
                </ul>
                <Button
                  variant="amber"
                  className="w-full gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <Send className="w-4 h-4" /> Submit Priority Ticket
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* General Support — no creator priority card shown for non-creators */
            <Card className="border-border/50">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">General Support</h3>
                    <p className="text-xs text-muted-foreground">For all users</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5">
                  Need help with your account, watchlist, or have a question? We're here to help.
                </p>
                <ul className="text-sm text-muted-foreground space-y-1.5 mb-5">
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Account issues</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Bug reports</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Feature requests</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-3.5 h-3.5 text-primary" /> Content reports</li>
                </ul>
                <Button
                  variant="magenta"
                  className="w-full gap-2"
                  onClick={() => setShowForm(true)}
                >
                  <Send className="w-4 h-4" /> Submit Ticket
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* Ticket Form Modal-like section */}
      {showForm && user && (
        <section className="container mx-auto px-4 pb-12">
          <Card className="max-w-2xl mx-auto border-border/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">New Ticket</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
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
        </section>
      )}

      {/* My Tickets */}
      {user && tickets.length > 0 && (
        <section className="container mx-auto px-4 pb-12">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold font-sacred mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary" />
              My Tickets
            </h2>

            {selectedTicket ? (
              <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
            ) : (
              <div className="space-y-2">
                {tickets.map((t: any) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="w-full text-left p-4 rounded-xl border border-border/50 bg-card/50 hover:bg-card/80 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">{t.subject}</p>
                        {t.is_creator_priority && (
                          <Star className="w-3.5 h-3.5 text-neon-gold shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{t.category}</span>
                        <span>·</span>
                        <span>{formatDistanceToNow(new Date(t.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("text-xs", STATUS_COLORS[t.status])}>{t.status}</Badge>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3 border-primary/30">
              <HelpCircle className="w-3 h-3 mr-1 text-primary" />
              FAQ
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold font-sacred">
              Frequently Asked <span className="text-primary">Questions</span>
            </h2>
          </div>

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
        </div>
      </section>

      <Footer />
    </div>
  );
}
