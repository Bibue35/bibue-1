import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Eye,
  Users,
  Calendar,
  Clock,
  Heart,
  Award,
  ArrowRight,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OriginalChapterComments } from "@/components/OriginalChapterComments";

function useSeriesDetail(id: string | undefined) {
  return useQuery({
    queryKey: ["original-series", id],
    queryFn: async () => {
      if (!id) throw new Error("No ID");
      const { data, error } = await supabase
        .from("series")
        .select("*, creator_profiles!inner(display_name, is_verified, user_id, avatar_url)")
        .eq("id", id)
        .eq("status", "approved")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

function useSeriesChapters(seriesId: string | undefined) {
  return useQuery({
    queryKey: ["original-chapters", seriesId],
    queryFn: async () => {
      if (!seriesId) return [];
      const { data, error } = await supabase
        .from("chapters")
        .select("*")
        .eq("series_id", seriesId)
        .eq("status", "approved")
        .order("chapter_number", { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!seriesId,
  });
}

function useRelatedSeries(currentId: string | undefined, genreTags: string[] | null) {
  return useQuery({
    queryKey: ["related-originals", currentId],
    queryFn: async () => {
      const { data } = await supabase
        .from("series")
        .select("*, creator_profiles!inner(display_name)")
        .eq("status", "approved")
        .neq("id", currentId || "")
        .limit(4);
      return data || [];
    },
    enabled: !!currentId,
  });
}

export default function OriginalSeriesDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: series, isLoading } = useSeriesDetail(id);
  const { data: chapters = [] } = useSeriesChapters(id);
  const { data: related = [] } = useRelatedSeries(id, series?.genre_tags);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  const creator = series ? (series as any).creator_profiles : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-24 pb-16 container mx-auto px-4 max-w-4xl space-y-6">
          <Skeleton className="h-[400px] w-full rounded-2xl" />
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-background">
        <CollapsibleNavbar />
        <div className="pt-32 pb-16 container mx-auto px-4 text-center">
          <h1 className="text-2xl font-bold mb-3">Series Not Found</h1>
          <p className="text-muted-foreground mb-6">This series may have been removed or is still under review.</p>
          <Button asChild><Link to="/originals"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Originals</Link></Button>
        </div>
        <Footer />
      </div>
    );
  }

  const lastUpdated = chapters.length > 0
    ? new Date(chapters[chapters.length - 1].published_at || chapters[chapters.length - 1].created_at).toLocaleDateString()
    : new Date(series.created_at).toLocaleDateString();

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${series.title} — Bibue Originals`} description={series.description || `Read ${series.title} on bibue.net`} />
      <CollapsibleNavbar />

      {/* ─── Cover Hero ─── */}
      <section className="relative pt-20">
        {/* Background blur from cover */}
        {series.cover_image_url && (
          <div className="absolute inset-0 h-[500px] overflow-hidden">
            <img src={series.cover_image_url} alt="" className="w-full h-full object-cover blur-3xl opacity-20 scale-110" />
            <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
          </div>
        )}

        <div className="relative container mx-auto px-4 pt-8 sm:pt-12 pb-8 max-w-4xl">
          <Link to="/originals" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
            <ArrowLeft className="w-4 h-4" /> All Originals
          </Link>

          <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
            {/* Cover */}
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="w-48 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-primary/10 border border-border/30">
                {series.cover_image_url ? (
                  <img src={series.cover_image_url} alt={series.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <BookOpen className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 text-center sm:text-left">
              <Badge className="mb-3 bg-primary/10 text-primary border-0 gap-1 text-xs">
                <Award className="w-3 h-3" /> Bibue Original
              </Badge>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-3">
                {series.title}
              </h1>

              {/* Creator */}
              {creator && (
                <Link
                  to={`/creator/${creator.user_id}`}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                  <div className="w-6 h-6 rounded-full bg-muted overflow-hidden">
                    {creator.avatar_url ? (
                      <img src={creator.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-bold">
                        {creator.display_name?.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="font-medium">{creator.display_name}</span>
                  {creator.is_verified && <Award className="w-3.5 h-3.5 text-primary" />}
                </Link>
              )}

              {/* Genre tags */}
              {series.genre_tags && series.genre_tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 justify-center sm:justify-start mb-5">
                  {series.genre_tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs font-normal">
                      {tag}
                    </Badge>
                  ))}
                  <Badge variant="outline" className="text-xs capitalize">{series.content_rating}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{series.reading_direction === "rtl" ? "Right to Left" : "Top to Bottom"}</Badge>
                </div>
              )}

              {/* CTA */}
              {chapters.length > 0 && (
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  <BookOpen className="w-5 h-5" />
                  Read First Chapter
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats Row ─── */}
      <section className="border-y border-border/50 bg-muted/20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-border/50">
            {[
              { icon: Eye, label: "Total Views", value: "—" },
              { icon: Users, label: "Followers", value: "—" },
              { icon: BookOpen, label: "Chapters", value: chapters.length.toString() },
              { icon: Clock, label: "Last Updated", value: lastUpdated },
            ].map((stat) => (
              <div key={stat.label} className="py-4 sm:py-5 px-3 sm:px-4 text-center">
                <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                  <stat.icon className="w-3.5 h-3.5" />
                  <span className="text-[11px] sm:text-xs">{stat.label}</span>
                </div>
                <p className="text-lg sm:text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-8 sm:py-12 space-y-10 sm:space-y-14">
        {/* ─── Description ─── */}
        {series.description && (
          <section>
            <h2 className="text-lg font-semibold mb-4">About this Series</h2>
            <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line max-w-2xl">
              {series.description}
            </div>
          </section>
        )}

        {/* ─── Chapter List ─── */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">{chapters.length} Chapters</h2>
          </div>

          {chapters.length > 0 ? (
            <div className="space-y-1.5">
              {chapters.map((ch) => {
                const isSelected = selectedChapterId === ch.id;
                return (
                  <div key={ch.id}>
                    <button
                      onClick={() => setSelectedChapterId(isSelected ? null : ch.id)}
                      className={cn(
                        "w-full text-left group rounded-xl transition-all duration-200",
                        "px-4 py-3 sm:px-5 sm:py-4",
                        "hover:bg-muted/40 active:scale-[0.99]",
                        isSelected
                          ? "border border-primary/30 bg-primary/5"
                          : "border border-transparent hover:border-border/50"
                      )}
                    >
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={cn(
                          "w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-bold text-sm transition-colors shrink-0",
                          isSelected ? "bg-primary text-primary-foreground" : "bg-muted/50 group-hover:bg-primary/10"
                        )}>
                          {ch.chapter_number}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={cn(
                            "font-medium text-sm truncate transition-colors",
                            isSelected ? "text-primary" : "group-hover:text-primary"
                          )}>
                            {ch.title || `Chapter ${ch.chapter_number}`}
                          </h4>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(ch.published_at || ch.created_at).toLocaleDateString()}
                            </span>
                            <span>{ch.page_count} pages</span>
                          </div>
                        </div>
                        <ChevronRight className={cn(
                          "w-4 h-4 transition-all shrink-0",
                          isSelected ? "text-primary rotate-90" : "text-muted-foreground/40 group-hover:text-primary"
                        )} />
                      </div>
                    </button>

                    {/* Comments for selected chapter */}
                    {isSelected && (
                      <div className="ml-4 sm:ml-6 mt-3 mb-4 pl-4 sm:pl-5 border-l-2 border-primary/20">
                        <OriginalChapterComments chapterId={ch.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No chapters published yet. Check back soon!</p>
            </div>
          )}
        </section>

        {/* ─── Support Creator ─── */}
        <section>
          <Card className="border-border/50 bg-muted/10">
            <CardContent className="p-6 sm:p-8 text-center">
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Support this Creator</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto mb-5">
                Enjoying this series? Tips and support help creators keep publishing.
              </p>
              <Button variant="outline" size="lg" className="gap-2" disabled>
                <Heart className="w-4 h-4" /> Send a Tip — Coming Soon
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* ─── Related Series ─── */}
        {related.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-5">More Originals</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.map((s: any) => (
                <Link key={s.id} to={`/originals/${s.id}`} className="group block">
                  <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-2">
                    {s.cover_image_url ? (
                      <img src={s.cover_image_url} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{s.title}</h4>
                  <p className="text-xs text-muted-foreground">{s.creator_profiles?.display_name}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
}
