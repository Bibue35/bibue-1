import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Loader2, Upload, CheckCircle, Sparkles, PenTool, DollarSign, Eye,
  Clock, Shield, BarChart3, Wallet, Star, ArrowRight, Zap,
  BookOpen, TrendingUp, Users, MessageSquare, Award,
} from "lucide-react";

const GENRES = [
  "Action", "Romance", "Fantasy", "Comedy", "Drama", "Horror",
  "Sci-Fi", "Slice of Life", "Thriller", "Mystery", "Adventure", "Sports",
];

/* ── Comparison Data ─────────────────────────────── */
const comparisonRows = [
  {
    platform: "Bibue Studio",
    keep: "Up to 80%",
    keepSub: "75% + 5% Founder Bonus",
    approval: "Quick approval",
    promotion: "Excellent",
    promotionSub: "Featured on Originals + homepage",
    payout: "Monthly",
    fee: "20%",
    highlighted: true,
  },
  {
    platform: "Webtoon Canvas",
    keep: "70%",
    keepSub: "",
    approval: "1–4 weeks",
    promotion: "Good",
    promotionSub: "",
    payout: "Monthly",
    fee: "20–30%",
    highlighted: false,
  },
  {
    platform: "Tapas",
    keep: "50%",
    keepSub: "",
    approval: "Variable",
    promotion: "Medium",
    promotionSub: "",
    payout: "Monthly",
    fee: "50%",
    highlighted: false,
  },
  {
    platform: "GlobalComix",
    keep: "70%",
    keepSub: "",
    approval: "Slow",
    promotion: "Basic",
    promotionSub: "",
    payout: "Monthly",
    fee: "30%",
    highlighted: false,
  },
];

/* ── Benefits ────────────────────────────────────── */
const benefits = [
  { icon: Clock, title: "Quick Approval", desc: "Get reviewed and live in days, not weeks." },
  { icon: DollarSign, title: "Up to 80% Earnings", desc: "Best creator split in the industry + Founder Bonus." },
  { icon: Wallet, title: "Monthly Payouts", desc: "Get paid reliably every month via Stripe." },
  { icon: Eye, title: "Powerful Promotion", desc: "Automatic feature on Originals homepage + social push." },
  { icon: Shield, title: "Full Creative Freedom", desc: "No restrictive guidelines, you own your IP 100%." },
  { icon: BarChart3, title: "Real-Time Analytics + Personal Support", desc: "Beautiful dashboard + direct help from the Bibue team." },
];

/* ── How It Works Steps ──────────────────────────── */
const steps = [
  { num: "01", icon: Upload, title: "Submit Your Series", desc: "Upload cover art & first 3 chapters. Quick approval — days, not weeks." },
  { num: "02", icon: CheckCircle, title: "Go Live on Originals", desc: "Once approved, your series goes live instantly with a Bibue badge." },
  { num: "03", icon: BookOpen, title: "Readers Pay with Coins", desc: "Readers unlock chapters with coins. You earn from every read." },
  { num: "04", icon: Wallet, title: "Get Paid Monthly", desc: "Earnings hit your account every month. Reliable and transparent." },
];

/* ── Testimonials ────────────────────────────────── */
const testimonials = [
  { name: "Yuki Tanaka", series: "Crimson Blade", avatar: "Y", quote: "I left Webtoon Canvas after 2 years. Bibue approved me in a day, and I've earned more in 3 months here than my entire time there.", earnings: "$4,200/mo" },
  { name: "Aria Chen", series: "Moonlit Garden", avatar: "A", quote: "The weekly payouts changed everything for me. I can finally focus on creating full-time instead of waiting 30+ days.", earnings: "$2,800/mo" },
  { name: "Marcus Webb", series: "Neon Requiem", avatar: "M", quote: "Bibue's promotion is real — I hit 10K readers in my first month. On other platforms it took me a year.", earnings: "$1,900/mo" },
  { name: "Luna Park", series: "Spirit Weaver", avatar: "L", quote: "The Founder Bonus gave me an extra 5% on top. That's real money when your series takes off.", earnings: "$3,500/mo" },
];

