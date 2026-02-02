/**
 * Bibue - Anime & Manga Platform
 * Main landing page with diverse anime sections like popular streaming sites
 */
import { FloatingNav } from "@/components/FloatingNav";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { ScheduleSection } from "@/components/ScheduleSection";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useTopAnime, useSeasonalAnime, useTopManga } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, TrendingUp, Sparkles, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

const Index = () => {
  const { data: popularAnime, isLoading: popularLoading } = useTopAnime(1, 'bypopularity');
  const { data: upcomingAnime, isLoading: upcomingLoading } = useTopAnime(1, 'upcoming');
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["seasonalAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["topManga"] });
  }, [queryClient]);

  // Get recommended anime for hero section
  const heroAnime = useMemo(() => {
    if (!seasonalAnime?.length) return [];
    
    const airingAnime = seasonalAnime
      .filter(anime => anime.status === "RELEASING")
      .sort((a, b) => {
        const scoreA = a.score || 0;
        const scoreB = b.score || 0;
        const popA = a.popularity || 999999;
        const popB = b.popularity || 999999;
        
        if (scoreB !== scoreA) return scoreB - scoreA;
        return popA - popB;
      });
    
    return airingAnime.slice(0, 5);
  }, [seasonalAnime, user]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <FloatingNav />
      
      {/* Hero Section */}
      <HeroSection
        featuredAnime={heroAnime.length > 0 ? heroAnime : seasonalAnime?.slice(0, 5)} 
        isLoading={seasonalLoading} 
      />

      {/* Coming Soon Banner */}
      <section className="py-4 sm:py-6 md:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="bg-card border border-border rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 flex items-center justify-center gap-2 sm:gap-3 text-center">
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm md:text-base font-medium text-foreground/90">
              <Badge variant="secondary" className="mr-1.5 sm:mr-2 text-xs">{t("banner.comingSoon")}</Badge>
              <span className="hidden xs:inline">{t("banner.newFeatures")}</span>
              <span className="xs:hidden">New features!</span>
            </span>
            <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-primary hidden sm:block flex-shrink-0" />
          </div>
        </div>
      </section>

      {/* Schedule Section with Day Selector */}
      <ScheduleSection />

      {/* This Season's Hits */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">{t("section.thisSeason")}</h2>
                <p className="font-jp text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">{t("section.thisSeasonJp")}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
              <Link to="/anime?filter=seasonal">
                <span className="hidden xs:inline">{t("section.viewAll")}</span>
                <span className="xs:hidden">All</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {seasonalLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <Skeleton className="aspect-[2/3] rounded-xl sm:rounded-2xl" />
                </div>
              ))
            ) : (
              seasonalAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* Most Popular */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Most Popular</h2>
                <p className="font-jp text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">人気アニメ</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
              <Link to="/rankings?type=anime">
                <span className="hidden xs:inline">{t("section.rankings")}</span>
                <span className="xs:hidden">More</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {popularLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <Skeleton className="aspect-[2/3] rounded-xl sm:rounded-2xl" />
                </div>
              ))
            ) : (
              popularAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Upcoming Anime */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-primary/10">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-tight">Coming Soon</h2>
                <p className="font-jp text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5">近日公開</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
              <Link to="/anime?filter=upcoming">
                <span className="hidden xs:inline">{t("section.viewAll")}</span>
                <span className="xs:hidden">All</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {upcomingLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <Skeleton className="aspect-[2/3] rounded-xl sm:rounded-2xl" />
                </div>
              ))
            ) : (
              upcomingAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="2345678901" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* ===== MANGA SECTION ===== */}
      <section className="py-10 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Manga Section Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Manga</h2>
                <p className="font-jp text-xs sm:text-sm text-muted-foreground">漫画・マンファ・漫画</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
              <Link to="/manga">
                <span className="hidden xs:inline">Browse All</span>
                <span className="xs:hidden">All</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>

          {/* Manga Grid - responsive columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Top Manga Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Top Manga</h3>
                <Link to="/manga" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {topMangaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 rounded-lg sm:rounded-xl" />
                  ))
                ) : (
                  topManga?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhwa Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Top Manhwa</h3>
                <Link to="/manga?filter=manhwa" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {manhwaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 rounded-lg sm:rounded-xl" />
                  ))
                ) : (
                  manhwa?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhua Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">Top Manhua</h3>
                <Link to="/manga?filter=manhua" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {manhuaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 sm:h-20 rounded-lg sm:rounded-xl" />
                  ))
                ) : (
                  manhua?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="3456789012" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      <Footer />
    </PullToRefresh>
  );
};

export default Index;
