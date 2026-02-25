import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Upload, BookOpen, Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

function useOriginalSeries() {
  return useQuery({
    queryKey: ["originalSeries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*, creator_profiles!inner(display_name, is_verified, user_id)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    },
  });
}

const PLACEHOLDERS = [
  { title: "Your Series Could Be Here", genre: "Action • Fantasy" },
  { title: "Tell Your Story", genre: "Romance • Drama" },
  { title: "Share Your Art", genre: "Sci-Fi • Thriller" },
];

export default function OriginalsPage() {
  const { data: series = [], isLoading } = useOriginalSeries();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Bibue Originals — Exclusive Creator Manga"
        description="Discover exclusive original manga, manhwa & manhua from independent creators on Bibue. Fresh stories updated weekly."
      />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="relative container mx-auto px-4 text-center max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-primary/10">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Bibue Originals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Original Stories from{" "}
            <span className="text-primary">Independent Creators</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Fresh manga, manhwa & manhua — updated weekly by passionate artists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <a href="#originals"><BookOpen className="w-5 h-5" /> Browse Originals</a>
            </Button>
            <Button asChild size="lg" variant="outline" className="gap-2">
              <Link to="/for-creators">Become a Creator <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section id="originals" className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* Real series */}
            {series.map((s) => (
              <Link key={s.id} to={`/originals/${s.id}`} className="group block">
                <Card className="overflow-hidden border-border/50 bg-card transition-all duration-200 hover:scale-[1.02] hover:border-primary/20">
                  <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                    {s.cover_image_url ? (
                      <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 gap-1 text-xs">
                      <Award className="w-3 h-3" /> Founding Creator
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{s.title}</h3>
                    <p className="text-sm text-primary font-medium mb-1">
                      by {(s as any).creator_profiles?.display_name || "Creator"}
                    </p>
                    {s.genre_tags && s.genre_tags.length > 0 && (
                      <p className="text-xs text-muted-foreground">{s.genre_tags.slice(0, 3).join(" • ")}</p>
                    )}
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {s.approved_chapters_count} ch</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}

            {/* Placeholder cards */}
            {(series.length < 3 ? PLACEHOLDERS.slice(0, 3 - series.length) : []).concat(
              series.length === 0 ? PLACEHOLDERS : []
            ).slice(0, series.length === 0 ? 3 : 3 - series.length).map((p, i) => (
              <Link key={`placeholder-${i}`} to="/for-creators" className="group block">
                <Card className="overflow-hidden bg-card transition-all duration-200 hover:scale-[1.02] border-dashed border-border">
                  <div className="aspect-[3/4] bg-muted/20 relative overflow-hidden flex flex-col items-center justify-center gap-4 p-6">
                    <Upload className="w-12 h-12 text-muted-foreground/40" />
                    <p className="text-lg font-bold text-center text-foreground/70">{p.title}</p>
                    <p className="text-sm text-muted-foreground">{p.genre}</p>
                  </div>
                  <CardContent className="p-4 text-center">
                    <Button variant="ghost" className="gap-1 text-sm text-primary">
                      Start Creating <ArrowRight className="w-3 h-3" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
