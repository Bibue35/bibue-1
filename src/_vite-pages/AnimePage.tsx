import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams, Link } from "react-router-dom";
import { DeferredPopularSection, DeferredUpcomingSection, DeferredClassicSection, DeferredAllTimeTopSection, DeferredGenreSection } from "@/components/DeferredAnimeSections";
import { Bookmark, Sparkles, Loader2, Flame, Users, Swords, Heart, Wand2, Rocket, RefreshCw } from "lucide-react";
import { SectionError } from "@/components/SectionError";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { MobileAnimeCard } from "@/components/MobileAnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { ContentSection } from "@/components/ContentSection";
import { FilterBar } from "@/components/FilterBar";
import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ScheduleSection } from "@/components/ScheduleSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeletonRow } from "@/components/skeletons";
import { useTopAnime, useSeasonalAnime, useRecentlyUpdatedAnime, useInfiniteFilteredAnime, useInfiniteSearchAnime } from "@/hooks/useAnimeData";
import { useFilterPreferences } from "@/hooks/useFilterPreferences";
import { useInView } from "@/hooks/useInView";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

const ANIME_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Film" },
  { value: "OVA", label: "OVA" },
  { value: "ONA", label: "ONA" },
];

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");
  
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const { filters, updateFilter, resetFilters, activeCount } = useFilterPreferences("anime");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  
  const debouncedSearch = useDebounce(localSearch.trim());
  const isSearching = debouncedSearch.length > 0;

  // Sync from URL on mount
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    const urlQ = searchParams.get("q") || "";
    if (urlFilter === "airing") updateFilter("status", "RELEASING");
    else if (urlFilter === "upcoming") updateFilter("status", "NOT_YET_RELEASED");
    else if (urlFilter === "completed") updateFilter("status", "FINISHED");
    setLocalSearch(urlQ);
    if (urlFilter && !urlQ) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [searchParams]);

  // Sync search into filters
  useEffect(() => {
    updateFilter("search", debouncedSearch);
  }, [debouncedSearch]);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteFilteredAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteSearchAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["seasonalAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["recentlyUpdatedAnime"] });
  }, [queryClient]);

  // Data
  const { data: airingAnime, isLoading: airingLoading, isError: airingError, refetch: refetchAiring } = useTopAnime(1, 'airing');
  const { data: seasonalAnime, isLoading: seasonalLoading, isError: seasonalError, refetch: refetchSeasonal } = useSeasonalAnime();
  const { data: recentlyUpdatedAnime, isLoading: recentlyUpdatedLoading, isError: recentlyUpdatedError, refetch: refetchRecentlyUpdated } = useRecentlyUpdatedAnime(1);

  const infiniteFiltered = useInfiniteFilteredAnime(filters);
  const infiniteSearch = useInfiniteSearchAnime(debouncedSearch, isSearching);

  const activeInfinite = isSearching ? infiniteSearch : infiniteFiltered;
  const allItems = activeInfinite.data?.pages.flat() ?? [];
  const gridLoading = activeInfinite.isLoading;
  const isFetchingNext = activeInfinite.isFetchingNextPage;
  const hasNextPage = activeInfinite.hasNextPage;

  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({ threshold: 0, rootMargin: "400px 0px" });
  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNext) activeInfinite.fetchNextPage();
  }, [loadMoreInView, hasNextPage, isFetchingNext, activeInfinite]);

  const sortedSeasonalAnime = seasonalAnime?.slice().sort((a, b) => {
    const aIsAiring = a.status === "Currently Airing" ? 1 : 0;
    const bIsAiring = b.status === "Currently Airing" ? 1 : 0;
    if (bIsAiring !== aIsAiring) return bIsAiring - aIsAiring;
    return (b.members || 0) - (a.members || 0);
  });

  const hasAdvancedFilters = !!(filters.genre || filters.year || filters.status || filters.scoreMin || filters.type || filters.sort !== "popularity");
  const showCarousels = !isSearching && !genreId && !hasAdvancedFilters;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <SEO
        title="Browse Anime"
        description="Explore trending, seasonal, and top-rated anime. Filter by genre, popularity, and more on Bibue."
        url="/anime"
        jsonLd={itemListJsonLd("Browse Anime", "/anime")}
      />
      <CollapsibleNavbar />

      {/* Hero with Search */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              {t("anime.discover")}
            </h1>
            {language === "ja" && <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-6">{t("anime.discoverJp")}</p>}
            
            <SearchDropdown
              type="anime"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder={t("anime.searchPlaceholder")}
            />

            <div className="flex justify-center gap-3 mt-6">
              {user && (
                <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                  <Link to="/recommendations">
                    <Sparkles className="w-4 h-4" />{t("nav.forYou")}
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/watchlist?type=anime">
                  <Bookmark className="w-4 h-4" />{t("nav.saved")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FilterBar */}
      <section className="py-2">
        <div className="container mx-auto px-3 sm:px-4">
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            activeCount={activeCount}
            mediaType="anime"
            typeOptions={ANIME_TYPE_OPTIONS}
          />
        </div>
      </section>

      {/* Trending Now */}
      {showCarousels && (
        <ContentSection title={t("anime.trendingNow")} titleJp={t("anime.trendingNowJp")} icon={Flame} linkTo="/anime?filter=airing" compact>
          {airingError ? (
            <SectionError onRetry={() => refetchAiring()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {airingLoading ? (
                <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-44" />
              ) : (
                airingAnime?.slice(0, 10).map((anime, index) => (
                  <div key={anime.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-44">
                    {isMobile ? <MobileAnimeCard anime={anime} index={index} /> : <AnimeCard anime={anime} index={index} />}
                  </div>
                ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {/* Recently Updated */}
      {showCarousels && (
        <ContentSection title={t("anime.recentlyUpdated")} titleJp={t("anime.recentlyUpdatedJp")} icon={RefreshCw} linkTo="/anime?filter=airing" compact>
          {recentlyUpdatedError ? (
            <SectionError onRetry={() => refetchRecentlyUpdated()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {recentlyUpdatedLoading ? (
                <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-44" />
              ) : (
                recentlyUpdatedAnime?.slice(0, 12).map((anime, index) => (
                  <div key={anime.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-44">
                    {isMobile ? <MobileAnimeCard anime={anime} index={index} /> : <AnimeCard anime={anime} index={index} />}
                  </div>
                ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {showCarousels && <ScheduleSection />}

      {/* This Season */}
      {showCarousels && (
        <ContentSection title={t("anime.thisSeason")} titleJp={t("anime.thisSeasonJp")} icon={Sparkles} linkTo="/anime?filter=seasonal">
          {seasonalError ? (
            <SectionError onRetry={() => refetchSeasonal()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {seasonalLoading ? (
                <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-48" />
              ) : (
                sortedSeasonalAnime?.slice(0, 12).map((anime, index) => (
                  <div key={anime.anilist_id} className="flex-shrink-0 w-32 sm:w-40 md:w-48">
                    {isMobile ? <MobileAnimeCard anime={anime} index={index} /> : <AnimeCard anime={anime} index={index} />}
                  </div>
                ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {showCarousels && <DeferredPopularSection isMobile={isMobile} />}
      {showCarousels && <DeferredUpcomingSection isMobile={isMobile} />}
      {showCarousels && <DeferredClassicSection isMobile={isMobile} />}
      {showCarousels && <DeferredAllTimeTopSection isMobile={isMobile} />}
      {showCarousels && <DeferredGenreSection genre="Action" titleJp="アクション" icon={Swords} linkTo="/anime?genre=1" isMobile={isMobile} />}
      {showCarousels && <DeferredGenreSection genre="Romance" titleJp="ロマンス" icon={Heart} linkTo="/anime?genre=22" isMobile={isMobile} />}
      {showCarousels && <DeferredGenreSection genre="Fantasy" titleJp="ファンタジー" icon={Wand2} linkTo="/anime?genre=10" isMobile={isMobile} />}
      {showCarousels && <DeferredGenreSection genre="Sci-Fi" titleJp="SF" icon={Rocket} linkTo="/anime?genre=24" isMobile={isMobile} />}

      <div ref={resultsRef} />

      {/* All Anime Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {isSearching 
              ? `${t("common.searchResults")} "${debouncedSearch}"` 
              : hasAdvancedFilters 
                ? "Filtered Results"
                : `${t("anime.topRatedAnime")} Anime`}
          </h2>
          
          {isSearching && gridLoading ? (
            <div className={cn("grid place-items-center rounded-2xl liquid-glass-subtle min-h-[320px]")}>
              <div className="flex flex-col items-center text-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{t("common.searchingFor")} "{debouncedSearch}"</p>
              </div>
            </div>
          ) : isSearching && !gridLoading && allItems.length === 0 ? (
            <div className="rounded-2xl liquid-glass-subtle py-12">
              <div className="flex flex-col items-center text-center gap-3 px-6">
                <p className="text-base font-medium">{t("common.noResults")} "{debouncedSearch}"</p>
                <p className="text-sm text-muted-foreground">{t("common.checkSpelling")}</p>
                <Button variant="outline" onClick={() => setLocalSearch("")} className="rounded-full mt-2">
                  {t("common.clearSearch")}
                </Button>
              </div>
            </div>
          ) : gridLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {allItems.map((anime, index) => (
                  <AnimeCard key={`${anime.anilist_id}-${index}`} anime={anime} index={index} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNext && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                {!hasNextPage && allItems.length > 0 && (
                  <p className="text-sm text-muted-foreground">You've seen it all!</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </PullToRefresh>
  );
}