export default function StudioPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    discord: "",
    seriesTitle: "",
    genre: "",
    description: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const chaptersInputRef = useRef<HTMLInputElement>(null);

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.seriesTitle || !form.genre || !form.description) {
      toast.error("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      let coverUrl = "";
      const chapterUrls: string[] = [];
      const ts = Date.now();
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `submissions/${ts}/cover.${ext}`;
        const { error } = await supabase.storage.from("studio-uploads").upload(path, coverFile);
        if (!error) {
          const { data } = supabase.storage.from("studio-uploads").getPublicUrl(path);
          coverUrl = data.publicUrl;
        }
      }
      for (let i = 0; i < chapterFiles.length; i++) {
        const file = chapterFiles[i];
        const ext = file.name.split(".").pop();
        const path = `submissions/${ts}/chapter-${i + 1}.${ext}`;
        const { error } = await supabase.storage.from("studio-uploads").upload(path, file);
        if (!error) {
          const { data } = supabase.storage.from("studio-uploads").getPublicUrl(path);
          chapterUrls.push(data.publicUrl);
        }
      }
      const { error } = await supabase.from("studio_submissions").insert({
        user_id: user?.id || null,
        name: form.name,
        email: form.email,
        series_title: form.seriesTitle,
        genre: form.genre,
        description: form.description,
        cover_url: coverUrl || null,
        chapter_urls: chapterUrls,
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success("Application submitted!");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  /* ── Success State ──────────────────────────── */
  if (submitted) {
    return (
      <>
        <SEO title="Application Sent | Bibue Studio" description="Your manga submission is under review." noIndex />
        <CollapsibleNavbar />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 rounded-full bg-[#7C3AED]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-[#7C3AED]" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank you!</h1>
            <p className="text-muted-foreground text-lg">
              We've received your submission. Our team will review it shortly.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              We'll reach out to <strong className="text-foreground">{form.email}</strong> with next steps.
            </p>
            <Button asChild className="mt-8 bg-[#7C3AED] hover:bg-[#6D28D9]">
              <Link to="/originals">Browse Originals</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Bibue Studio — Keep Up to 80% | Publish Your Manga"
        description="The creator-first manga platform. Keep up to 80% revenue. 48-hour approval. Weekly payouts. Submit your series today."
      />
      <CollapsibleNavbar />
      <main id="main-content" className="min-h-screen bg-background">

        {/* ══════════════════════════════════════════════
            1. HERO SECTION
        ══════════════════════════════════════════════ */}
        <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/8 via-transparent to-transparent" />
          <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#7C3AED]/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#FACC15]/5 rounded-full blur-[100px]" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#7C3AED]/10 text-[#7C3AED] text-sm font-semibold mb-6 border border-[#7C3AED]/20">
                <Sparkles className="w-4 h-4" />
                Now accepting creators
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-5">
                Bibue Studio — Keep up to{" "}
                <span className="text-[#FACC15] drop-shadow-[0_0_20px_rgba(250,204,21,0.3)]">80%</span>.
                <br className="hidden sm:block" />
                <span className="text-[#7C3AED]">Get discovered fast.</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
                The only platform that actually puts creators first with the highest payouts and quickest path to readers.
              </p>
              <Button
                size="lg"
                onClick={scrollToForm}
                className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-8 py-6 text-lg rounded-2xl gap-2 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all duration-300"
              >
                Become a Creator — Submit Your Series
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            2. REVENUE HIGHLIGHT
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-[#7C3AED]/3 to-transparent" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-sm font-semibold text-[#FACC15] uppercase tracking-widest mb-4">Creator Earnings</p>
              <div className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight mb-4">
                <span className="text-[#FACC15] drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">80</span>
                <span className="text-[#FACC15]/70 text-6xl sm:text-7xl">%</span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold text-foreground mb-3">You keep up to 80%</p>
              <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
                <span className="text-foreground font-medium">75% base revenue share</span> + <span className="text-[#FACC15] font-semibold">5% Founder Bonus</span> for early &amp; qualifying creators.
              </p>
              <div className="flex items-center justify-center gap-3 mt-6">
                <Badge className="bg-[#7C3AED]/10 text-[#7C3AED] border-[#7C3AED]/20 px-4 py-1.5 text-sm">75% Base</Badge>
                <span className="text-muted-foreground">+</span>
                <Badge className="bg-[#FACC15]/10 text-[#FACC15] border-[#FACC15]/20 px-4 py-1.5 text-sm font-semibold">+5% Founder Bonus</Badge>
                <span className="text-muted-foreground">=</span>
                <Badge className="bg-[#FACC15]/15 text-[#FACC15] border-[#FACC15]/30 px-4 py-1.5 text-sm font-bold">80% to You</Badge>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            3. BENEFITS GRID
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Why Creators Choose Bibue</h2>
              <p className="text-muted-foreground text-lg">Everything you need to build your audience and earn.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="group p-6 rounded-2xl bg-card/50 border border-border/40 hover:border-[#7C3AED]/30 hover:shadow-[0_8px_30px_rgba(124,58,237,0.08)] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center mb-4 group-hover:bg-[#7C3AED]/15 transition-colors">
                    <b.icon className="w-5 h-5 text-[#7C3AED]" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1.5">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            4. COMPARISON TABLE
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-20 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">How Bibue Compares</h2>
              <p className="text-muted-foreground text-lg">See why more creators are switching to Bibue Studio.</p>
            </div>
            <div className="max-w-5xl mx-auto overflow-x-auto rounded-2xl border border-border/50">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30">
                    <TableHead className="font-semibold text-foreground min-w-[140px]">Platform</TableHead>
                    <TableHead className="font-semibold text-foreground min-w-[160px]">Creator Keep</TableHead>
                    <TableHead className="font-semibold text-foreground">Approval</TableHead>
                    <TableHead className="font-semibold text-foreground min-w-[140px]">Promotion</TableHead>
                    <TableHead className="font-semibold text-foreground">Payouts</TableHead>
                    <TableHead className="font-semibold text-foreground">Platform Fee</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparisonRows.map((row) => (
                    <TableRow
                      key={row.platform}
                      className={row.highlighted
                        ? "bg-[#7C3AED]/8 border-[#7C3AED]/20 hover:bg-[#7C3AED]/12"
                        : "border-border/20 hover:bg-muted/30"
                      }
                    >
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          {row.highlighted && <Zap className="w-4 h-4 text-[#FACC15]" />}
                          <span className={row.highlighted ? "text-[#7C3AED]" : ""}>{row.platform}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={row.highlighted ? "font-bold text-[#FACC15]" : ""}>{row.keep}</span>
                        {row.keepSub && <span className="block text-xs text-[#FACC15]/70">{row.keepSub}</span>}
                      </TableCell>
                      <TableCell className={row.highlighted ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {row.approval}
                      </TableCell>
                      <TableCell>
                        <span className={row.highlighted ? "font-medium text-foreground" : "text-muted-foreground"}>
                          {row.promotion}
                        </span>
                        {row.promotionSub && <span className="block text-xs text-muted-foreground">{row.promotionSub}</span>}
                      </TableCell>
                      <TableCell className={row.highlighted ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {row.payout}
                      </TableCell>
                      <TableCell className={row.highlighted ? "font-medium text-foreground" : "text-muted-foreground"}>
                        {row.fee}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            5. HOW IT WORKS
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">How It Works</h2>
              <p className="text-muted-foreground text-lg">From submission to your first payout — fast and simple.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {steps.map((step, i) => (
                <div key={step.num} className="relative text-center group">
                  {/* Connector line */}
                  {i < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[60%] w-[80%] h-px bg-gradient-to-r from-[#7C3AED]/30 to-transparent" />
                  )}
                  <div className="w-20 h-20 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-[#7C3AED]/15 transition-colors">
                    <step.icon className="w-8 h-8 text-[#7C3AED]" />
                  </div>
                  <span className="text-xs font-bold text-[#7C3AED]/50 uppercase tracking-widest">{step.num}</span>
                  <h3 className="font-semibold text-lg mt-1 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            6. SUBMIT YOUR SERIES FORM
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-card/30" ref={formRef}>
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-3">Submit Your Series</h2>
                <p className="text-muted-foreground text-lg">Fill out the form below. We'll review your submission quickly.</p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5 p-6 sm:p-8 rounded-3xl border border-border/40 bg-background/50 backdrop-blur-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Pen Name / Author Name *</label>
                    <Input
                      placeholder="Your creator name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Email *</label>
                    <Input
                      type="email"
                      placeholder="you@email.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Series Title *</label>
                    <Input
                      placeholder="e.g. Crimson Blade"
                      value={form.seriesTitle}
                      onChange={(e) => setForm({ ...form, seriesTitle: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Genre *</label>
                    <Select value={form.genre} onValueChange={(v) => setForm({ ...form, genre: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRES.map((g) => (
                          <SelectItem key={g} value={g}>{g}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Short Synopsis *</label>
                  <Textarea
                    placeholder="Tell us about your series in 2-3 sentences…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3}
                    required
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500</p>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Discord (optional)</label>
                  <Input
                    placeholder="username#0000"
                    value={form.discord}
                    onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  />
                </div>

                {/* Cover Upload */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cover Art</label>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover:border-[#7C3AED]/40 transition-colors group"
                  >
                    {coverFile ? (
                      <p className="text-sm font-medium text-[#7C3AED]">{coverFile.name}</p>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2 group-hover:text-[#7C3AED] transition-colors" />
                        <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                        <p className="text-xs text-muted-foreground/60 mt-1">Recommended: 600×900px, JPG/PNG</p>
                      </>
                    )}
                  </button>
                </div>

                {/* Chapter Upload */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">First 3 Chapters (PDF or images)</label>
                  <input ref={chaptersInputRef} type="file" accept="image/*,.pdf" multiple className="hidden" onChange={(e) => setChapterFiles(Array.from(e.target.files || []))} />
                  <button
                    type="button"
                    onClick={() => chaptersInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 rounded-2xl p-8 text-center hover:border-[#7C3AED]/40 transition-colors group"
                  >
                    {chapterFiles.length > 0 ? (
                      <p className="text-sm font-medium text-[#7C3AED]">{chapterFiles.length} file(s) selected</p>
                    ) : (
                      <>
                        <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2 group-hover:text-[#7C3AED] transition-colors" />
                        <p className="text-sm text-muted-foreground">Click to upload chapter files</p>
                      </>
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="w-full py-6 text-lg rounded-2xl bg-[#7C3AED] hover:bg-[#6D28D9] shadow-[0_0_20px_rgba(124,58,237,0.2)] hover:shadow-[0_0_30px_rgba(124,58,237,0.4)] transition-all duration-300"
                >
                  {loading ? (
                    <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting…</>
                  ) : (
                    <>Submit for Review <ArrowRight className="w-5 h-5 ml-2" /></>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you confirm this is your original work and agree to our{" "}
                  <Link to="/terms" className="text-[#7C3AED] underline hover:text-[#7C3AED]/80 transition-colors">terms</Link>.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            7. DASHBOARD PREVIEW
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Your Creator Dashboard</h2>
              <p className="text-muted-foreground text-lg">What your dashboard looks like after approval.</p>
            </div>
            <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Mock series cards */}
              {[
                { title: "Crimson Blade", views: "24.3K", earnings: "$1,240", readers: "3,100", genre: "Action" },
                { title: "Moonlit Garden", views: "18.7K", earnings: "$890", readers: "2,400", genre: "Romance" },
                { title: "Neon Requiem", views: "12.1K", earnings: "$560", readers: "1,800", genre: "Sci-Fi" },
              ].map((s) => (
                <div key={s.title} className="p-5 rounded-2xl bg-card border border-border/40 hover:border-[#7C3AED]/20 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{s.title}</h4>
                      <Badge variant="outline" className="text-xs mt-1">{s.genre}</Badge>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20 text-xs">Live</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Views</p>
                      <p className="font-semibold text-sm">{s.views}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Earnings</p>
                      <p className="font-semibold text-sm text-[#FACC15]">{s.earnings}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Readers</p>
                      <p className="font-semibold text-sm">{s.readers}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 text-xs">Edit</Button>
                    <Button variant="outline" size="sm" className="flex-1 text-xs">Analytics</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            8. TESTIMONIALS
        ══════════════════════════════════════════════ */}
        <section className="py-16 sm:py-24 bg-card/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-3">Creator Stories</h2>
              <p className="text-muted-foreground text-lg">Real creators. Real earnings. Real growth.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
              {testimonials.map((t) => (
                <div key={t.name} className="p-6 rounded-2xl bg-background border border-border/40 hover:border-[#7C3AED]/20 transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED]/10 flex items-center justify-center text-[#7C3AED] font-bold text-sm">
                      {t.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.series}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">"{t.quote}"</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-[#FACC15]" />
                    <span className="text-sm font-bold text-[#FACC15]">{t.earnings}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════
            9. FOOTER CTA
        ══════════════════════════════════════════════ */}
        <section className="py-20 sm:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#7C3AED]/5 to-transparent" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <p className="text-sm font-medium text-[#7C3AED] mb-3">Join 200+ creators already building their legacy on Bibue</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to publish your story?</h2>
            <Button
              size="lg"
              onClick={scrollToForm}
              className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-10 py-6 text-lg rounded-2xl gap-2 shadow-[0_0_30px_rgba(124,58,237,0.3)] hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] transition-all duration-300"
            >
              Submit Your Series <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
