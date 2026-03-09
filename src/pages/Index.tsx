/**
 * Bibue - Manga, Manhwa & Manhua Platform
 * Main landing page with Apple-style search design
 */
import { lazy, Suspense, useCallback, useState } from "react";
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
import { PremiumToolbar } from "@/components/PremiumToolbar";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";

import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useQueryClient } from "@tanstack/react-query";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Manga } from "@/lib/api";

// Lazy-load below-fold heavy components
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const AdUnit = lazy(() => import("@/components/AdUnit").then(m => ({ default: m.AdUnit })));

function MangaGrid({ items }: { items: Manga[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 entrance-stagger">
      {items.slice(0, 12).map((manga, index) => (
        <MangaCard key={manga.anilist_id} manga={manga} index={index} />
      ))}
    </div>
  );
}

function MangaCarousel({ items, isMobile }: { items: Manga[]; isMobile: boolean }) {
  return (
    <HorizontalScroll showArrows={!isMobile}>
      {items.slice(0, 12).map((manga, index) => (
        <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-48" style={{ scrollSnapAlign: "start" }}>
          <MangaCard manga={manga} index={index} />
        </div>
      ))}
    </HorizontalScroll>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { return (localStorage.getItem("bibue-view-mode") as ViewMode) || "carousel"; }
    catch { return "carousel"; }
  });

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem("bibue-view-mode", mode); } catch {}
  };

  // Above-fold hooks
  const { data: topManga, isLoading: topMangaLoading, isError: topMangaError, refetch: refetchTopManga } = useTopManga(1, undefined, 'popularity');

  // Below-fold deferred
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

  const viewToggle = <ViewToggle mode={viewMode} onChange={handleViewChange} />;

  const renderMangaSection = (data: Manga[] | undefined, isLoading: boolean) => {
    if (isLoading) {
      return viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-full" />
        </div>
      ) : (
        <HorizontalScroll showArrows={!isMobile}>
          <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-28 sm:w-36 md:w-48" />
        </HorizontalScroll>
      );
    }
    if (!data) return null;
    return viewMode === "grid" ? <MangaGrid items={data} /> : <MangaCarousel items={data} isMobile={isMobile} />;
  };

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

      {/* Welcome greeting for logged-in users */}
      {user && (
        <section className="container mx-auto px-3 sm:px-4 pt-6 sm:pt-8">
          <div className="glass-panel px-5 py-4 sm:px-6 sm:py-5">
            <p className="text-sm text-muted-foreground">Welcome back,</p>
            <p className="text-lg sm:text-xl font-bold liquid-metal-text">
              {user.email?.split("@")[0] || "Reader"}
            </p>
          </div>
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
                className="flex-shrink-0 w-32 sm:w-40 md:w-48 group"
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
      <ContentSection title={t("section.topManga") || "Top Manga"} icon={Flame} linkTo="/manga" headerExtra={viewToggle}>
        {topMangaError ? (
          <SectionError onRetry={() => refetchTopManga()} />
        ) : renderMangaSection(topManga, topMangaLoading)}
      </ContentSection>

      {/* Below-fold sections */}
      <style>{`.cv-auto { content-visibility: auto; contain-intrinsic-size: auto 400px; }`}</style>

      {/* Trending Manhwa */}
      <div ref={manhwaSection.ref} className="cv-auto">
      <ContentSection title={t("section.trendingManhwa") || "Trending Manhwa"} icon={Zap} linkTo="/manga?filter=manhwa" headerExtra={viewToggle}>
        {trendingManhwaError ? (
          <SectionError onRetry={() => refetchTrendingManhwa()} />
        ) : renderMangaSection(trendingManhwa, trendingManhwaLoading)}
      </ContentSection>
      </div>

      <Suspense fallback={null}>
        <div className="container mx-auto px-3 sm:px-4 cv-auto">
          <AdUnit slot="1234567890" format="horizontal" className="my-4 sm:my-6 md:my-8" />
        </div>
      </Suspense>

      {/* Trending Manhua */}
      <div ref={manhuaSection.ref} className="cv-auto">
      <ContentSection title={t("section.trendingManhua") || "Trending Manhua"} icon={Zap} linkTo="/manga?filter=manhua" headerExtra={viewToggle}>
        {trendingManhuaError ? (
          <SectionError onRetry={() => refetchTrendingManhua()} />
        ) : renderMangaSection(trendingManhua, trendingManhuaLoading)}
      </ContentSection>
      </div>

      {/* Recently Updated */}
      <div ref={recentSection.ref} className="cv-auto">
      {recentSection.isVisible ? (
      <ContentSection title="Recently Updated" icon={Sparkles} linkTo="/manga" headerExtra={viewToggle}>
        {recentError ? (
          <SectionError onRetry={() => refetchRecent()} />
        ) : renderMangaSection(recentManga, recentLoading)}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* All-Time Top Manga */}
      <div ref={allTimeSection.ref} className="cv-auto">
      {allTimeSection.isVisible ? (
      <ContentSection title="All-Time Top Rated" icon={Trophy} linkTo="/rankings?type=manga" headerExtra={viewToggle}>
        {allTimeError ? (
          <SectionError onRetry={() => refetchAllTime()} />
        ) : renderMangaSection(allTimeManga, allTimeLoading)}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      <Suspense fallback={null}>
        <div className="container mx-auto px-3 sm:px-4 cv-auto">
          <AdUnit slot="2345678901" format="horizontal" className="my-4 sm:my-6 md:my-8" />
        </div>
      </Suspense>

      </main>
      <PremiumToolbar />
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      </PullToRefresh>
    </>
  );
};

export default Index;
