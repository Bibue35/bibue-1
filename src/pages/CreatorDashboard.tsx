import { useState, useCallback, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Upload,
  Plus,
  Image as ImageIcon,
  BookOpen,
  BarChart3,
  Eye,
  Heart,
  DollarSign,
  Sparkles,
  Check,
  X,
  GripVertical,
  FileImage,
  Loader2,
  ArrowLeft,
} from "lucide-react";

type UploadStep = "select-series" | "chapter-info" | "upload-pages" | "preview" | "done";

interface PageFile {
  file: File;
  preview: string;
  uploaded: boolean;
  progress: number;
}

export default function CreatorDashboard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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

  // Series list
  const { data: series } = useQuery({
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-save chapter info to localStorage
  useEffect(() => {
    if (chapterTitle || chapterNumber > 1) {
      localStorage.setItem("bibue_draft_chapter", JSON.stringify({ chapterTitle, chapterNumber, selectedSeriesId }));
    }
  }, [chapterTitle, chapterNumber, selectedSeriesId]);

  // Restore draft
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
      // Ensure creator profile exists
      if (!creatorProfile) {
        await supabase.from("creator_profiles").insert({
          user_id: user.id,
          display_name: newSeriesTitle.slice(0, 20) + "'s Creator",
        });
      }
      const { data, error } = await supabase
        .from("series")
        .insert({
          creator_id: user.id,
          title: newSeriesTitle,
          description: newSeriesDesc || null,
        })
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
      setStep("chapter-info");
    },
    onError: (e) => toast.error(e.message),
  });

  const handleUpload = async () => {
    if (!user || !selectedSeriesId || pages.length === 0) return;
    setUploading(true);
    setUploadProgress(0);

    try {
      // 1. Create chapter
      const { data: chapter, error: chapterError } = await supabase
        .from("chapters")
        .insert({
          series_id: selectedSeriesId,
          creator_id: user.id,
          chapter_number: chapterNumber,
          title: chapterTitle || null,
          page_count: pages.length,
          status: "pending",
        })
        .select()
        .single();

      if (chapterError) throw chapterError;

      // 2. Upload pages
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const ext = page.file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${selectedSeriesId}/${chapter.id}/page_${String(i + 1).padStart(3, "0")}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("creator-uploads")
          .upload(path, page.file, { contentType: page.file.type, upsert: true });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: urlData } = supabase.storage
          .from("creator-uploads")
          .getPublicUrl(path);

        // Insert page record
        await supabase.from("chapter_pages").insert({
          chapter_id: chapter.id,
          page_number: i + 1,
          image_url: urlData.publicUrl,
          original_filename: page.file.name,
          file_size: page.file.size,
        });

        setPages((prev) => prev.map((p, idx) => (idx === i ? { ...p, uploaded: true, progress: 100 } : p)));
        setUploadProgress(Math.round(((i + 1) / pages.length) * 100));
      }

      localStorage.removeItem("bibue_draft_chapter");
      toast.success("Chapter uploaded successfully! 🎉");
      setStep("done");
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetWizard = () => {
    setStep("select-series");
    setSelectedSeriesId(null);
    setChapterTitle("");
    setChapterNumber(1);
    setPages([]);
    setUploadProgress(0);
    localStorage.removeItem("bibue_draft_chapter");
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-24 pb-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Sign in to access Creator Dashboard</h1>
          <p className="text-muted-foreground">You need to be logged in to upload content.</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Creator Dashboard | bibue.net" description="Upload and manage your manga, manhwa & manhua series on bibue.net" />
      <CollapsibleNavbar />

      <div className="pt-20 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold font-sacred">Creator Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Upload and manage your series</p>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="w-3 h-3 text-primary" />
              Creator
            </Badge>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[
              { label: "Series", value: series?.length || 0, icon: BookOpen },
              { label: "Total Views", value: "—", icon: Eye },
              { label: "Likes", value: "—", icon: Heart },
              { label: "Earnings", value: "$0.00", icon: DollarSign },
            ].map((stat) => (
              <Card key={stat.label} className="border-border/50">
                <CardContent className="p-4 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <stat.icon className="w-3.5 h-3.5" />
                    <span className="text-xs">{stat.label}</span>
                  </div>
                  <span className="text-xl font-bold">{stat.value}</span>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Upload Wizard */}
          <Card className="border-primary/10 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Upload className="w-5 h-5 text-primary" />
                Upload Chapter
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-6">
                {(["select-series", "chapter-info", "upload-pages", "preview"] as UploadStep[]).map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                        step === s
                          ? "bg-primary text-primary-foreground"
                          : (["select-series", "chapter-info", "upload-pages", "preview"].indexOf(step) > i || step === "done")
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {(["select-series", "chapter-info", "upload-pages", "preview"].indexOf(step) > i || step === "done") ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        i + 1
                      )}
                    </div>
                    {i < 3 && <div className="w-8 h-0.5 bg-border" />}
                  </div>
                ))}
              </div>

              {/* Step 1: Select Series */}
              {step === "select-series" && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose a series or create a new one.</p>
                  
                  {series && series.length > 0 && (
                    <div className="grid gap-2">
                      {series.map((s: any) => (
                        <button
                          key={s.id}
                          onClick={() => { setSelectedSeriesId(s.id); setStep("chapter-info"); }}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border transition-all text-left",
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
                      <Plus className="w-4 h-4" />
                      New Series
                    </Button>
                  ) : (
                    <div className="space-y-3 p-4 rounded-xl border border-border/50 bg-muted/20">
                      <Input
                        placeholder="Series title"
                        value={newSeriesTitle}
                        onChange={(e) => setNewSeriesTitle(e.target.value)}
                      />
                      <Textarea
                        placeholder="Description (optional)"
                        value={newSeriesDesc}
                        onChange={(e) => setNewSeriesDesc(e.target.value)}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          className="flex-1"
                          disabled={!newSeriesTitle.trim() || createSeries.isPending}
                          onClick={() => createSeries.mutate()}
                        >
                          {createSeries.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Series"}
                        </Button>
                        <Button variant="ghost" onClick={() => setShowNewSeries(false)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Chapter Info */}
              {step === "chapter-info" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setStep("select-series")} className="text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-muted-foreground">Chapter details</p>
                    <Badge variant="secondary" className="ml-auto text-xs">Auto-saved</Badge>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Chapter Number</label>
                      <Input
                        type="number"
                        min={1}
                        value={chapterNumber}
                        onChange={(e) => setChapterNumber(parseInt(e.target.value) || 1)}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-1 block">Title (optional)</label>
                      <Input
                        placeholder="e.g. 'The Beginning'"
                        value={chapterTitle}
                        onChange={(e) => setChapterTitle(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button variant="primary" className="w-full" onClick={() => setStep("upload-pages")}>
                    Continue to Upload Pages
                  </Button>
                </div>
              )}

              {/* Step 3: Upload Pages */}
              {step === "upload-pages" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setStep("chapter-info")} className="text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-muted-foreground">Upload your pages (images sorted by filename)</p>
                  </div>

                  {/* Drop zone */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/50 rounded-2xl p-8 text-center hover:border-primary/30 hover:bg-primary/5 transition-all group"
                  >
                    <FileImage className="w-10 h-10 text-muted-foreground mx-auto mb-3 group-hover:text-primary transition-colors" />
                    <p className="font-medium text-sm">Click to select images</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP — sorted automatically by filename</p>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Page previews */}
                  {pages.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{pages.length} page{pages.length !== 1 ? "s" : ""}</p>
                        <Button variant="ghost" size="sm" onClick={() => { pages.forEach((p) => URL.revokeObjectURL(p.preview)); setPages([]); }}>
                          Clear all
                        </Button>
                      </div>
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {pages.map((page, i) => (
                          <div key={i} className="relative group aspect-[2/3] rounded-lg overflow-hidden border border-border/50 bg-muted">
                            <img src={page.preview} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button onClick={() => removePage(i)} className="p-1 rounded-full bg-destructive text-destructive-foreground">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 right-1 text-[10px] font-bold bg-background/80 px-1.5 py-0.5 rounded">
                              {i + 1}
                            </span>
                            {page.uploaded && (
                              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <Button variant="primary" className="w-full" onClick={() => setStep("preview")}>
                        Review & Publish
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Preview */}
              {step === "preview" && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <button onClick={() => setStep("upload-pages")} className="text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm text-muted-foreground">Review before publishing</p>
                  </div>

                  <div className="rounded-xl border border-border/50 p-4 space-y-2 bg-muted/20">
                    <p className="text-sm"><span className="text-muted-foreground">Chapter:</span> <span className="font-medium">#{chapterNumber}{chapterTitle ? ` — ${chapterTitle}` : ""}</span></p>
                    <p className="text-sm"><span className="text-muted-foreground">Pages:</span> <span className="font-medium">{pages.length}</span></p>
                  </div>

                  {/* Scrollable page preview */}
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {pages.slice(0, 8).map((page, i) => (
                      <div key={i} className="shrink-0 w-20 aspect-[2/3] rounded-lg overflow-hidden border border-border/50">
                        <img src={page.preview} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {pages.length > 8 && (
                      <div className="shrink-0 w-20 aspect-[2/3] rounded-lg border border-border/50 flex items-center justify-center bg-muted">
                        <span className="text-xs font-medium">+{pages.length - 8}</span>
                      </div>
                    )}
                  </div>

                  {uploading && (
                    <div className="space-y-2">
                      <Progress value={uploadProgress} className="h-2" />
                      <p className="text-xs text-center text-muted-foreground">Uploading... {uploadProgress}%</p>
                    </div>
                  )}

                  <Button
                    variant="primary"
                    className="w-full gap-2"
                    disabled={uploading}
                    onClick={handleUpload}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        Publish Chapter
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Done */}
              {step === "done" && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Chapter Published! 🎉</h3>
                  <p className="text-sm text-muted-foreground">Your chapter is now live for readers to enjoy.</p>
                  <div className="flex gap-3 justify-center">
                    <Button variant="primary" onClick={resetWizard}>Upload Another</Button>
                    <Button variant="outline" asChild>
                      <Link to="/for-creators">Creator Perks</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Existing Series */}
          {series && series.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">Your Series</h2>
              <div className="grid gap-3">
                {series.map((s: any) => (
                  <Card key={s.id} className="border-border/50">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        {s.cover_image_url ? (
                          <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <BookOpen className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{s.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.chapters?.[0]?.count || 0} chapters · {s.status}
                        </p>
                      </div>
                      <Badge variant={s.status === "approved" ? "default" : "secondary" } className="text-xs shrink-0">
                        {s.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
