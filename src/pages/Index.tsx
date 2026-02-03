/**
 * Bibue - Anime & Manga Platform
 * Main landing page with modern mobile-first design
 */
import { FloatingNav } from "@/components/FloatingNav";
import { HeroSection } from "@/components/HeroSection";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { MobileAnimeCard } from "@/components/MobileAnimeCard";
import { FeaturedCarousel } from "@/components/FeaturedCarousel";
import { ContentSection } from "@/components/ContentSection";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { ScheduleSection } from "@/components/ScheduleSection";
import { PullToRefresh } from "@/components/PullToRefresh";
import { useTopAnime, useSeasonalAnime, useTopManga, useClassicAnime, useAllTimeTopAnime, useTrendingManhwa, useTrendingManhua } from "@/hooks/useAnimeData";
import { CardSkeleton, CardSkeletonRow, HeroSkeleton } from "@/components/skeletons";
import { Link } from "react-router-dom";
import { ArrowRight, Rocket, TrendingUp, Sparkles, Clock, BookOpen, Flame, History, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  const { data: popularAnime, isLoading: popularLoading } = useTopAnime(1, 'bypopularity');
  const { data: upcomingAnime, isLoading: upcomingLoading } = useTopAnime(1, 'upcoming');
  const { data: airingAnime, isLoading: airingLoading } = useTopAnime(1, 'airing');
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: topManga, isLoading: topMangaLoading } = useTopManga(1);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
  const { data: classicAnime, isLoading: classicLoading } = useClassicAnime(1);
  const { data: allTimeTop, isLoading: allTimeLoading } = useAllTimeTopAnime(1);
  const { data: trendingManhwa, isLoading: trendingManhwaLoading } = useTrendingManhwa(1);
  const { data: trendingManhua, isLoading: trendingManhuaLoading } = useTrendingManhua(1);
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["seasonalAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["topManga"] });
    await queryClient.invalidateQueries({ queryKey: ["classicAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["allTimeTopAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhua"] });
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
    <>
      <FloatingNav />
      <PullToRefresh onRefresh={handleRefresh}>
      
      {/* Hero Section - Use FeaturedCarousel on mobile for cleaner look */}
      {isMobile ? (
        <section className="pt-20 pb-4">
          <div className="container mx-auto px-3">
            <FeaturedCarousel 
              items={heroAnime.length > 0 ? heroAnime : (seasonalAnime?.slice(0, 5) || [])} 
              isLoading={seasonalLoading}
              autoPlayInterval={8000}
            />
          </div>
        </section>
      ) : (
        <HeroSection
          featuredAnime={heroAnime.length > 0 ? heroAnime : seasonalAnime?.slice(0, 5)} 
          isLoading={seasonalLoading} 
        />
      )}

      {/* Trending Now - Mobile-optimized horizontal scroll with larger cards */}
      <ContentSection
        title="Trending Now"
        titleJp="トレンド"
        icon={Flame}
        linkTo="/anime?filter=airing"
        compact
      >
        <HorizontalScroll showArrows={false}>
          {airingLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-44" />
          ) : (
            airingAnime?.slice(0, 10).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

      {/* Schedule Section */}
      <ScheduleSection />

      {/* This Season's Hits */}
      <ContentSection
        title={t("section.thisSeason")}
        titleJp={t("section.thisSeasonJp")}
        icon={Sparkles}
        linkTo="/anime?filter=seasonal"
      >
        <HorizontalScroll showArrows={!isMobile}>
          {seasonalLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
          ) : (
            seasonalAnime?.slice(0, 12).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* Most Popular */}
      <ContentSection
        title="Most Popular"
        titleJp="人気アニメ"
        icon={TrendingUp}
        linkTo="/rankings?type=anime"
        linkText={t("section.rankings")}
      >
        <HorizontalScroll showArrows={!isMobile}>
          {popularLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
          ) : (
            popularAnime?.slice(0, 12).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

      {/* Coming Soon */}
      <ContentSection
        title="Coming Soon"
        titleJp="近日公開"
        icon={Clock}
        linkTo="/anime?filter=upcoming"
      >
        <HorizontalScroll showArrows={!isMobile}>
          {upcomingLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
          ) : (
            upcomingAnime?.slice(0, 12).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

      {/* All-Time Top Rated */}
      <ContentSection
        title="All-Time Top Rated"
        titleJp="歴代最高"
        icon={Trophy}
        linkTo="/rankings?type=anime&sort=score"
      >
        <HorizontalScroll showArrows={!isMobile}>
          {allTimeLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
          ) : (
            allTimeTop?.slice(0, 12).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

      {/* Classic Anime (Pre-2010) */}
      <ContentSection
        title="Classic Anime"
        titleJp="クラシック"
        icon={History}
        linkTo="/classics"
        linkText="Browse by Decade"
      >
        <HorizontalScroll showArrows={!isMobile}>
          {classicLoading ? (
            <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-44" />
          ) : (
            classicAnime?.slice(0, 12).map((anime, index) => (
              <div key={anime.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                {isMobile ? (
                  <MobileAnimeCard anime={anime} index={index} />
                ) : (
                  <AnimeCard anime={anime} index={index} />
                )}
              </div>
            ))
          )}
        </HorizontalScroll>
      </ContentSection>

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
                    <CardSkeleton key={i} variant="compact" />
                  ))
                ) : (
                  topManga?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.anilist_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhwa Column - Trending */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" />
                  Trending Manhwa
                </h3>
                <Link to="/manga?filter=manhwa" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {trendingManhwaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <CardSkeleton key={i} variant="compact" />
                  ))
                ) : (
                  trendingManhwa?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.anilist_id} manga={manga} index={index} variant="compact" />
                  ))
                )}
              </div>
            </div>

            {/* Manhua Column - Trending */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-primary" />
                  Trending Manhua
                </h3>
                <Link to="/manga?filter=manhua" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See all →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {trendingManhuaLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <CardSkeleton key={i} variant="compact" />
                  ))
                ) : (
                  trendingManhua?.slice(0, 5).map((manga, index) => (
                    <MangaCard key={manga.anilist_id} manga={manga} index={index} variant="compact" />
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
    </>
  );
};

export default Index;
