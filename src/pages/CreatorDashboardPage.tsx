import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCreatorProfile, useCreatorSeries, useCreateSeries, useSeriesChapters, useCreateChapter, useUploadPage } from "@/hooks/useCreator";
import { ContentGuidelines } from "@/components/creator/ContentGuidelines";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, BookOpen, Upload, Calendar, Eye, Clock, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  draft: "secondary",
  pending: "outline",
  approved: "default",
  published: "default",
  rejected: "destructive",
  suspended: "destructive",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  draft: Clock,
  pending: Eye,
  approved: CheckCircle2,
  published: CheckCircle2,
  rejected: XCircle,
  suspended: AlertTriangle,
};

export default function CreatorDashboardPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: creatorProfile, isLoading: profileLoading } = useCreatorProfile();
  const { data: series = [], isLoading: seriesLoading } = useCreatorSeries();

  const [newSeriesOpen, setNewSeriesOpen] = useState(false);
  const [newChapterSeriesId, setNewChapterSeriesId] = useState<string | null>(null);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string | null>(null);

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    navigate("/", { replace: true });
    return null;
  }

  if (!creatorProfile) {
    navigate("/creator/register", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Creator Dashboard - Bibue" description="Manage your series and chapters" url="/creator/dashboard" noIndex />
      <CollapsibleNavbar />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              Creator Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">Welcome back, {creatorProfile.display_name}</p>
            {creatorProfile.strike_count > 0 && (
              <Badge variant="destructive" className="mt-2">
                {creatorProfile.strike_count}/3 Strikes
              </Badge>
            )}
          </div>
          <Dialog open={newSeriesOpen} onOpenChange={setNewSeriesOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" /> New Series</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Series</DialogTitle>
              </DialogHeader>
              <NewSeriesForm onSuccess={() => setNewSeriesOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="series" className="space-y-6">
          <TabsList>
            <TabsTrigger value="series">My Series ({series.length})</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
          </TabsList>

          <TabsContent value="series">
            {seriesLoading ? (
              <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : series.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No series yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first series to start uploading chapters</p>
                  <Button onClick={() => setNewSeriesOpen(true)}><Plus className="h-4 w-4 mr-2" /> Create Series</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {series.map((s: any) => {
                  const StatusIcon = STATUS_ICONS[s.status] || Clock;
                  return (
                    <Card key={s.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-4">
                            {s.cover_image_url && (
                              <img src={s.cover_image_url} alt={s.title} className="w-16 h-24 object-cover rounded" />
                            )}
                            <div>
                              <h3 className="font-semibold text-lg">{s.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">{s.description}</p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant={STATUS_COLORS[s.status] as any}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {s.status}
                                </Badge>
                                <Badge variant="outline">{s.content_rating}</Badge>
                                <Badge variant="outline">{s.language}</Badge>
                              </div>
                              {s.rejection_reason && (
                                <p className="text-sm text-destructive mt-2">Rejected: {s.rejection_reason}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSeriesId(selectedSeriesId === s.id ? null : s.id)}
                            >
                              Chapters
                            </Button>
                            {(s.status === 'published' || s.status === 'approved') && (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" onClick={() => setNewChapterSeriesId(s.id)}>
                                    <Plus className="h-3 w-3 mr-1" /> Chapter
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                  <DialogHeader>
                                    <DialogTitle>Add Chapter to {s.title}</DialogTitle>
                                  </DialogHeader>
                                  <NewChapterForm seriesId={s.id} onSuccess={() => setNewChapterSeriesId(null)} />
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                        {selectedSeriesId === s.id && <ChaptersList seriesId={s.id} />}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="guidelines">
            <ContentGuidelines />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}

function NewSeriesForm({ onSuccess }: { onSuccess: () => void }) {
  const createSeries = useCreateSeries();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentRating, setContentRating] = useState("everyone");
  const [language, setLanguage] = useState("japanese");
  const [readingDirection, setReadingDirection] = useState("rtl");
  const [genreTags, setGenreTags] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const uploadPage = useUploadPage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyrightConfirmed) { toast.error("You must confirm copyright ownership"); return; }
    if (!title.trim()) { toast.error("Title is required"); return; }

    let coverUrl: string | undefined;
    if (coverFile) {
      try {
        const { data: { user } } = await (await import("@/integrations/supabase/client")).supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const path = `${user.id}/covers/${Date.now()}-${coverFile.name}`;
        const { error } = await (await import("@/integrations/supabase/client")).supabase.storage
          .from("creator-uploads")
          .upload(path, coverFile, { upsert: true });
        if (error) throw error;
        const { data } = (await import("@/integrations/supabase/client")).supabase.storage
          .from("creator-uploads")
          .getPublicUrl(path);
        coverUrl = data.publicUrl;
      } catch (err: any) {
        toast.error("Failed to upload cover: " + err.message);
        return;
      }
    }

    await createSeries.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      genre_tags: genreTags.split(",").map(t => t.trim()).filter(Boolean),
      cover_image_url: coverUrl,
      content_rating: contentRating,
      language,
      reading_direction: readingDirection,
    });
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Title *</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={200} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} />
      </div>
      <div className="space-y-2">
        <Label>Genre Tags (comma-separated)</Label>
        <Input value={genreTags} onChange={(e) => setGenreTags(e.target.value)} placeholder="action, fantasy, romance" />
      </div>
      <div className="space-y-2">
        <Label>Cover Image</Label>
        <Input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-2">
          <Label>Rating *</Label>
          <Select value={contentRating} onValueChange={setContentRating}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">Everyone</SelectItem>
              <SelectItem value="teen">Teen (13+)</SelectItem>
              <SelectItem value="mature">Mature (16+)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Language *</Label>
          <Select value={language} onValueChange={(v) => {
            setLanguage(v);
            setReadingDirection(v === "korean" || v === "chinese" ? "ltr" : "rtl");
          }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="japanese">Japanese</SelectItem>
              <SelectItem value="korean">Korean</SelectItem>
              <SelectItem value="chinese">Chinese</SelectItem>
              <SelectItem value="english">English</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Direction</Label>
          <Select value={readingDirection} onValueChange={setReadingDirection}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="rtl">Right-to-Left</SelectItem>
              <SelectItem value="ltr">Left-to-Right</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-start gap-2 pt-4 border-t">
        <Checkbox id="copyright" checked={copyrightConfirmed} onCheckedChange={(v) => setCopyrightConfirmed(v === true)} />
        <Label htmlFor="copyright" className="text-sm cursor-pointer">
          I confirm I own or have rights to this content
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={createSeries.isPending || !copyrightConfirmed}>
        {createSeries.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Create Series
      </Button>
    </form>
  );
}

function NewChapterForm({ seriesId, onSuccess }: { seriesId: string; onSuccess: () => void }) {
  const createChapter = useCreateChapter();
  const { data: chapters = [] } = useSeriesChapters(seriesId);
  const [title, setTitle] = useState("");
  const [chapterNumber, setChapterNumber] = useState((chapters.length + 1).toString());
  const [isDraft, setIsDraft] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [copyrightConfirmed, setCopyrightConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const uploadPage = useUploadPage();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter(f => {
      if (f.size > 2 * 1024 * 1024) { toast.error(`${f.name} exceeds 2MB limit`); return false; }
      if (!["image/jpeg", "image/png", "image/webp"].includes(f.type)) { toast.error(`${f.name}: unsupported format`); return false; }
      return true;
    });
    setFiles(prev => [...prev, ...valid]);
  };

  const removeFile = (idx: number) => setFiles(prev => prev.filter((_, i) => i !== idx));

  const moveFile = (idx: number, dir: -1 | 1) => {
    setFiles(prev => {
      const arr = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= arr.length) return arr;
      [arr[idx], arr[target]] = [arr[target], arr[idx]];
      return arr;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copyrightConfirmed) { toast.error("Confirm copyright ownership"); return; }
    if (files.length === 0) { toast.error("Upload at least one page"); return; }

    setUploading(true);
    try {
      const chapter = await createChapter.mutateAsync({
        series_id: seriesId,
        chapter_number: parseInt(chapterNumber),
        title: title.trim() || undefined,
        status: isDraft ? "draft" : "pending",
        scheduled_publish_at: scheduledDate || null,
      });

      // Upload pages
      const { supabase } = await import("@/integrations/supabase/client");
      for (let i = 0; i < files.length; i++) {
        const url = await uploadPage.mutateAsync({
          file: files[i],
          seriesId,
          chapterNum: parseInt(chapterNumber),
          pageNum: i + 1,
        });
        await supabase.from("chapter_pages").insert({
          chapter_id: chapter.id,
          page_number: i + 1,
          image_url: url,
          original_filename: files[i].name,
          file_size: files[i].size,
        });
      }

      // Update page count
      await supabase.from("chapters").update({ page_count: files.length }).eq("id", chapter.id);
      
      toast.success("Chapter uploaded!");
      onSuccess();
    } catch (err: any) {
      toast.error("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Chapter # *</Label>
          <Input type="number" min={1} value={chapterNumber} onChange={(e) => setChapterNumber(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Chapter title" />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Pages (JPG/PNG/WebP, max 2MB each)</Label>
        <Input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFileChange} />
        {files.length > 0 && (
          <div className="space-y-1 mt-2 max-h-40 overflow-y-auto">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm p-1 rounded bg-muted/50">
                <span className="text-muted-foreground w-6 text-center">{i + 1}</span>
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-muted-foreground">{(f.size / 1024).toFixed(0)}KB</span>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveFile(i, -1)} disabled={i === 0}>↑</Button>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}>↓</Button>
                <Button type="button" variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => removeFile(i)}>×</Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Checkbox id="draft" checked={isDraft} onCheckedChange={(v) => setIsDraft(v === true)} />
          <Label htmlFor="draft" className="text-sm cursor-pointer">Save as draft</Label>
        </div>
      </div>

      {!isDraft && (
        <div className="space-y-2">
          <Label className="flex items-center gap-1"><Calendar className="h-3 w-3" /> Schedule (optional)</Label>
          <Input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} />
        </div>
      )}

      <div className="flex items-start gap-2 pt-4 border-t">
        <Checkbox id="ch-copyright" checked={copyrightConfirmed} onCheckedChange={(v) => setCopyrightConfirmed(v === true)} />
        <Label htmlFor="ch-copyright" className="text-sm cursor-pointer">
          I confirm I own or have rights to this content
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={uploading || createChapter.isPending || !copyrightConfirmed || files.length === 0}>
        {(uploading || createChapter.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {isDraft ? "Save Draft" : "Submit for Review"}
      </Button>
    </form>
  );
}

function ChaptersList({ seriesId }: { seriesId: string }) {
  const { data: chapters = [], isLoading } = useSeriesChapters(seriesId);

  if (isLoading) return <div className="py-4 flex justify-center"><Loader2 className="h-4 w-4 animate-spin" /></div>;

  if (chapters.length === 0) return <p className="text-sm text-muted-foreground py-4">No chapters yet</p>;

  return (
    <div className="mt-4 border-t pt-4 space-y-2">
      {chapters.map((ch: any) => {
        const StatusIcon = STATUS_ICONS[ch.status] || Clock;
        return (
          <div key={ch.id} className="flex items-center justify-between p-2 rounded bg-muted/30">
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-muted-foreground">Ch. {ch.chapter_number}</span>
              <span className="text-sm">{ch.title || `Chapter ${ch.chapter_number}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{ch.page_count} pages</span>
              <Badge variant={STATUS_COLORS[ch.status] as any} className="text-xs">
                <StatusIcon className="h-3 w-3 mr-1" />
                {ch.status}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
