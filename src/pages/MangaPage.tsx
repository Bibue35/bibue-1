import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams, Link } from "react-router-dom";
import {
  Loader2, TrendingUp, Trophy, Star, Zap, Swords, Heart, Wand2,
  BookOpen, RefreshCw, SlidersHorizontal, ChevronDown, X, Bookmark, Sparkles,
  ArrowRight, Search, Tag,
} from "lucide-react";
import {
  DeferredTrendingManhwaSection, DeferredTopManhwaSection,
  DeferredTrendingManhuaSection, DeferredTopManhuaSection,
  DeferredNewThisWeekSection, DeferredCompletedSection,
} from "@/components/DeferredMangaSections";
import { SectionError } from "@/components/SectionError";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { ContentSection } from "@/components/ContentSection";
import { SearchDropdown } from "@/components/SearchDropdown";
import { ContinueReadingRow } from "@/components/ContinueRow";
import { PullToRefresh } from "@/components/PullToRefresh";
import { FilterBar } from "@/components/FilterBar";
import { CardSkeletonRow } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopManga, useRecentlyUpdatedManga, useInfiniteFilteredManga, useInfiniteMangaByGenre, useInfiniteSearchManga } from "@/hooks/useAnimeData";
import { useHybridMangaByGenre } from "@/hooks/useHybridMangaData";
import { isNicheTagGenre } from "@/lib/api";
import { useFilterPreferences } from "@/hooks/useFilterPreferences";
import { useInView } from "@/hooks/useInView";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

/* ── Genre Grid Data ─────────────────────────────── */
const BROWSE_GENRES = [
  { id: "1", name: "Action" },
  { id: "22", name: "Romance" },
  { id: "10", name: "Fantasy" },
  { id: "8", name: "Drama" },
  { id: "4", name: "Comedy" },
  { id: "14", name: "Horror" },
  { id: "101", name: "Thriller" },
  { id: "7", name: "Mystery" },
  { id: "36", name: "Slice of Life" },
  { id: "41", name: "Isekai" },
  { id: "27", name: "Shounen" },
  { id: "25", name: "Shoujo" },
  { id: "28", name: "Seinen" },
  { id: "42", name: "Josei" },
  { id: "13", name: "Historical" },
  { id: "40", name: "Psychological" },
  { id: "37", name: "Supernatural" },
  { id: "30", name: "Sports" },
  { id: "38", name: "Military" },
  { id: "24", name: "Sci-Fi" },
  { id: "73", name: "School" },
  { id: "2", name: "Adventure" },
  { id: "tag-xianxia", name: "Xianxia" },
  { id: "tag-wuxia", name: "Wuxia" },
  { id: "tag-cultivation", name: "Cultivation" },
  { id: "tag-martial-arts", name: "Martial Arts" },
  { id: "tag-reincarnation", name: "Reincarnation" },
  { id: "tag-villainess", name: "Villainess" },
  { id: "tag-regression", name: "Regression" },
  { id: "tag-dungeon", name: "Dungeon" },
  { id: "tag-system", name: "System" },
];

const GENRE_ID_TO_NAME: Record<string, string> = {};
BROWSE_GENRES.forEach((g) => { GENRE_ID_TO_NAME[g.id] = g.name; });

/* ── Genre usage tracking ── */
const GENRE_USAGE_KEY = "bibue_genre_usage";
function getGenreUsage(): Record<string, number> {
  try { return JSON.parse(localStorage.getItem(GENRE_USAGE_KEY) || "{}"); } catch { return {}; }
}
function trackGenreUsage(id: string) {
  const usage = getGenreUsage();
  usage[id] = (usage[id] || 0) + 1;
  localStorage.setItem(GENRE_USAGE_KEY, JSON.stringify(usage));
}

