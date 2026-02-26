/**
 * Bibue - Manga Platform
 * Main landing page with MangaDex-sourced content
 */
import { SEO, websiteJsonLd } from "@/components/SEO";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { SectionError } from "@/components/SectionError";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { MangaDexCard } from "@/components/MangaDexCard";
import { ContentSection } from "@/components/ContentSection";
import { Footer } from "@/components/Footer";
import { AdUnit } from "@/components/AdUnit";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CardSkeleton, CardSkeletonRow } from "@/components/skeletons";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, Flame, TrendingUp, Clock, Star, Zap, CheckCircle, Upload, History, Play, Sparkles } from "lucide-react";
import { ContinueReadingRow } from "@/components/ContinueRow";
import { useNotificationGenerator } from "@/hooks/useNotificationGenerator";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useViewingHistory } from "@/hooks/useViewingHistory";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDeferredSection } from "@/hooks/useDeferredSection";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  useMangaDexPopular,
  useMangaDexLatest,
  useMangaDexTopRated,
  useMangaDexManhwa,
  useMangaDexManhua,
  useMangaDexCompleted,
} from "@/hooks/useMangaDexBrowse";

const Index = () => {
  // Above-fold hooks
  const { data: popular, isLoading: popularLoading, isError: popularError, refetch: refetchPopular } = useMangaDexPopular();
  const { data: latest, isLoading: latestLoading, isError: latestError, refetch: refetchLatest } = useMangaDexLatest();

  // Below-fold deferred sections
  const topRatedSection = useDeferredSection("400px");
  const manhwaSection = useDeferredSection("400px");
  const manhuaSection = useDeferredSection("400px");
  const completedSection = useDeferredSection("400px");

  const { data: topRated, isLoading: topRatedLoading, isError: topRatedError, refetch: refetchTopRated } = useMangaDexTopRated(1, topRatedSection.isVisible);
  const { data: manhwa, isLoading: manhwaLoading, isError: manhwaError, refetch: refetchManhwa } = useMangaDexManhwa(1, manhwaSection.isVisible);
  const { data: manhua, isLoading: manhuaLoading, isError: manhuaError, refetch: refetchManhua } = useMangaDexManhua(1, manhuaSection.isVisible);
  const { data: completed, isLoading: completedLoading, isError: completedError, refetch: refetchCompleted } = useMangaDexCompleted(1, completedSection.isVisible);

  const { t, language } = useLanguage();
  const { user } = useAuth();
  useNotificationGenerator();
  const { history: viewingHistory } = useViewingHistory(10);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["mangadex-browse"] });
  }, [queryClient]);

  return (
    <>
      <SEO
        title={undefined}
        description="Discover your next favorite manga, manhwa, and manhua on Bibue. Track your reading list, explore trending titles, and connect with the community."
        url="/"
        jsonLd={websiteJsonLd()}
      />
      <CollapsibleNavbar />
      <PullToRefresh onRefresh={handleRefresh}>
      <main id="main-content">

      {/* Hero - Featured Popular Manga */}
      <section className="pt-20 pb-6 sm:pb-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex items-center gap-2 mb-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">Discover Manga</h1>
            <span className="font-jp text-sm text-muted-foreground">マンガ</span>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mb-6">
            Browse thousands of manga, manhwa, and manhua — all sourced from MangaDex.
          </p>
        </div>
      </section>

      {/* For Creators Banner */}
      <section className="container mx-auto px-3 sm:px-4 pb-4">
        <Link
          to="/for-creators"
          className="group flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl border border-border/50 bg-card/50 hover:bg-card/80 hover:border-primary/30 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Upload className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Are you a creator?</p>
              <p className="text-xs text-muted-foreground">Upload your manga & earn up to 90% revenue</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </Link>
      </section>

      {/* Continue Reading */}
      <ContinueReadingRow />

      {/* Recently Viewed */}
      {user && viewingHistory.length > 0 && (
        <ContentSection title="Recently Viewed" icon={History} linkTo="/history" linkText="See all" compact>
          <HorizontalScroll showArrows={false}>
            {viewingHistory.map((entry) => (
              <Link
                key={entry.id}
                to={`/${entry.media_type}/${entry.media_id}`}
                className="flex-shrink-0 w-28 sm:w-36 md:w-44 group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-1.5">
                  {entry.image_url ? (
                    <img src={entry.image_url} alt={entry.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-8 h-8 text-muted-foreground" />
                    </div>
                  )}
                  {(entry.last_chapter) && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent px-2 py-1.5">
                      <span className="text-[10px] font-medium">CH {entry.last_chapter}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors">{entry.title}</p>
              </Link>
            ))}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* 🔥 Popular Manga */}
      <ContentSection title="Popular" titleJp="人気" icon={Flame} linkTo="/manga" compact>
        {popularError ? (
          <SectionError onRetry={() => refetchPopular()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {popularLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              popular?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} eager={index < 4} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>

      {/* 🆕 Recently Updated */}
      <ContentSection title="Recently Updated" titleJp="最新" icon={Clock} linkTo="/manga?sort=latest" compact>
        {latestError ? (
          <SectionError onRetry={() => refetchLatest()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {latestLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              latest?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} />
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

      {/* ⭐ Top Rated */}
      <div ref={topRatedSection.ref}>
      {topRatedSection.isVisible ? (
      <ContentSection title="Top Rated" titleJp="最高評価" icon={Star} linkTo="/manga?sort=rating">
        {topRatedError ? (
          <SectionError onRetry={() => refetchTopRated()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {topRatedLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              topRated?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* 🇰🇷 Manhwa */}
      <div ref={manhwaSection.ref}>
      {manhwaSection.isVisible ? (
      <ContentSection title="Trending Manhwa" titleJp="マンファ" icon={Zap} linkTo="/manga?filter=manhwa">
        {manhwaError ? (
          <SectionError onRetry={() => refetchManhwa()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {manhwaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              manhwa?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      {/* 🇨🇳 Manhua */}
      <div ref={manhuaSection.ref}>
      {manhuaSection.isVisible ? (
      <ContentSection title="Trending Manhua" titleJp="漫画" icon={Zap} linkTo="/manga?filter=manhua">
        {manhuaError ? (
          <SectionError onRetry={() => refetchManhua()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {manhuaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              manhua?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} />
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

      {/* ✓ Completed Series */}
      <div ref={completedSection.ref}>
      {completedSection.isVisible ? (
      <ContentSection title="Completed Series" titleJp="完結" icon={CheckCircle} linkTo="/manga?status=completed">
        {completedError ? (
          <SectionError onRetry={() => refetchCompleted()} />
        ) : (
          <HorizontalScroll showArrows={!isMobile}>
            {completedLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              completed?.slice(0, 12).map((manga, index) => (
                <div key={manga.id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaDexCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        )}
      </ContentSection>
      ) : <div className="py-6 sm:py-10" />}
      </div>

      <div className="container mx-auto px-3 sm:px-4">
        <AdUnit slot="3456789012" format="horizontal" className="my-4 sm:my-6 md:my-8" />
      </div>

      </main>
      <Footer />
      </PullToRefresh>
    </>
  );
};

export default Index;
