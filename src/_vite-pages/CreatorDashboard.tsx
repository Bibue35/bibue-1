import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { FollowersTab } from "@/components/creator/FollowersTab";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  standardizeChapter,
  cleanupStandardizedPages,
  type StandardizedPage,
  type StandardizeResult,
} from "@/lib/imageStandardizer";
import {
  Upload,
  Plus,
  BookOpen,
  BarChart3,
  Eye,
  DollarSign,
  Sparkles,
  Check,
  X,
  FileImage,
  Loader2,
  ArrowLeft,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Flame,
  Award,
  RefreshCw,
  Columns2,
  GripVertical,
  Users,
  Copy,
  ExternalLink,
  Share2,
} from "lucide-react";

type DashboardTab = "overview" | "series" | "upload" | "followers" | "analytics" | "payouts" | "guidelines" | "referrals";
type UploadStep = "select-series" | "guidelines" | "chapter-info" | "upload-pages" | "standardize" | "preview" | "done";

interface PageFile {
  file: File;
  preview: string;
  uploaded: boolean;
  progress: number;
}

type FormatChoice = "standardized" | "original" | "reorder";

/* ─── Content Guidelines ─── */
const CONTENT_RULES = [
  "All work must be 100% original — you own the rights",
  "No sexual content of any kind (including nudity, explicit scenes, or sexual themes)",
  "Gore, violence, horror, dark themes and mature storytelling are welcome and encouraged",
  "No AI-generated art or writing",
  "No hate speech, real-person content, or illegal material",
];

const UPLOAD_STEPS: UploadStep[] = ["select-series", "guidelines", "chapter-info", "upload-pages", "standardize", "preview"];