/* ── Genre Swipe Bar ── */
function GenreSwipeBar({ onSelect, activeGenre }: { onSelect: (id: string | null) => void; activeGenre: string | null }) {
  const [sortedGenres, setSortedGenres] = useState(BROWSE_GENRES);

  useEffect(() => {
    const usage = getGenreUsage();
    const sorted = [...BROWSE_GENRES].sort((a, b) => (usage[b.id] || 0) - (usage[a.id] || 0));
    setSortedGenres(sorted);
  }, [activeGenre]);

  const handleSelect = (id: string | null) => {
    if (id) trackGenreUsage(id);
    onSelect(id);
  };

  return (
    <div className="relative -mx-4 px-4 overflow-x-auto hide-scrollbar">
      <div className="flex items-center gap-1.5 py-1 w-max">
        {activeGenre && (
          <button
            onClick={() => handleSelect(null)}
            className="flex-shrink-0 inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors btn-press"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
        {sortedGenres.map((g) => (
          <button
            key={g.id}
            onClick={() => handleSelect(activeGenre === g.id ? null : g.id)}
            className={cn(
              "flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap btn-press",
              activeGenre === g.id
                ? "filter-pill-active"
                : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
            )}
          >
            {g.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");

  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const { filters, updateFilter, resetFilters, activeCount } = useFilterPreferences("manga");
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t } = useLanguage();
  const isUserAction = useRef(false);

  const debouncedSearch = useDebounce(localSearch.trim());
  const isSearching = debouncedSearch.length > 0;

  // Derive type filter for display
  const typeFilter = (filters.type as "manga" | "manhwa" | "manhua" | null) || null;

  // Sync state from URL on mount
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
    const urlSort = searchParams.get("sort") as string | null;
    const urlQ = searchParams.get("q") || "";
    if (urlFilter) updateFilter("type", urlFilter);
    if (urlSort) updateFilter("sort", urlSort);
    setLocalSearch(urlQ);
    if ((urlFilter || urlSort || searchParams.get("genre")) && !urlQ) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [searchParams]);

  // Sync search into filters
  useEffect(() => {
    updateFilter("search", debouncedSearch);
  }, [debouncedSearch]);

  const handleGenreSelect = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) { params.set("genre", id); } else { params.delete("genre"); }
    if (filters.type) params.set("filter", filters.type);
    setSearchParams(params, { replace: true });
    // Also set genre in filters for the FilterBar
    const genreName = id ? GENRE_ID_TO_NAME[id] || null : null;
    updateFilter("genre", genreName);
  };

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topManga"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteFilteredManga"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteMangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["hybridMangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteSearchManga"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhua"] });
    await queryClient.invalidateQueries({ queryKey: ["mangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["newThisWeekManga"] });
    await queryClient.invalidateQueries({ queryKey: ["completedManga"] });
    await queryClient.invalidateQueries({ queryKey: ["recentlyUpdatedManga"] });
  }, [queryClient]);

  // Data
  const { data: mangaOnly, isLoading: mangaLoading, isError: mangaError, refetch: refetchManga } = useTopManga(1, 'manga');
  const { data: recentlyUpdatedManga, isLoading: recentlyUpdatedMangaLoading, isError: recentlyUpdatedMangaError, refetch: refetchRecentlyUpdatedManga } = useRecentlyUpdatedManga(1);

  const genreName = genreId ? GENRE_ID_TO_NAME[genreId] || genreId : "";
  const isNicheGenre = !!genreName && isNicheTagGenre(genreName);

  // Use unified filtered hook for the main grid when filters are active
  const hasAdvancedFilters = !!(filters.genre || filters.year || filters.status || filters.scoreMin || filters.sort !== "popularity");
  const infiniteFiltered = useInfiniteFilteredManga(filters);
  const infiniteGenre = useInfiniteMangaByGenre(genreName, typeFilter || undefined, 
    filters.sort === "score" ? "SCORE_DESC" : filters.sort === "trending" ? "TRENDING_DESC" : "POPULARITY_DESC");
  const hybridGenre = useHybridMangaByGenre(isNicheGenre ? genreName : "", typeFilter || undefined,
    filters.sort === "score" ? "SCORE_DESC" : filters.sort === "trending" ? "TRENDING_DESC" : "POPULARITY_DESC");
  const infiniteSearch = useInfiniteSearchManga(debouncedSearch, isSearching, typeFilter || undefined);

  // Pick the right data source
  const activeInfinite = isSearching 
    ? infiniteSearch 
    : genreId && !hasAdvancedFilters 
      ? (isNicheGenre ? hybridGenre : infiniteGenre) 
      : infiniteFiltered;
  const allItems = activeInfinite.data?.pages.flat() ?? [];
  const gridLoading = activeInfinite.isLoading;
  const isFetchingNext = activeInfinite.isFetchingNextPage;
  const hasNextPage = activeInfinite.hasNextPage;

  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({ threshold: 0, rootMargin: "400px 0px" });
  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNext) activeInfinite.fetchNextPage();
  }, [loadMoreInView, hasNextPage, isFetchingNext, activeInfinite]);

  const topRatedManga = useMemo(() =>
    [...(mangaOnly || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12),
    [mangaOnly]
  );

  const showCarousels = !isSearching && !genreId && !hasAdvancedFilters;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <SEO
        title="Browse Manga"
        description="Discover top manga, manhwa, and manhua. Browse by genre, popularity, and ratings on Bibue."
        url="/manga"
        jsonLd={itemListJsonLd("Browse Manga", "/manga")}
      />
      <CollapsibleNavbar />

      {/* ── Search & Filters ── */}
      <section className="pt-24 sm:pt-28 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-6 sm:mb-8">
            <SearchDropdown
              type="manga"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search any manga…"
              size="large"
            />
          </div>

          <h1 className="text-2xl sm:text-4xl md:text-5xl font-sacred font-bold tracking-tight mb-1 line-clamp-1">
            {genreId ? genreName : isSearching ? `"${debouncedSearch}"` : "Browse"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6">
            {genreId
              ? `Top ${typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + " " : ""}${genreName} series`
              : "Your discovery hub for manga, manhwa & manhua."
            }
          </p>

          {/* FilterBar */}
          <FilterBar
            filters={filters}
            onFilterChange={updateFilter}
            onReset={resetFilters}
            activeCount={activeCount}
            mediaType="manga"
            lockedGenre={genreId ? genreName : undefined}
          />

          {/* Genre Swipe Bar */}
          {!isSearching && (
            <div className="mt-3">
              <GenreSwipeBar onSelect={handleGenreSelect} activeGenre={genreId} />
            </div>
          )}

          <div className="flex items-center gap-1.5 mt-3">
            <div className="flex-1" />
            {user && (
              <Link
                to="/recommendations"
                className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 btn-press"
              >
                For You
              </Link>
            )}
            <Link
              to="/watchlist?type=manga"
              className="px-3.5 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 btn-press"
            >
              Saved
            </Link>
          </div>
        </div>
      </section>

      {/* ── Carousel Sections (hidden when searching or genre-filtered) ── */}
      {showCarousels && (
        <>
          <ContinueReadingRow />
          <ContentSection title={t("manga.recentlyUpdated")} titleJp={t("manga.recentlyUpdatedJp")} icon={RefreshCw} linkTo="/manga">
            {recentlyUpdatedMangaError ? (
              <SectionError onRetry={() => refetchRecentlyUpdatedManga()} />
            ) : isMobile ? (
              <HorizontalScroll showArrows={false}>
                {recentlyUpdatedMangaLoading ? (
                  <CardSkeletonRow count={6} itemClassName="w-28" />
                ) : (
                  recentlyUpdatedManga
                    ?.filter((m) => {
                      if (!typeFilter) return true;
                      if (typeFilter === "manhwa") return m.countryOfOrigin === "KR";
                      if (typeFilter === "manhua") return m.countryOfOrigin === "CN";
                      return m.countryOfOrigin === "JP" || (!m.countryOfOrigin || (m.countryOfOrigin !== "KR" && m.countryOfOrigin !== "CN"));
                    })
                    .slice(0, 12)
                    .map((manga, index) => (
                      <div key={manga.anilist_id} className="flex-shrink-0 w-36 sm:w-40">
                        <MangaCard manga={manga} index={index} />
                      </div>
                    ))
                )}
              </HorizontalScroll>
            ) : (
              recentlyUpdatedMangaLoading ? (
                <div className="grid gap-4 grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                  {recentlyUpdatedManga
                    ?.filter((m) => {
                      if (!typeFilter) return true;
                      if (typeFilter === "manhwa") return m.countryOfOrigin === "KR";
                      if (typeFilter === "manhua") return m.countryOfOrigin === "CN";
                      return m.countryOfOrigin === "JP" || (!m.countryOfOrigin || (m.countryOfOrigin !== "KR" && m.countryOfOrigin !== "CN"));
                    })
                    .slice(0, 14)
                    .map((manga, index) => (
                      <MangaCard key={manga.anilist_id} manga={manga} index={index} />
                    ))
                  }
                </div>
              )
            )}
          </ContentSection>

          {/* Most Popular Manga */}
          {(!typeFilter || typeFilter === "manga") && (
            <ContentSection title={t("manga.mostPopular")} titleJp={t("manga.mostPopularJp")} icon={TrendingUp} linkTo="/manga?filter=manga">
              {mangaError ? <SectionError onRetry={() => refetchManga()} /> : (
                <HorizontalScroll showArrows={!isMobile}>
                  {mangaLoading ? <CardSkeletonRow count={6} itemClassName="w-36 sm:w-40 md:w-48" /> : (
                    mangaOnly?.slice(0, 12).map((manga, index) => (
                      <div key={manga.anilist_id} className="flex-shrink-0 w-36 sm:w-40 md:w-48">
                        <MangaCard manga={manga} index={index} />
                      </div>
                    ))
                  )}
                </HorizontalScroll>
              )}
            </ContentSection>
          )}

          {/* Top Rated */}
          {(!typeFilter || typeFilter === "manga") && (
            <ContentSection title={t("manga.topRated")} titleJp={t("manga.topRatedJp")} icon={Trophy} linkTo="/manga?filter=manga&sort=score">
              {mangaError ? <SectionError onRetry={() => refetchManga()} /> : (
                <HorizontalScroll showArrows={!isMobile}>
                  {mangaLoading ? <CardSkeletonRow count={6} itemClassName="w-36 sm:w-40 md:w-48" /> : (
                    topRatedManga?.map((manga, index) => (
                      <div key={manga.anilist_id} className="flex-shrink-0 w-36 sm:w-40 md:w-48">
                        <MangaCard manga={manga} index={index} />
                      </div>
                    ))
                  )}
                </HorizontalScroll>
              )}
            </ContentSection>
          )}

          {/* Deferred sections */}
          {(!typeFilter || typeFilter === "manhwa") && <DeferredTrendingManhwaSection isMobile={isMobile} />}
          {(!typeFilter || typeFilter === "manhwa") && <DeferredTopManhwaSection isMobile={isMobile} />}
          {(!typeFilter || typeFilter === "manhua") && <DeferredTrendingManhuaSection isMobile={isMobile} />}
          {(!typeFilter || typeFilter === "manhua") && <DeferredTopManhuaSection isMobile={isMobile} />}
          {!typeFilter && <DeferredNewThisWeekSection isMobile={isMobile} />}
          {!typeFilter && <DeferredCompletedSection isMobile={isMobile} />}
        </>
      )}

      {/* Results anchor */}
      <div ref={resultsRef} />

      {/* ── Main Grid ── */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {isSearching
              ? `Results for "${debouncedSearch}"`
              : genreId
                ? `Top ${typeFilter ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + " " : ""}${genreName}`
                : typeFilter
                  ? `Top ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`
                  : t("manga.topManga")}
          </h2>

          {isSearching && gridLoading ? (
            <div className="grid place-items-center rounded-2xl min-h-[320px]">
              <div className="flex flex-col items-center text-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching for "{debouncedSearch}"</p>
              </div>
            </div>
          ) : isSearching && !gridLoading && allItems.length === 0 ? (
            <div className="rounded-2xl border border-border/50 bg-card/50 py-16">
              <div className="flex flex-col items-center text-center gap-3 px-6">
                <Search className="w-10 h-10 text-muted-foreground/40" />
                <p className="text-base font-medium">No matches for "{debouncedSearch}"</p>
                <p className="text-sm text-muted-foreground">Try broadening your search or adjusting filters.</p>
                <Button variant="outline" onClick={() => setLocalSearch("")} className="rounded-full mt-2">
                  Clear Search
                </Button>
              </div>
            </div>
          ) : gridLoading ? (
            <div className="grid gap-3 sm:gap-5 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {Array.from({ length: 18 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[3/4] rounded-2xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-5 grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                {allItems.map((manga, index) => (
                  <MangaCard key={`${manga.anilist_id}-${index}`} manga={manga} index={index} />
                ))}
              </div>
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNext && <Loader2 className="w-6 h-6 animate-spin text-primary" />}
                {!hasNextPage && allItems.length > 0 && (
                  <p className="text-sm text-muted-foreground">{t("common.noMoreResults") || "No more results"}</p>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Data Source Attribution ── */}
      <section className="pb-6">
        <div className="container mx-auto px-4">
          <p className="text-[10px] sm:text-xs text-muted-foreground/50 text-center">
            Powered by <span className="font-medium text-muted-foreground/70">AniList</span> + <span className="font-medium text-muted-foreground/70">MangaDex</span> + <span className="font-medium text-muted-foreground/70">MyAnimeList</span>
          </p>
        </div>
      </section>

      <Footer />
    </PullToRefresh>
  );
}
