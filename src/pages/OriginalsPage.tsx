import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Award, Upload, BookOpen, Eye, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

function useOriginalSeries() {
  return useQuery({
    queryKey: ["originalSeries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("series")
        .select("*, creator_profiles!inner(display_name, is_verified, user_id)")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });
}

export default function OriginalsPage() {
  const { data: series = [], isLoading } = useOriginalSeries();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Community Originals — Real Stories by Real Creators"
        description="Discover original manga, manhwa & manhua from independent creators on bibue.net."
      />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="p-2 rounded-xl bg-primary/10">
              <Award className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-muted-foreground">Bibue Originals</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-tight mb-4">
            Community Originals —{" "}
            <span className="text-primary">Real Stories by Real Creators</span>
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto mb-8">
            Original manga, manhwa & manhua updated by passionate independent artists.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild size="lg" className="gap-2">
              <Link to="/manga">Browse All <ArrowRight className="w-4 h-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Series Grid */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-border/50 bg-card">
                  <div className="aspect-[3/4] bg-muted skeleton-shimmer" />
                  <CardContent className="p-5 space-y-3">
                    <div className="h-5 w-3/4 bg-muted skeleton-shimmer rounded" />
                    <div className="h-4 w-1/2 bg-muted skeleton-shimmer rounded" />
                    <div className="h-3 w-2/3 bg-muted skeleton-shimmer rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : series.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {series.map((s) => (
                <Link key={s.id} to={`/originals/${s.id}`} className="group block">
                  <Card className="overflow-hidden border-border/50 bg-card transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5">
                    <div className="aspect-[3/4] bg-muted relative overflow-hidden">
                      {s.cover_image_url ? (
                        <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground border-0 gap-1 text-xs">
                        <Award className="w-3 h-3" /> Founding Creator
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">{s.title}</h3>
                      <Link to={`/creator/${(s as any).creator_profiles?.user_id}`} className="text-sm text-primary font-medium mb-2 block hover:underline" onClick={(e) => e.stopPropagation()}>
                        by {(s as any).creator_profiles?.display_name || "Creator"}
                      </Link>
                      {s.genre_tags && s.genre_tags.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-3">{s.genre_tags.slice(0, 3).join(" • ")}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {s.approved_chapters_count} ch</span>
                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> —</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            /* Empty state */
            <div className="max-w-lg mx-auto text-center py-16">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Upload className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Coming Soon</h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Original series are on their way. Check back soon for fresh manga, manhwa &amp; manhua by independent creators.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