export default function CreatorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");

  // Creator profile
  const { data: creatorProfile } = useQuery({
    queryKey: ["creator-profile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  // Referrals data
  const { data: referrals = [] } = useQuery({
    queryKey: ["creator-referrals", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("creator_referrals")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  const [linkCopied, setLinkCopied] = useState(false);

  const referralCode = creatorProfile?.referral_code || "";
  const referralLink = referralCode ? `https://bibue.net/for-creators?ref=${referralCode}` : "";

  const copyReferralLink = async () => {
    if (!referralLink) return;
    await navigator.clipboard.writeText(referralLink);
    setLinkCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const referralStats = {
    total: referrals.length,
    uploaded: referrals.filter((r: any) => r.has_uploaded).length,
    activeBonuses: referrals.filter((r: any) => r.bonus_expires_at && new Date(r.bonus_expires_at) > new Date()).length,
  };

  // Series list
  const { data: series = [] } = useQuery({
    queryKey: ["creator-series", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from("series")
        .select("*, chapters(count)")
        .eq("creator_id", user.id)
        .order("updated_at", { ascending: false });
      return data || [];
    },
    enabled: !!user,
  });

  // Upload wizard state
  const [step, setStep] = useState<UploadStep>("select-series");
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState(1);
  const [pages, setPages] = useState<PageFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showNewSeries, setShowNewSeries] = useState(false);
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [guidelinesAccepted, setGuidelinesAccepted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Standardization state
  const [standardizing, setStandardizing] = useState(false);
  const [standardizeProgress, setStandardizeProgress] = useState(0);
  const [standardizeMessage, setStandardizeMessage] = useState("");
  const [standardizeResult, setStandardizeResult] = useState<StandardizeResult | null>(null);
  const [formatChoice, setFormatChoice] = useState<FormatChoice>("standardized");
  const [reorderedPages, setReorderedPages] = useState<StandardizedPage[]>([]);

  // Auto-save
  useEffect(() => {
    if (chapterTitle || chapterNumber > 1) {
      localStorage.setItem("bibue_draft_chapter", JSON.stringify({ chapterTitle, chapterNumber, selectedSeriesId }));
    }
  }, [chapterTitle, chapterNumber, selectedSeriesId]);

  useEffect(() => {
    const draft = localStorage.getItem("bibue_draft_chapter");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.chapterTitle) setChapterTitle(parsed.chapterTitle);
        if (parsed.chapterNumber) setChapterNumber(parsed.chapterNumber);
      } catch {}
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imageFiles = files
      .filter((f) => f.type.startsWith("image/"))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    const newPages: PageFile[] = imageFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      uploaded: false,
      progress: 0,
    }));

    setPages((prev) => [...prev, ...newPages]);
  }, []);

  const removePage = (index: number) => {
    setPages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const createSeries = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (!creatorProfile) {
        await supabase.from("creator_profiles").insert({
          user_id: user.id,
          display_name: newSeriesTitle.slice(0, 20) + "'s Creator",
        });

        // Check for stored referral code and register referral
        const storedRef = localStorage.getItem("bibue_referral_code");
        if (storedRef) {
          const { data: referrer } = await supabase
            .from("creator_profiles")
            .select("user_id")
            .eq("referral_code", storedRef)
            .maybeSingle();

          if (referrer && referrer.user_id !== user.id) {
            await supabase.from("creator_referrals").insert({
              referrer_id: referrer.user_id,
              referred_user_id: user.id,
              referral_code: storedRef,
            }).then(() => localStorage.removeItem("bibue_referral_code"));
          }
        }
      }
      const { data, error } = await supabase
        .from("series")
        .insert({ creator_id: user.id, title: newSeriesTitle, description: newSeriesDesc || null })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setSelectedSeriesId(data.id);
      setShowNewSeries(false);
      setNewSeriesTitle("");
      setNewSeriesDesc("");
      queryClient.invalidateQueries({ queryKey: ["creator-series"] });
      toast.success("Series created!");
      setStep("guidelines");
    },
    onError: (e) => toast.error(e.message),
  });

  /* ─── Standardize ─── */
  const runStandardization = useCallback(async () => {
    if (pages.length === 0) return;
    setStandardizing(true);
    setStandardizeProgress(0);
    setStandardizeMessage("Starting...");

    try {
      const result = await standardizeChapter(
        pages.map((p) => p.file),
        (pct, msg) => {
          setStandardizeProgress(pct);
          setStandardizeMessage(msg);
        }
      );
      setStandardizeResult(result);
      setReorderedPages([...result.pages]);
      setFormatChoice("standardized");
    } catch (err: any) {
      toast.error("Standardization failed: " + (err.message || "Unknown error"));
    } finally {
      setStandardizing(false);
    }
  }, [pages]);

  // Auto-run standardization when entering standardize step
  useEffect(() => {
    if (step === "standardize" && !standardizeResult && !standardizing) {
      runStandardization();
    }
  }, [step, standardizeResult, standardizing, runStandardization]);

  const handleReprocess = () => {
    if (standardizeResult) cleanupStandardizedPages(standardizeResult.pages);
    setStandardizeResult(null);
    setReorderedPages([]);
    runStandardization();
  };

  const movePageInReorder = (from: number, to: number) => {
    setReorderedPages((prev) => {
      const arr = [...prev];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return arr;
    });
  };

  /* ─── Upload ─── */
  const handleUpload = async () => {
    if (!user || !selectedSeriesId || pages.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    const useStandardized = formatChoice === "standardized" || formatChoice === "reorder";
    const finalPages = useStandardized ? (formatChoice === "reorder" ? reorderedPages : standardizeResult?.pages || []) : [];

    try {
      const pageCount = useStandardized ? finalPages.length : pages.length;
      const { data: chapter, error: chapterError } = await supabase
        .from("chapters")
        .insert({
          series_id: selectedSeriesId,
          creator_id: user.id,
          chapter_number: chapterNumber,
          title: chapterTitle || null,
          page_count: pageCount,
          status: "pending",
          format_type: useStandardized ? "standardized" : "original",
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // Upload originals first
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const ext = page.file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${selectedSeriesId}/${chapter.id}/original/page_${String(i + 1).padStart(3, "0")}.${ext}`;
        await supabase.storage.from("creator-uploads").upload(path, page.file, { contentType: page.file.type, upsert: true });
      }

      if (useStandardized) {
        // Upload standardized pages
        for (let i = 0; i < finalPages.length; i++) {
          const sPage = finalPages[i];
          const path = `${user.id}/${selectedSeriesId}/${chapter.id}/standardized/page_${String(i + 1).padStart(3, "0")}.jpg`;
          await supabase.storage.from("creator-uploads").upload(path, sPage.blob, { contentType: "image/jpeg", upsert: true });

          const { data: urlData } = supabase.storage.from("creator-uploads").getPublicUrl(path);
          // Also get original URL
          const origIdx = sPage.sourceIndex;
          const origFile = pages[origIdx];
          const origExt = origFile.file.name.split(".").pop() || "jpg";
          const origPath = `${user.id}/${selectedSeriesId}/${chapter.id}/original/page_${String(origIdx + 1).padStart(3, "0")}.${origExt}`;
          const { data: origUrlData } = supabase.storage.from("creator-uploads").getPublicUrl(origPath);

          await supabase.from("chapter_pages").insert({
            chapter_id: chapter.id,
            page_number: i + 1,
            image_url: urlData.publicUrl,
            original_image_url: origUrlData.publicUrl,
            original_filename: origFile.file.name,
            file_size: sPage.blob.size,
            is_standardized: true,
          });

          setUploadProgress(Math.round(((i + 1) / finalPages.length) * 100));
        }
      } else {
        // Upload original pages as-is
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const ext = page.file.name.split(".").pop() || "jpg";
          const path = `${user.id}/${selectedSeriesId}/${chapter.id}/page_${String(i + 1).padStart(3, "0")}.${ext}`;
          await supabase.storage.from("creator-uploads").upload(path, page.file, { contentType: page.file.type, upsert: true });

          const { data: urlData } = supabase.storage.from("creator-uploads").getPublicUrl(path);

          await supabase.from("chapter_pages").insert({
            chapter_id: chapter.id,
            page_number: i + 1,
            image_url: urlData.publicUrl,
            original_filename: page.file.name,
            file_size: page.file.size,
            is_standardized: false,
          });

          setUploadProgress(Math.round(((i + 1) / pages.length) * 100));
        }
      }

      localStorage.removeItem("bibue_draft_chapter");
      setStep("done");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetWizard = () => {
    if (standardizeResult) cleanupStandardizedPages(standardizeResult.pages);
    setStep("select-series");
    setSelectedSeriesId(null);
    setChapterTitle("");
    setChapterNumber(1);
    setPages([]);
    setUploadProgress(0);
    setGuidelinesAccepted(false);
    setStandardizeResult(null);
    setReorderedPages([]);
    setFormatChoice("standardized");
    setStandardizing(false);
    localStorage.removeItem("bibue_draft_chapter");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access Creator Dashboard</h1>
          <p className="text-muted-foreground">You need to be logged in to upload content.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const TABS: { id: DashboardTab; label: string; icon: typeof BookOpen }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "series", label: "My Series", icon: BookOpen },
    { id: "upload", label: "Upload", icon: Upload },
    { id: "followers", label: "Followers", icon: Users },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
    { id: "payouts", label: "Payouts", icon: CreditCard },
    { id: "guidelines", label: "Guidelines", icon: ShieldCheck },
    { id: "referrals", label: "Referrals", icon: Users },
  ];

  const stepIndex = UPLOAD_STEPS.indexOf(step);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Creator Dashboard | bibue.net" description="Upload and manage your manga, manhwa & manhua series on bibue.net" />
      <CollapsibleNavbar />

      <div className="pt-24 pb-20">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Creator Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your series and track performance</p>
            </div>
            <Badge variant="secondary" className="gap-1.5">
              <Award className="w-3.5 h-3.5 text-primary" />
              {creatorProfile?.is_verified ? "Verified" : "Creator"}
            </Badge>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 max-w-5xl mx-auto">
            {/* Sidebar nav */}
            <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible lg:w-48 shrink-0 pb-2 lg:pb-0">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === "upload") resetWizard(); }}
                  className={cn(
                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                    activeTab === tab.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  <tab.icon className="w-4 h-4 shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              {/* ─── Overview ─── */}
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: "Total Views", value: "—", icon: Eye, color: "text-primary" },
                      { label: "Series", value: series.length, icon: BookOpen, color: "text-primary" },
                      { label: "Est. Earnings", value: "$0.00", icon: DollarSign, color: "text-primary" },
                      { label: "Upload Streak", value: "0 days", icon: Flame, color: "text-primary" },
                    ].map((stat) => (
                      <Card key={stat.label} className="border-border/50 bg-card transition-all hover:border-primary/10">
                        <CardContent className="p-5">
                          <div className="flex items-center gap-2 text-muted-foreground mb-3">
                            <stat.icon className={cn("w-4 h-4", stat.color)} />
                            <span className="text-xs font-medium">{stat.label}</span>
                          </div>
                          <span className="text-2xl font-bold">{stat.value}</span>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <Card className="border-border/50">
                    <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">Ready to upload?</h3>
                        <p className="text-sm text-muted-foreground">Add a new chapter or create a new series.</p>
                      </div>
                      <Button className="gap-2 shrink-0" onClick={() => setActiveTab("upload")}>
                        <Upload className="w-4 h-4" /> Upload New Chapter
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── My Series ─── */}
              {activeTab === "series" && (
                <div className="space-y-4">
                  {series.length > 0 ? (
                    <div className="grid gap-4">
                      {series.map((s: any) => (
                        <Card key={s.id} className="border-border/50 transition-all hover:border-primary/10">
                          <CardContent className="p-5 flex items-center gap-5">
                            <div className="w-16 h-20 rounded-xl bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                              {s.cover_image_url ? (
                                <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover" />
                              ) : (
                                <BookOpen className="w-6 h-6 text-muted-foreground/40" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold truncate">{s.title}</h3>
                              <p className="text-xs text-muted-foreground mt-1">
                                {s.chapters?.[0]?.count || 0} chapters · {s.status}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant={s.status === "approved" ? "default" : "secondary"} className="text-xs">
                                {s.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5"
                                onClick={() => {
                                  setSelectedSeriesId(s.id);
                                  setActiveTab("upload");
                                  setStep("guidelines");
                                }}
                              >
                                <Upload className="w-3.5 h-3.5" /> Upload
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No series yet</h3>
                      <p className="text-sm text-muted-foreground mb-6">Create your first series to start publishing.</p>
                      <Button onClick={() => setActiveTab("upload")} className="gap-2">
                        <Plus className="w-4 h-4" /> Create Series
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* ─── Upload ─── */}
              {activeTab === "upload" && (
                <Card className="border-border/50">
                  <CardContent className="p-6">
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-8">
                      {UPLOAD_STEPS.map((s, i) => {
                        const isDone = stepIndex > i || step === "done";
                        const labels = ["Series", "Guidelines", "Details", "Pages", "Standardize", "Review"];
                        return (
                          <div key={s} className="flex items-center gap-2">
                            <div className="flex flex-col items-center gap-1">
                              <div className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                                step === s ? "bg-primary text-primary-foreground"
                                  : isDone ? "bg-primary/20 text-primary"
                                  : "bg-muted text-muted-foreground"
                              )}>
                                {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                              </div>
                              <span className="text-[10px] text-muted-foreground hidden sm:block">{labels[i]}</span>
                            </div>
                            {i < UPLOAD_STEPS.length - 1 && <div className="w-4 sm:w-6 h-0.5 bg-border mb-4 sm:mb-0" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Step 1: Select Series */}
                    {step === "select-series" && (
                      <div className="space-y-4">
                        <h3 className="font-semibold">Choose a series or create a new one</h3>
                        {series.length > 0 && (
                          <div className="grid gap-2">
                            {series.map((s: any) => (
                              <button
                                key={s.id}
                                onClick={() => { setSelectedSeriesId(s.id); setStep("guidelines"); }}
                                className={cn(
                                  "flex items-center gap-3 p-4 rounded-xl border transition-all text-left",
                                  "hover:border-primary/30 hover:bg-primary/5",
                                  selectedSeriesId === s.id ? "border-primary bg-primary/5" : "border-border/50"
                                )}
                              >
                                <BookOpen className="w-5 h-5 text-primary shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-sm truncate">{s.title}</p>
                                  <p className="text-xs text-muted-foreground">{s.chapters?.[0]?.count || 0} chapters</p>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}

                        {!showNewSeries ? (
                          <Button variant="outline" className="w-full gap-2" onClick={() => setShowNewSeries(true)}>
                            <Plus className="w-4 h-4" /> New Series
                          </Button>
                        ) : (
                          <div className="space-y-3 p-5 rounded-xl border border-border/50 bg-muted/20">
                            <Input placeholder="Series title" value={newSeriesTitle} onChange={(e) => setNewSeriesTitle(e.target.value)} />
                            <Textarea placeholder="Description (optional)" value={newSeriesDesc} onChange={(e) => setNewSeriesDesc(e.target.value)} rows={3} />
                            <div className="flex gap-2">
                              <Button className="flex-1" disabled={!newSeriesTitle.trim() || createSeries.isPending} onClick={() => createSeries.mutate()}>
                                {createSeries.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Series"}
                              </Button>
                              <Button variant="ghost" onClick={() => setShowNewSeries(false)}>Cancel</Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 2: Guidelines Confirmation */}
                    {step === "guidelines" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setStep("select-series")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold">Content Guidelines</h3>
                        </div>

                        <p className="text-sm text-muted-foreground">
                          Please review and confirm you follow these rules before uploading.
                        </p>

                        <div className="space-y-3 p-5 rounded-xl border border-border/50 bg-muted/10">
                          {CONTENT_RULES.map((rule, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <p className="text-sm leading-relaxed">{rule}</p>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5">
                          <Checkbox
                            id="guidelines-confirm"
                            checked={guidelinesAccepted}
                            onCheckedChange={(v) => setGuidelinesAccepted(v === true)}
                          />
                          <Label htmlFor="guidelines-confirm" className="text-sm leading-relaxed cursor-pointer">
                            I confirm my content follows all guidelines above, including <strong>no sexual content</strong> of any kind.
                          </Label>
                        </div>

                        <Button className="w-full" disabled={!guidelinesAccepted} onClick={() => setStep("chapter-info")}>
                          Continue
                        </Button>
                      </div>
                    )}

                    {/* Step 3: Chapter Info */}
                    {step === "chapter-info" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setStep("guidelines")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold">Chapter details</h3>
                          <Badge variant="secondary" className="ml-auto text-xs">Auto-saved</Badge>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Chapter Number</label>
                            <Input type="number" min={1} value={chapterNumber} onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)} />
                          </div>
                          <div>
                            <label className="text-xs font-medium text-muted-foreground mb-1 block">Title (optional)</label>
                            <Input placeholder="e.g. 'The Beginning'" value={chapterTitle} onChange={(e) => setChapterTitle(e.target.value)} />
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => setStep("upload-pages")}>
                          Continue to Upload Pages
                        </Button>
                      </div>
                    )}

                    {/* Step 4: Upload Pages */}
                    {step === "upload-pages" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setStep("chapter-info")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold">Upload your pages</h3>
                        </div>

                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-border/50 rounded-2xl p-10 text-center hover:border-primary/30 hover:bg-primary/5 transition-all group"
                        >
                          <FileImage className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3 group-hover:text-primary transition-colors" />
                          <p className="font-medium text-sm">Click to select images</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP — any format (webtoon strips, individual pages, double-spreads)</p>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

                        {pages.length > 0 && (
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{pages.length} file{pages.length !== 1 ? "s" : ""} selected</p>
                              <Button variant="ghost" size="sm" onClick={() => { pages.forEach((p) => URL.revokeObjectURL(p.preview)); setPages([]); }}>
                                Clear all
                              </Button>
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2">
                              {pages.map((page, i) => (
                                <div key={i} className="shrink-0 w-16 aspect-[2/3] rounded-lg overflow-hidden border border-border/50 relative group">
                                  <img src={page.preview} alt={`File ${i + 1}`} className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => removePage(i)}
                                    className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <X className="w-2.5 h-2.5" />
                                  </button>
                                  <span className="absolute bottom-0.5 left-0.5 text-[10px] font-bold bg-background/80 px-1 rounded">{i + 1}</span>
                                </div>
                              ))}
                            </div>

                            {/* Info about standardization */}
                            <div className="flex items-start gap-3 p-4 rounded-xl border border-primary/10 bg-primary/5">
                              <Columns2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <div className="text-xs text-muted-foreground leading-relaxed">
                                <p className="font-medium text-foreground text-sm mb-1">Automatic Format Standardization</p>
                                <p>Your pages will be automatically converted to the standard vertical scrolling format so readers get the best possible experience on every device. Webtoon strips are split into pages, landscapes are handled, and all images are optimized.</p>
                              </div>
                            </div>

                            <Button className="w-full" onClick={() => { setStandardizeResult(null); setStep("standardize"); }}>
                              Continue — Standardize Format
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 5: Standardize Format */}
                    {step === "standardize" && (
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setStep("upload-pages")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold">Standardize Format</h3>
                        </div>

                        {standardizing && (
                          <div className="space-y-4 py-8">
                            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            </div>
                            <div className="text-center">
                              <p className="font-medium mb-1">Processing your pages...</p>
                              <p className="text-xs text-muted-foreground">{standardizeMessage}</p>
                            </div>
                            <Progress value={standardizeProgress} className="h-2 max-w-xs mx-auto" />
                          </div>
                        )}

                        {!standardizing && standardizeResult && (
                          <div className="space-y-6">
                            {/* Summary */}
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/10">
                              <div className="flex items-center gap-2">
                                <Check className="w-4 h-4 text-primary" />
                                <span className="text-sm font-medium">Standardization complete</span>
                              </div>
                              <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
                                <span>{standardizeResult.originalCount} original → {standardizeResult.standardizedCount} pages</span>
                                {standardizeResult.wasModified && (
                                  <Badge variant="secondary" className="text-[10px]">Modified</Badge>
                                )}
                              </div>
                            </div>

                            {/* Side by side preview */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                              {/* Original */}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">Your Original Upload</p>
                                <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-border/50 bg-muted/10 p-2 space-y-1">
                                  {pages.map((page, i) => (
                                    <div key={i} className="relative">
                                      <img src={page.preview} alt={`Original ${i + 1}`} className="w-full rounded-lg" />
                                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded-full">
                                        {i + 1}/{pages.length}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Standardized */}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2 text-center">
                                  How readers will see it
                                  <Badge variant="secondary" className="ml-2 text-[10px]">Traditional Scrolling</Badge>
                                </p>
                                <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-primary/20 bg-muted/10 p-2 space-y-1">
                                  {(formatChoice === "reorder" ? reorderedPages : standardizeResult.pages).map((page, i) => (
                                    <div key={i} className="relative group">
                                      <img src={page.preview} alt={`Page ${i + 1}`} className="w-full rounded-lg" />
                                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                                        {i + 1}/{formatChoice === "reorder" ? reorderedPages.length : standardizeResult.pages.length}
                                      </span>
                                      {formatChoice === "reorder" && (
                                        <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                          {i > 0 && (
                                            <button onClick={() => movePageInReorder(i, i - 1)} className="p-1 rounded bg-background/80 hover:bg-background text-xs">↑</button>
                                          )}
                                          {i < reorderedPages.length - 1 && (
                                            <button onClick={() => movePageInReorder(i, i + 1)} className="p-1 rounded bg-background/80 hover:bg-background text-xs">↓</button>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Format choice */}
                            <div className="space-y-2">
                              <p className="text-sm font-medium">Choose your format</p>
                              <div className="grid gap-2">
                                {([
                                  { id: "standardized" as FormatChoice, label: "Approve Standardized Version", desc: "Recommended — optimized for all devices", recommended: true },
                                  { id: "original" as FormatChoice, label: "Keep Original Format", desc: "For special artistic cases", recommended: false },
                                  { id: "reorder" as FormatChoice, label: "Manually Reorder Pages", desc: "Hover over pages on the right to move them", recommended: false },
                                ]).map((opt) => (
                                  <button
                                    key={opt.id}
                                    onClick={() => {
                                      setFormatChoice(opt.id);
                                      if (opt.id === "reorder" && reorderedPages.length === 0) {
                                        setReorderedPages([...standardizeResult.pages]);
                                      }
                                    }}
                                    className={cn(
                                      "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
                                      formatChoice === opt.id ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/20"
                                    )}
                                  >
                                    <div className={cn(
                                      "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                                      formatChoice === opt.id ? "border-primary" : "border-muted-foreground/30"
                                    )}>
                                      {formatChoice === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="text-sm font-medium flex items-center gap-2">
                                        {opt.label}
                                        {opt.recommended && <Badge className="text-[10px] bg-primary/10 text-primary border-0">Recommended</Badge>}
                                      </p>
                                      <p className="text-xs text-muted-foreground">{opt.desc}</p>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Re-process */}
                            <div className="flex gap-3">
                              <Button variant="outline" className="gap-2" onClick={handleReprocess}>
                                <RefreshCw className="w-3.5 h-3.5" /> Re-process
                              </Button>
                              <Button className="flex-1" onClick={() => setStep("preview")}>
                                Continue to Review
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 6: Preview */}
                    {step === "preview" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                          <button onClick={() => setStep("standardize")} className="text-muted-foreground hover:text-foreground">
                            <ArrowLeft className="w-4 h-4" />
                          </button>
                          <h3 className="font-semibold">Review before submitting</h3>
                        </div>

                        <div className="rounded-xl border border-border/50 p-5 space-y-2 bg-muted/10">
                          <p className="text-sm"><span className="text-muted-foreground">Chapter:</span> <span className="font-medium">#{chapterNumber}{chapterTitle ? ` — ${chapterTitle}` : ""}</span></p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Format:</span>{" "}
                            <Badge variant="secondary" className="text-xs">
                              {formatChoice === "original" ? "Original" : "Traditional Scrolling"}
                            </Badge>
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Pages:</span>{" "}
                            <span className="font-medium">
                              {formatChoice === "original"
                                ? pages.length
                                : formatChoice === "reorder"
                                ? reorderedPages.length
                                : standardizeResult?.standardizedCount || pages.length}
                            </span>
                          </p>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {(() => {
                            const previewImages = formatChoice === "original"
                              ? pages.map((p) => p.preview)
                              : formatChoice === "reorder"
                              ? reorderedPages.map((p) => p.preview)
                              : (standardizeResult?.pages || []).map((p) => p.preview);

                            return previewImages.slice(0, 8).map((src, i) => (
                              <div key={i} className="shrink-0 w-16 aspect-[2/3] rounded-lg overflow-hidden border border-border/50">
                                <img src={src} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ));
                          })()}
                        </div>

                        {uploading && (
                          <div className="space-y-2">
                            <Progress value={uploadProgress} className="h-2" />
                            <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                          </div>
                        )}

                        <Button className="w-full gap-2" disabled={uploading} onClick={handleUpload}>
                          {uploading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Uploading...</>
                          ) : (
                            <><Upload className="w-4 h-4" /> Submit for Review</>
                          )}
                        </Button>
                      </div>
                    )}

                    {/* Done */}
                    {step === "done" && (
                      <div className="text-center py-12 space-y-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                          <Check className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold">Chapter Submitted!</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                          Your chapter is now under review. You'll be notified once it's approved — usually within 24-48 hours.
                        </p>
                        <div className="flex gap-3 justify-center pt-2">
                          <Button onClick={resetWizard}>Upload Another</Button>
                          <Button variant="outline" onClick={() => setActiveTab("series")}>View Series</Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ─── Analytics ─── */}
              {activeTab === "analytics" && (
                <div className="space-y-6">
                  <Card className="border-border/50">
                    <CardContent className="p-8 text-center">
                      <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                        Views, reader retention, and top-performing chapters — all in one place. Available once you publish your first chapter.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── Payouts ─── */}
              {activeTab === "payouts" && (
                <div className="space-y-6">
                  <Card className="border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg">Revenue Share</h3>
                      <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                        <p>
                          bibue.net first covers all platform costs (hosting, maintenance, payment processing).
                          You receive <strong className="text-foreground">75% of the remaining net revenue</strong>.
                        </p>
                        <div className="flex items-start gap-2 p-4 rounded-xl bg-primary/5 border border-primary/10">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p>
                            <strong className="text-primary">Founding Bonus:</strong> For your first 6 months, you receive 80% total (an extra 5%).
                            This bonus can continue or increase based on series performance.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardContent className="p-6 space-y-4">
                      <h3 className="font-semibold text-lg">Payout Status</h3>
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/30">
                        <DollarSign className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">$0.00 earned</p>
                          <p className="text-xs text-muted-foreground">Start publishing to earn revenue</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* ─── Guidelines ─── */}
              {activeTab === "guidelines" && (
                <Card className="border-border/50">
                  <CardContent className="p-6 space-y-4">
                    <h3 className="font-semibold text-lg">Submission Rules</h3>
                    <div className="space-y-3">
                      {CONTENT_RULES.map((rule, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <ShieldCheck className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p className="text-sm leading-relaxed">{rule}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* ─── Followers ─── */}
              {activeTab === "followers" && (
                <FollowersTab userId={user.id} />
              )}

              {/* ─── Referrals ─── */}
              {activeTab === "referrals" && (
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center py-4">
                    <h2 className="text-xl font-bold mb-2">Invite Creators & Earn Together</h2>
                    <p className="text-sm text-muted-foreground max-w-md mx-auto">
                      When someone signs up using your link and uploads their first series (3+ chapters), both of you get a reward.
                    </p>
                  </div>

                  {/* Referral link box */}
                  {referralLink && (
                    <Card className="border-primary/20 bg-primary/5">
                      <CardContent className="p-6">
                        <p className="text-xs font-medium text-muted-foreground mb-3">Your personal referral link</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-background rounded-xl px-4 py-3 text-sm font-mono truncate border border-border/50">
                            {referralLink}
                          </div>
                          <Button
                            onClick={copyReferralLink}
                            className={cn("gap-2 shrink-0 transition-all", linkCopied && "bg-primary/80")}
                          >
                            {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            {linkCopied ? "Copied!" : "Copy"}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Share buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { label: "Twitter/X", action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I'm publishing my manga on @bibue_net — creators keep 75-80% of revenue. Join with my link: ${referralLink}`)}`, "_blank") },
                      { label: "Reddit", action: () => window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(referralLink)}&title=${encodeURIComponent("Publish your manga on Bibue — creators keep 75-80% of revenue")}`, "_blank") },
                      { label: "Discord", action: () => { navigator.clipboard.writeText(`Hey! I'm publishing my manga on bibue.net — creators keep 75-80% of revenue. Join with my link: ${referralLink}`); toast.success("Message copied for Discord!"); } },
                      { label: "Instagram", action: () => { navigator.clipboard.writeText(referralLink); toast.success("Link copied — paste in your bio!"); } },
                    ].map((btn) => (
                      <Button key={btn.label} variant="outline" size="sm" className="gap-2" onClick={btn.action}>
                        <ExternalLink className="w-3.5 h-3.5" />
                        {btn.label}
                      </Button>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Referrals", value: referralStats.total },
                      { label: "Have Uploaded", value: referralStats.uploaded },
                      { label: "Active Bonuses", value: referralStats.activeBonuses },
                    ].map((stat) => (
                      <Card key={stat.label} className="border-border/50">
                        <CardContent className="p-4 text-center">
                          <p className="text-2xl font-bold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {/* Reward explanation */}
                  <Card className="border-border/50">
                    <CardContent className="p-5 space-y-3">
                      <h3 className="font-semibold text-sm">How rewards work</h3>
                      <div className="grid gap-2 text-sm text-muted-foreground">
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p><strong className="text-foreground">You get:</strong> +5% extra revenue share for 30 days</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p><strong className="text-foreground">They get:</strong> +5% extra revenue share for their first 30 days (80% total)</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Award className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                          <p>Triggered when the referred creator uploads their first series with at least 3 chapters</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Referrals table */}
                  {referrals.length > 0 ? (
                    <Card className="border-border/50">
                      <CardContent className="p-5">
                        <h3 className="font-semibold text-sm mb-4">Your Referrals</h3>
                        <div className="space-y-3">
                          {referrals.map((ref: any) => (
                            <div key={ref.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/20">
                              <div>
                                <p className="text-sm font-medium">Creator</p>
                                <p className="text-xs text-muted-foreground">
                                  Joined {new Date(ref.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="flex items-center gap-3">
                                <Badge variant={ref.has_uploaded ? "default" : "secondary"} className="text-xs">
                                  {ref.has_uploaded ? "Uploaded ✓" : "Pending"}
                                </Badge>
                                {ref.bonus_expires_at && new Date(ref.bonus_expires_at) > new Date() && (
                                  <Badge className="text-xs bg-primary/10 text-primary border-0">+5% Active</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No referrals yet — share your link to get started!</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
