/**
 * Bibue - Manga, Manhwa & Manhua Platform
 * Main landing page with Apple-style search design
 */
import { lazy, Suspense, useCallback } from "react";
import { SEO, websiteJsonLd } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { SectionError } from "@/components/SectionError";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { MangaCard } from "@/components/MangaCard";
import { ContentSection } from "@/components/ContentSection";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CinematicHero } from "@/components/CinematicHero";
import { useTopManga, useTrendingManhwa, useTrendingManhua, useRecentlyUpdatedManga, useAllTimeTopManga } from "@/hooks/useAnimeData";
import { CardSkeletonRow } from "@/components/skeletons";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, TrendingUp, Sparkles, Flame, History, Trophy, Zap, Upload, BookOpen } from "lucide-react";
import { ContinueReadingRow } from "@/components/ContinueRow";

import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useQueryClient } from "@tanstack/react-query";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";

// Lazy-load below-fold heavy components
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const AdUnit = lazy(() => import("@/components/AdUnit").then(m => ({ default: m.AdUnit })));
const BibuOriginalsSection = lazy(() => import("@/components/BibuOriginalsSection").then(m => ({ default: m.BibuOriginalsSection })));


const Index = () => {
  const navigate = useNavigate();

  // Above-fold hooks
  const { data: topManga, isLoading: topMangaLoading, isError: topMangaError, refetch: refetchTopManga } = useTopManga(1, undefined, 'popularity');

  // Below-fold deferred — only fetch when near viewport
  const manhwaSection = useDeferredSection("400px");
  const manhuaSection = useDeferredSection("400px");
  const recentSection = useDeferredSection("400px");
  const allTimeSection = useDeferredSection("400px");

  const { data: trendingManhwa, isLoading: trendingManhwaLoading, isError: trendingManhwaError, refetch: refetchTrendingManhwa } = useTrendingManhwa(1, manhwaSection.isVisible);
  const { data: trendingManhua, isLoading: trendingManhuaLoading, isError: trendingManhuaError, refetch: refetchTrendingManhua } = useTrendingManhua(1, manhuaSection.isVisible);

  const { data: recentManga, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useRecentlyUpdatedManga(1, recentSection.isVisible);
  const { data: allTimeManga, isLoading: allTimeLoading, isError: allTimeError, refetch: refetchAllTime } = useAllTimeTopManga(1, undefined, allTimeSection.isVisible);

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

      {/* Cinematic Hero */}
      <CinematicHero />

      {/* For Creators Banner — only for logged-in users */}
      {user && (
      <section className="container mx-auto px-3 sm:px-4 pt-8 sm:pt-10">
        <Link
          to="/studio"
          className="group flex items-center justify-between gap-4 px-6 py-5 rounded-2xl border border-primary/20 bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all duration-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-base font-semibold">Are you a creator?</p>
              <p className="text-sm text-muted-foreground">Upload your manga & earn up to 80% revenue</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-primary/60 group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </section>
      )}


      {/* Continue Reading */}
      <ContinueReadingRow />

      {/* Recently Viewed */}
      {user && viewingHistory.length > 0 && (
        <ContentSection
          title={t("history.recentlyViewed") || "Recently Viewed"}
          icon={History}
          linkTo="/history"
          linkText={t("section.seeAll")}
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
      <ContentSection title={t("section.topManga") || "Top Manga"} icon={Flame} linkTo="/manga">
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

      {/* Below-fold sections use content-visibility for paint deferral */}
      <style>{`.cv-auto { content-visibility: auto; contain-intrinsic-size: auto 400px; }`}</style>

      {/* Trending Manhwa */}
      <div ref={manhwaSection.ref} className="cv-auto">
      <ContentSection title={t("section.trendingManhwa") || "Trending Manhwa"} icon={Zap} linkTo="/manga?filter=manhwa">
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
      </div>

      <Suspense fallback={null}>
        <div className="container mx-auto px-3 sm:px-4 cv-auto">
          <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
        </div>
      </Suspense>

      {/* Trending Manhua */}
      <div ref={manhuaSection.ref} className="cv-auto">
      <ContentSection title={t("section.trendingManhua") || "Trending Manhua"} icon={Zap} linkTo="/manga?filter=manhua">
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
      </div>

      {/* Recently Updated */}
      <div ref={recentSection.ref} className="cv-auto">
      {recentSection.isVisible ? (
      <ContentSection title="Recently Updated" icon={Sparkles} linkTo="/manga">
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
      <div ref={allTimeSection.ref} className="cv-auto">
      {allTimeSection.isVisible ? (
      <ContentSection title="All-Time Top Rated" icon={Trophy} linkTo="/rankings?type=manga">
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

      <Suspense fallback={null}>
        <div className="container mx-auto px-3 sm:px-4 cv-auto">
          <AdUnit slot="2345678901" format="horizontal" className="my-4 sm:my-6 md:my-8" />
        </div>
      </Suspense>

      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      </PullToRefresh>
    </>
  );
};

export default Index;
