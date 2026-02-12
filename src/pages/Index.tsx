/**
 * Bibue - Anime & Manga Platform
 * Main landing page with modern mobile-first design
 */
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { SectionError } from "@/components/SectionError";
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
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";

const Index = () => {
  // Above-fold hooks — load immediately
  const { data: airingAnime, isLoading: airingLoading, isError: airingError, refetch: refetchAiring } = useTopAnime(1, 'airing');
  const { data: seasonalAnime, isLoading: seasonalLoading, isError: seasonalError, refetch: refetchSeasonal } = useSeasonalAnime();

  // Below-fold deferred rendering — only mount components when scrolled near
  const popularSection = useDeferredSection("400px");
  const upcomingSection = useDeferredSection("400px");
  const allTimeSection = useDeferredSection("400px");
  const classicSection = useDeferredSection("400px");
  const mangaSection = useDeferredSection("400px");

  const { data: popularAnime, isLoading: popularLoading, isError: popularError, refetch: refetchPopular } = useTopAnime(1, 'bypopularity', popularSection.isVisible);
  const { data: upcomingAnime, isLoading: upcomingLoading, isError: upcomingError, refetch: refetchUpcoming } = useTopAnime(1, 'upcoming', upcomingSection.isVisible);
  const { data: allTimeTop, isLoading: allTimeLoading, isError: allTimeError, refetch: refetchAllTime } = useAllTimeTopAnime(1, allTimeSection.isVisible);
  const { data: classicAnime, isLoading: classicLoading, isError: classicError, refetch: refetchClassic } = useClassicAnime(1, classicSection.isVisible);
  const { data: topManga, isLoading: topMangaLoading, isError: topMangaError, refetch: refetchTopManga } = useTopManga(1, undefined, 'popularity', mangaSection.isVisible);
  const { data: trendingManhwa, isLoading: trendingManhwaLoading, isError: trendingManhwaError, refetch: refetchTrendingManhwa } = useTrendingManhwa(1, mangaSection.isVisible);
  const { data: trendingManhua, isLoading: trendingManhuaLoading, isError: trendingManhuaError, refetch: refetchTrendingManhua } = useTrendingManhua(1, mangaSection.isVisible);
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topAnime"] }),
      queryClient.invalidateQueries({ queryKey: ["seasonalAnime"] }),
      queryClient.invalidateQueries({ queryKey: ["topManga"] }),
      queryClient.invalidateQueries({ queryKey: ["classicAnime"] }),
      queryClient.invalidateQueries({ queryKey: ["allTimeTopAnime"] }),
      queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] }),
      queryClient.invalidateQueries({ queryKey: ["trendingManhua"] }),
    ]);
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
      <CollapsibleNavbar />
      <PullToRefresh onRefresh={handleRefresh}>
      <main>
      
      {/* Hero Section - Use FeaturedCarousel on mobile for cleaner look */}
      {isMobile ? (
        <section className="pb-4">
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
        title={t("section.trending")}
        titleJp={t("section.trendingJp")}
        icon={Flame}
        linkTo="/anime?filter=airing"
        compact
      >
        {airingError ? (
          <SectionError onRetry={() => refetchAiring()} />
        ) : (
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
        )}
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
        {seasonalError ? (
          <SectionError onRetry={() => refetchSeasonal()} />
        ) : (
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
        )}
      </ContentSection>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* Most Popular */}
      <div ref={popularSection.ref}>
      {popularSection.isVisible ? (
      <ContentSection
        title={t("anime.mostPopular")}
        titleJp={t("anime.mostPopularJp")}
        icon={TrendingUp}
        linkTo="/rankings?type=anime"
        linkText={t("section.rankings")}
      >
        {popularError ? (
          <SectionError onRetry={() => refetchPopular()} />
        ) : (
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
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* Coming Soon */}
      <div ref={upcomingSection.ref}>
      {upcomingSection.isVisible ? (
      <ContentSection
        title={t("anime.comingSoon")}
        titleJp={t("anime.comingSoonJp")}
        icon={Clock}
        linkTo="/anime?filter=upcoming"
      >
        {upcomingError ? (
          <SectionError onRetry={() => refetchUpcoming()} />
        ) : (
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
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* All-Time Top Rated */}
      <div ref={allTimeSection.ref}>
      {allTimeSection.isVisible ? (
      <ContentSection
        title={t("anime.allTimeTop")}
        titleJp={t("anime.allTimeTopJp")}
        icon={Trophy}
        linkTo="/rankings?type=anime&sort=score"
      >
        {allTimeError ? (
          <SectionError onRetry={() => refetchAllTime()} />
        ) : (
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
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* Classic Anime (Pre-2010) */}
      <div ref={classicSection.ref}>
      {classicSection.isVisible ? (
      <ContentSection
        title={t("anime.classicAnime")}
        titleJp={t("anime.classicAnimeJp")}
        icon={History}
        linkTo="/classics"
        linkText={t("section.browseByDecade")}
      >
        {classicError ? (
          <SectionError onRetry={() => refetchClassic()} />
        ) : (
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
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* Ad Unit */}
      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="2345678901" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* ===== MANGA SECTION ===== */}
      <div ref={mangaSection.ref}>
      {mangaSection.isVisible ? (
      <>
      <section className="py-10 sm:py-16 md:py-20">
        <div className="container mx-auto px-3 sm:px-4">
          {/* Manga Section Header */}
          <div className="flex items-center justify-between mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">{t("index.manga")}</h2>
                {language === "ja" && <p className="font-jp text-xs sm:text-sm text-muted-foreground">{t("index.mangaJp")}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" className="gap-1 text-xs sm:text-sm h-8 sm:h-9 px-2 sm:px-3" asChild>
              <Link to="/manga">
                <span className="hidden xs:inline">{t("section.browseAll")}</span>
                <span className="xs:hidden">{t("common.all")}</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </Link>
            </Button>
          </div>

          {/* Manga Grid - responsive columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {/* Top Manga Column */}
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base sm:text-lg font-semibold">{t("section.topManga")}</h3>
                <Link to="/manga" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("section.seeAll")} →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {topMangaError ? (
                  <SectionError onRetry={() => refetchTopManga()} />
                ) : topMangaLoading ? (
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
                  {t("section.trendingManhwa")}
                </h3>
                <Link to="/manga?filter=manhwa" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("section.seeAll")} →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {trendingManhwaError ? (
                  <SectionError onRetry={() => refetchTrendingManhwa()} />
                ) : trendingManhwaLoading ? (
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
                  {t("section.trendingManhua")}
                </h3>
                <Link to="/manga?filter=manhua" className="text-[10px] sm:text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {t("section.seeAll")} →
                </Link>
              </div>
              <div className="space-y-2 sm:space-y-3">
                {trendingManhuaError ? (
                  <SectionError onRetry={() => refetchTrendingManhua()} />
                ) : trendingManhuaLoading ? (
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

      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="3456789012" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>
      </>
      ) : <div className="py-10 sm:py-16 md:py-20" />}
      </div>

      </main>
      <Footer />
      </PullToRefresh>
    </>
  );
};

export default Index;
