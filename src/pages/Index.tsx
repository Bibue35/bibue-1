/**
 * Bibue - Anime & Manga Platform
 * Main landing page with diverse anime sections like popular streaming sites
 */
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { ScheduleSection } from "@/components/ScheduleSection";
import { useTopAnime, useSeasonalAnime, useTopManga } from "@/hooks/useAnimeData";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, TrendingUp, Sparkles, Clock, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo } from "react";

const Index = () => {
  const { data: popularAnime, isLoading: popularLoading } = useTopAnime(1, 'bypopularity');
  const { data: upcomingAnime, isLoading: upcomingLoading } = useTopAnime(1, 'upcoming');
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
  const { t } = useLanguage();
  const { user } = useAuth();

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
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      
      {/* Hero Section */}
      <HeroSection
        featuredAnime={heroAnime.length > 0 ? heroAnime : seasonalAnime?.slice(0, 5)} 
        isLoading={seasonalLoading} 
      />

      {/* Coming Soon Banner */}
      <section className="py-6 sm:py-8">
        <div className="container mx-auto px-4">
          <div className="liquid-glass rounded-2xl p-4 sm:p-5 flex items-center justify-center gap-3 text-center">
            <Rocket className="w-5 h-5 text-primary animate-pulse" />
            <span className="text-sm sm:text-base font-medium text-foreground/90">
              <Badge variant="secondary" className="mr-2">{t("banner.comingSoon")}</Badge>
              {t("banner.newFeatures")}
              <span className="ml-2 text-primary font-semibold">March 15</span>
            </span>
            <Rocket className="w-5 h-5 text-primary animate-pulse hidden sm:block" />
          </div>
        </div>
      </section>

      {/* Schedule Section with Day Selector */}
      <ScheduleSection />

      {/* This Season's Hits */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">{t("section.thisSeason")}</h2>
                <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">{t("section.thisSeasonJp")}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/anime?filter=seasonal">
                {t("section.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {seasonalLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              seasonalAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container mx-auto px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-8" />
      </div>

      {/* Most Popular */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Most Popular</h2>
                <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">人気アニメ</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/rankings?type=anime">
                {t("section.rankings")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {popularLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              popularAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Upcoming Anime */}
      <section className="py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">Coming Soon</h2>
                <p className="font-jp text-xs sm:text-sm text-muted-foreground mt-0.5">近日公開</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/anime?filter=upcoming">
                {t("section.viewAll")} <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <HorizontalScroll title="" titleJp="">
            {upcomingLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              upcomingAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Ad Unit */}
      <div className="container mx-auto px-4">
        <AdUnit slot="2345678901" format="horizontal" className="my-8" />
      </div>

      {/* ===== MANGA SECTION ===== */}
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4">
          {/* Manga Section Header */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BookOpen className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Manga</h2>
                <p className="font-jp text-sm text-muted-foreground">漫画・マンファ・漫画</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 glass-button" asChild>
              <Link to="/manga">
                Browse All <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          {/* Manga Grid - 3 columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Top Manga Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Manga</h3>
                <Link to="/manga" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-3">
                {topMangaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))
                ) : (
                  topManga?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhwa Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Manhwa</h3>
                <Link to="/manga?filter=manhwa" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-3">
                {manhwaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))
                ) : (
                  manhwa?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhua Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Top Manhua</h3>
                <Link to="/manga?filter=manhua" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-3">
                {manhuaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
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
      <div className="container mx-auto px-4">
        <AdUnit slot="3456789012" format="horizontal" className="my-8" />
      </div>

      <Footer />
    </div>
  );
};

export default Index;
