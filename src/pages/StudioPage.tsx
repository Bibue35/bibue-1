import { useState, useRef } from "react";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Upload, CheckCircle, Sparkles, PenTool, DollarSign, Eye } from "lucide-react";

const GENRES = [
  "Action", "Romance", "Fantasy", "Comedy", "Drama", "Horror",
  "Sci-Fi", "Slice of Life", "Thriller", "Mystery", "Adventure", "Sports",
];

export default function StudioPage() {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    seriesTitle: "",
    genre: "",
    description: "",
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [chapterFiles, setChapterFiles] = useState<File[]>([]);
  const coverRef = useRef<HTMLInputElement>(null);
  const chaptersRef = useRef<HTMLInputElement>(null);

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

      // Upload cover
      if (coverFile) {
        const ext = coverFile.name.split(".").pop();
        const path = `submissions/${ts}/cover.${ext}`;
        const { error } = await supabase.storage.from("studio-uploads").upload(path, coverFile);
        if (!error) {
          const { data } = supabase.storage.from("studio-uploads").getPublicUrl(path);
          coverUrl = data.publicUrl;
        }
      }

      // Upload chapters
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

  if (submitted) {
    return (
      <>
        <SEO title="Studio — Application Sent | Bibue" description="Your manga submission is under review." noIndex />
        <CollapsibleNavbar />
        <main className="min-h-screen pt-24 pb-20 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">Thank you!</h1>
            <p className="text-muted-foreground text-lg">
              We've received your submission. Our team will review it within <strong className="text-foreground">48 hours</strong>.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              We'll reach out to <strong className="text-foreground">{form.email}</strong> with next steps.
            </p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SEO
        title="Studio — Publish Your Manga | Bibue"
        description="Apply to publish your manga on Bibue. Keep 90% of your revenue. Get discovered by millions."
      />
      <CollapsibleNavbar />
      <main id="main-content" className="min-h-screen">

        {/* Hero */}
        <section className="pt-28 sm:pt-36 pb-16 sm:pb-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Now accepting creators
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight mb-4">
                Bibue Studio
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-xl mx-auto">
                Publish your manga. Keep <span className="text-primary font-semibold">90%</span>. Get discovered.
              </p>
            </div>

            {/* Perks */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto mt-12">
              {[
                { icon: PenTool, title: "Upload & Publish", desc: "Drag-drop your pages, we handle formatting" },
                { icon: DollarSign, title: "90% Revenue", desc: "Industry-leading creator earnings" },
                { icon: Eye, title: "Get Discovered", desc: "Featured across Bibue's homepage & feeds" },
              ].map((perk) => (
                <div key={perk.title} className="text-center p-5 rounded-2xl bg-card/50 border border-border/30">
                  <perk.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-sm mb-1">{perk.title}</p>
                  <p className="text-xs text-muted-foreground">{perk.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Application Form */}
        <section className="pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-xl mx-auto">
              <h2 className="text-2xl font-bold mb-8 text-center">Apply to Publish</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1.5 block">Your Name *</label>
                    <Input
                      placeholder="Full name"
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

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Series Title *</label>
                  <Input
                    placeholder="e.g. Ichi the Witch"
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

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Short Description *</label>
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

                {/* Cover Upload */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Cover Art</label>
                  <input
                    ref={coverRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                  />
                  <button
                    type="button"
                    onClick={() => coverRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 rounded-2xl p-6 text-center hover:border-primary/40 transition-colors"
                  >
                    {coverFile ? (
                      <p className="text-sm font-medium text-primary">{coverFile.name}</p>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload cover image</p>
                      </>
                    )}
                  </button>
                </div>

                {/* Chapter Upload */}
                <div>
                  <label className="text-sm font-medium mb-1.5 block">First 3 Chapters (PDF or images)</label>
                  <input
                    ref={chaptersRef}
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    className="hidden"
                    onChange={(e) => setChapterFiles(Array.from(e.target.files || []))}
                  />
                  <button
                    type="button"
                    onClick={() => chaptersRef.current?.click()}
                    className="w-full border-2 border-dashed border-border/60 rounded-2xl p-6 text-center hover:border-primary/40 transition-colors"
                  >
                    {chapterFiles.length > 0 ? (
                      <p className="text-sm font-medium text-primary">{chapterFiles.length} file(s) selected</p>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">Click to upload chapter files</p>
                      </>
                    )}
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 text-lg rounded-2xl"
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Submitting…
                    </>
                  ) : (
                    "Submit Application"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By submitting, you confirm this is your original work and agree to our terms.
                </p>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
