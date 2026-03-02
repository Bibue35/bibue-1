/**
 * Bibue - Manga, Manhwa & Manhua Platform
 * Main landing page with Apple-style search design
 */
import { SEO, websiteJsonLd } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { SectionError } from "@/components/SectionError";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { MangaCard } from "@/components/MangaCard";
import { ContentSection } from "@/components/ContentSection";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { PullToRefresh } from "@/components/PullToRefresh";
import { SearchDropdown } from "@/components/SearchDropdown";
import { useTopManga, useTrendingManhwa, useTrendingManhua, useRecentlyUpdatedManga, useAllTimeTopManga } from "@/hooks/useAnimeData";
import { CardSkeleton, CardSkeletonRow } from "@/components/skeletons";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, BookOpen, Flame, History, Trophy, Zap, Upload } from "lucide-react";
import { ContinueReadingRow } from "@/components/ContinueRow";
import { BibuOriginalsSection } from "@/components/BibuOriginalsSection";
import { HeroGenrePanel } from "@/components/HeroGenrePanel";
import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useMemo, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { CyclingText } from "@/components/CyclingText";

const Index = () => {
  const [heroSearch, setHeroSearch] = useState("");
  const navigate = useNavigate();

  // Above-fold hooks
  const { data: topManga, isLoading: topMangaLoading, isError: topMangaError, refetch: refetchTopManga } = useTopManga(1, undefined, 'popularity');
  const { data: trendingManhwa, isLoading: trendingManhwaLoading, isError: trendingManhwaError, refetch: refetchTrendingManhwa } = useTrendingManhwa();
  const { data: trendingManhua, isLoading: trendingManhuaLoading, isError: trendingManhuaError, refetch: refetchTrendingManhua } = useTrendingManhua();

  // Below-fold deferred
  const recentSection = useDeferredSection("400px");
  const allTimeSection = useDeferredSection("400px");

  const { data: recentManga, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useRecentlyUpdatedManga(1);
  const { data: allTimeManga, isLoading: allTimeLoading, isError: allTimeError, refetch: refetchAllTime } = useAllTimeTopManga(1);

  const { t, language } = useLanguage();
  const { user } = useAuth();
  useNotificationGenerator();
  const { history: viewingHistory } = useViewingHistory(10);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["topManga"] }),
      queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] }),
      queryClient.invalidateQueries({ queryKey: ["trendingManhua"] }),
      queryClient.invalidateQueries({ queryKey: ["recentlyUpdatedManga"] }),
      queryClient.invalidateQueries({ queryKey: ["allTimeTopManga"] }),
    ]);
  }, [queryClient]);

  // Navigate to manga page with search when user types
  const handleSearchChange = useCallback((value: string) => {
    setHeroSearch(value);
    if (value.trim().length > 0) {
      navigate(`/manga?q=${encodeURIComponent(value.trim())}`);
    }
  }, [navigate]);

  // Hero manga for the top section
  const heroManga = useMemo(() => {
    if (!topManga?.length) return [];
    return topManga.slice(0, 5);
  }, [topManga]);

  return (
    <>
      <SEO
        title={undefined}
        description="Discover your next favorite manga, manhwa & manhua with Bibue. Track your reading list, explore trending titles, and connect with the community."
        url="/"
        jsonLd={websiteJsonLd()}
      />
      <CollapsibleNavbar />
      <PullToRefresh onRefresh={handleRefresh}>
      <main id="main-content">

      {/* Hero with Apple-style Search */}
      <section className="pt-24 sm:pt-28 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          {/* Title + CTAs */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                Discover Peak{" "}
                <CyclingText
                  words={["Manga", "Manhwa", "Manhua"]}
                  interval={2500}
                  className="text-primary"
                />
              </h1>
              <div className="flex items-center gap-2 mt-3">
                <Button asChild size="sm">
                  <Link to="/manga">Browse All</Link>
                </Button>
                <HeroGenrePanel />
              </div>
            </div>
          </div>

          {/* Search below hero text */}
          <div className="flex justify-center mb-10 sm:mb-14">
            <SearchDropdown
              type="manga"
              value={heroSearch}
              onChange={handleSearchChange}
              placeholder="Search any manga, manhwa, manhua…"
              size="large"
            />
          </div>

          {/* Featured Manga Row */}
          <HorizontalScroll showArrows={!isMobile}>
            {topMangaLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-48" />
            ) : (
              heroManga.map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* For Creators Banner */}
      <section className="container mx-auto px-3 sm:px-4 py-4">
        <Link
          to="/studio"
          className="group flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Are you a creator?</p>
              <p className="text-xs text-muted-foreground">Upload your manga & earn up to 80% revenue</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </section>

      {/* Bibue Originals */}
      <BibuOriginalsSection />

      {/* Continue Reading */}
      <ContinueReadingRow />

      {/* Recently Viewed */}
      {user && viewingHistory.length > 0 && (
        <ContentSection
          title={t("history.recentlyViewed") || "Recently Viewed"}
          icon={History}
          linkTo="/history"
          linkText={t("section.seeAll")}
          compact
        >
          <HorizontalScroll showArrows={false}>
            {viewingHistory.map((entry) => (
              <Link
                key={entry.id}
                to={`/${entry.media_type}/${entry.media_id}`}
                className="flex-shrink-0 w-28 sm:w-36 md:w-44 group"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-1.5">
                  {entry.image_url ? (
                    <img
                      src={entry.image_url}
                      alt={`${entry.title} cover art`}
                      width={150}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {entry.last_chapter && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-2 py-1.5">
                      <span className="text-[10px] font-medium">CH {entry.last_chapter}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors">
                  {entry.title}
                </p>
              </Link>
            ))}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* Top Manga */}
      <ContentSection title={t("section.topManga") || "Top Manga"} icon={Flame} linkTo="/manga" compact>
        {topMangaError ? (
          <SectionError onRetry={() => refetchTopManga()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {topMangaLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
            ) : (
              topManga?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>

      {/* Trending Manhwa */}
      <ContentSection title={t("section.trendingManhwa") || "Trending Manhwa"} icon={Zap} linkTo="/manga?filter=manhwa" compact>
        {trendingManhwaError ? (
          <SectionError onRetry={() => refetchTrendingManhwa()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {trendingManhwaLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
            ) : (
              trendingManhwa?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>

      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      {/* Trending Manhua */}
      <ContentSection title={t("section.trendingManhua") || "Trending Manhua"} icon={Zap} linkTo="/manga?filter=manhua" compact>
        {trendingManhuaError ? (
          <SectionError onRetry={() => refetchTrendingManhua()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {trendingManhuaLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
            ) : (
              trendingManhua?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>

      {/* Recently Updated */}
      <div ref={recentSection.ref}>
      {recentSection.isVisible ? (
      <ContentSection title="Recently Updated" icon={Sparkles} linkTo="/manga" compact>
        {recentError ? (
          <SectionError onRetry={() => refetchRecent()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {recentLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
            ) : (
              recentManga?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* All-Time Top Manga */}
      <div ref={allTimeSection.ref}>
      {allTimeSection.isVisible ? (
      <ContentSection title="All-Time Top Rated" icon={Trophy} linkTo="/rankings?type=manga" compact>
        {allTimeError ? (
          <SectionError onRetry={() => refetchAllTime()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {allTimeLoading ? (
              <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
            ) : (
              allTimeManga?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="2345678901" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      </main>
      <Footer />
      </PullToRefresh>
    </>
  );
};

export default Index;
