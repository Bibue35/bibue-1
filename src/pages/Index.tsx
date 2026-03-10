/**
 * Bibue — Manga, Manhwa & Manhua Platform
 * Homepage with brutalist editorial layout
 */
import { lazy, Suspense, useCallback, useState } from "react";
import { TrendingTimePicker, type TrendingPeriod } from "@/components/TrendingTimePicker";
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
import { ContinueReadingRow } from "@/components/ContinueRow";
import { ViewToggle, ViewMode } from "@/components/ViewToggle";
import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useQueryClient } from "@tanstack/react-query";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";
import { Manga } from "@/lib/api";

const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));

function MangaGrid({ items }: { items: Manga[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5 entrance-stagger">
      {items.slice(0, 12).map((manga, index) => (
        <MangaCard key={manga.anilist_id} manga={manga} index={index} />
      ))}
    </div>
  );
}

function MangaMasonry({ items }: { items: Manga[] }) {
  return (
    <div className="masonry-grid entrance-stagger">
      {items.slice(0, 12).map((manga, index) => (
        <MangaCard key={manga.anilist_id} manga={manga} index={index} variant="masonry" />
      ))}
    </div>
  );
}

function MangaCarousel({ items, isMobile }: { items: Manga[]; isMobile: boolean }) {
  return (
    <HorizontalScroll showArrows={!isMobile}>
      {items.slice(0, 12).map((manga, index) => (
        <div key={manga.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-48" style={{ scrollSnapAlign: "start" }}>
          <MangaCard manga={manga} index={index} />
        </div>
      ))}
    </HorizontalScroll>
  );
}

const Index = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    try { return (localStorage.getItem("bibue-view-mode") as ViewMode) || "grid"; }
    catch { return "grid"; }
  });

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
    try { localStorage.setItem("bibue-view-mode", mode); } catch {}
  };

  const { data: topManga, isLoading: topMangaLoading, isError: topMangaError, refetch: refetchTopManga } = useTopManga(1, 'manga', 'popularity');

  const manhwaSection = useDeferredSection("400px");
  const manhuaSection = useDeferredSection("400px");
  const recentSection = useDeferredSection("400px");
  const allTimeSection = useDeferredSection("400px");

  const { data: trendingManhwa, isLoading: trendingManhwaLoading, isError: trendingManhwaError, refetch: refetchTrendingManhwa } = useTrendingManhwa(1, manhwaSection.isVisible);
  const { data: trendingManhua, isLoading: trendingManhuaLoading, isError: trendingManhuaError, refetch: refetchTrendingManhua } = useTrendingManhua(1, manhuaSection.isVisible);
  const { data: recentManga, isLoading: recentLoading, isError: recentError, refetch: refetchRecent } = useRecentlyUpdatedManga(1, recentSection.isVisible);
  const { data: allTimeManga, isLoading: allTimeLoading, isError: allTimeError, refetch: refetchAllTime } = useAllTimeTopManga(1, undefined, allTimeSection.isVisible);

  const { t } = useLanguage();
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
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-full" />
        </div>
      );
    }
    if (!data) return null;
    if (viewMode === "masonry") return <MangaMasonry items={data} />;
    if (viewMode === "grid") return <MangaGrid items={data} />;
    return <MangaCarousel items={data} isMobile={isMobile} />;
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

      <CinematicHero />

      {/* For Creators — subtle text link for logged-in users */}
      {user && (
        <section className="container mx-auto px-4 sm:px-6 pt-12">
          <Link
            to="/studio"
            className="group flex items-center justify-between py-4 border-b border-border/10 hover:border-border/30 transition-colors duration-300"
          >
            <div>
              <p className="text-sm font-medium">Are you a creator?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Upload your manga & earn up to 80% revenue</p>
            </div>
            <span className="text-xs font-medium tracking-wide uppercase text-muted-foreground group-hover:text-foreground transition-colors">
              Learn more
              <span className="inline-block ml-2 w-4 h-px bg-muted-foreground group-hover:w-6 group-hover:bg-foreground transition-all duration-300 align-middle" />
            </span>
          </Link>
        </section>
      )}

      {/* Continue Reading */}
      <ContinueReadingRow />

      {/* Recently Viewed */}
      {user && viewingHistory.length > 0 && (
        <ContentSection
          title={t("history.recentlyViewed") || "Recently Viewed"}
          linkTo="/history"
          linkText={t("section.seeAll")}
        >
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-4">
            {viewingHistory.slice(0, 6).map((entry) => (
              <Link
                key={entry.id}
                to={`/${entry.media_type}/${entry.media_id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted mb-2">
                  {entry.image_url && (
                    <img
                      src={entry.image_url}
                      alt={`${entry.title} cover art`}
                      width={150}
                      height={225}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                  {entry.last_chapter && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-2 py-1.5">
                      <span className="text-[10px] font-medium">CH {entry.last_chapter}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors duration-300">
                  {entry.title}
                </p>
              </Link>
            ))}
          </div>
        </ContentSection>
      )}

      {/* Top Manga */}
      <ContentSection title={t("section.topManga") || "Top Manga"} linkTo="/manga?sort=popularity" headerExtra={viewToggle}>
        {topMangaError ? (
          <SectionError onRetry={() => refetchTopManga()} />
        ) : renderMangaSection(topManga, topMangaLoading)}
      </ContentSection>

      <style>{`.cv-auto { content-visibility: auto; contain-intrinsic-size: auto 400px; }`}</style>

      {/* Trending Manhwa */}
      <div ref={manhwaSection.ref} className="cv-auto">
        <ContentSection title={t("section.trendingManhwa") || "Trending Manhwa"} linkTo="/manga?filter=manhwa&sort=popularity" headerExtra={viewToggle}>
          {trendingManhwaError ? (
            <SectionError onRetry={() => refetchTrendingManhwa()} />
          ) : renderMangaSection(trendingManhwa, trendingManhwaLoading)}
        </ContentSection>
      </div>

      {/* Trending Manhua */}
      <div ref={manhuaSection.ref} className="cv-auto">
        <ContentSection title={t("section.trendingManhua") || "Trending Manhua"} linkTo="/manga?filter=manhua&sort=popularity" headerExtra={viewToggle}>
          {trendingManhuaError ? (
            <SectionError onRetry={() => refetchTrendingManhua()} />
          ) : renderMangaSection(trendingManhua, trendingManhuaLoading)}
        </ContentSection>
      </div>

      {/* Recently Updated */}
      <div ref={recentSection.ref} className="cv-auto">
        {recentSection.isVisible ? (
          <ContentSection title="Recently Updated" linkTo="/manga?sort=updated" headerExtra={viewToggle}>
            {recentError ? (
              <SectionError onRetry={() => refetchRecent()} />
            ) : renderMangaSection(recentManga, recentLoading)}
          </ContentSection>
        ) : <div className="py-10" />}
      </div>

      {/* All-Time Top */}
      <div ref={allTimeSection.ref} className="cv-auto">
        {allTimeSection.isVisible ? (
          <ContentSection title="All-Time Top Rated" linkTo="/manga?sort=score" headerExtra={viewToggle}>
            {allTimeError ? (
              <SectionError onRetry={() => refetchAllTime()} />
            ) : renderMangaSection(allTimeManga, allTimeLoading)}
          </ContentSection>
        ) : <div className="py-10" />}
      </div>

      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      </PullToRefresh>
    </>
  );
};

export default Index;
