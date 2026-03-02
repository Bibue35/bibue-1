import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, Bookmark, Sparkles, Loader2, Flame, TrendingUp, Trophy, Star, Zap, Users, Swords, Heart, Wand2, BookOpen, CheckCircle, RefreshCw, SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { DeferredTrendingManhwaSection, DeferredTopManhwaSection, DeferredTrendingManhuaSection, DeferredTopManhuaSection, DeferredNewThisWeekSection, DeferredCompletedSection, DeferredMangaGenreSection } from "@/components/DeferredMangaSections";
import { SectionError } from "@/components/SectionError";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";

import { ContentSection } from "@/components/ContentSection";
import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CardSkeletonRow } from "@/components/skeletons";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTopManga, useRecentlyUpdatedManga, useInfiniteTopManga, useInfiniteMangaByGenre, useInfiniteSearchManga } from "@/hooks/useAnimeData";
import { useInView } from "@/hooks/useInView";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

type SortOption = "popularity" | "score" | "newest";

const GENRE_ID_TO_NAME: Record<string, string> = {
  "1": "Action", "2": "Adventure", "4": "Comedy", "7": "Mystery", "8": "Drama",
  "10": "Fantasy", "13": "Historical", "14": "Horror", "22": "Romance",
  "24": "Sci-Fi", "25": "Shoujo", "27": "Shounen", "28": "Seinen",
  "30": "Sports", "36": "Slice of Life", "37": "Supernatural", "38": "Military",
  "40": "Psychological", "41": "Isekai", "42": "Josei", "73": "School", "101": "Thriller",
};

const QUICK_GENRES = [
  { id: "1", label: "Action" },
  { id: "22", label: "Romance" },
  { id: "10", label: "Fantasy" },
  { id: "41", label: "Isekai" },
  { id: "8", label: "Drama" },
  { id: "4", label: "Comedy" },
  { id: "14", label: "Horror" },
  { id: "37", label: "Supernatural" },
  { id: "7", label: "Mystery" },
  { id: "40", label: "Psychological" },
  { id: "36", label: "Slice of Life" },
  { id: "27", label: "Shounen" },
  { id: "25", label: "Shoujo" },
  { id: "28", label: "Seinen" },
  { id: "42", label: "Josei" },
  { id: "13", label: "Historical" },
  { id: "101", label: "Thriller" },
  { id: "30", label: "Sports" },
];

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");
  const filterParam = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
  const sortParam = searchParams.get("sort") as SortOption | null;
  const collectionParam = searchParams.get("collection") as "new" | "completed" | null;
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "manhwa" | "manhua">(filterParam || "all");
  const [sortBy, setSortBy] = useState<SortOption>(sortParam || "popularity");
  const [collection, setCollection] = useState<"new" | "completed" | null>(collectionParam);
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  // Debounce search input (150ms default for faster response)
  const debouncedSearch = useDebounce(localSearch.trim());

  // Sync state FROM URL when params change (e.g. "See All" link clicked)
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
    const urlSort = searchParams.get("sort") as SortOption | null;
    const urlQ = searchParams.get("q") || "";
    const urlCollection = searchParams.get("collection") as "new" | "completed" | null;

    setTypeFilter(urlFilter || "all");
    setSortBy(urlSort || "popularity");
    setLocalSearch(urlQ);
    setCollection(urlCollection);

    // Auto-scroll to results grid when navigated via "See All" or collection
    if ((urlFilter || urlSort || urlCollection) && !urlQ) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchParams]);

  const isSearching = debouncedSearch.length > 0;

  const clearSearch = () => {
    setLocalSearch("");
  };

  const handleTypeFilter = (filter: "all" | "manga" | "manhwa" | "manhua") => {
    isUserAction.current = true;
    setTypeFilter(filter);
  };

  // Sync URL when state changes from user interaction
  const isUserAction = useRef(false);

  useEffect(() => {
    if (!isUserAction.current && !localSearch) return;
    isUserAction.current = false;

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (typeFilter !== "all") params.set("filter", typeFilter);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, typeFilter, sortBy, genreId, setSearchParams]);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topManga"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteTopManga"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteMangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["infiniteSearchManga"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhua"] });
    await queryClient.invalidateQueries({ queryKey: ["mangaByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["newThisWeekManga"] });
    await queryClient.invalidateQueries({ queryKey: ["completedManga"] });
    await queryClient.invalidateQueries({ queryKey: ["recentlyUpdatedManga"] });
  }, [queryClient]);

  // Only eagerly load above-fold sections
  const { data: mangaOnly, isLoading: mangaLoading, isError: mangaError, refetch: refetchManga } = useTopManga(1, 'manga');
  const { data: recentlyUpdatedManga, isLoading: recentlyUpdatedMangaLoading, isError: recentlyUpdatedMangaError, refetch: refetchRecentlyUpdatedManga } = useRecentlyUpdatedManga(1);

  // Infinite scroll queries for bottom grid
  const sortToAniList = (s: SortOption) => {
    if (s === "score") return "SCORE_DESC" as const;
    if (s === "newest") return "TRENDING_DESC" as const;
    return "POPULARITY_DESC" as const;
  };

  const genreName = genreId ? GENRE_ID_TO_NAME[genreId] || genreId : "";

  const infiniteTop = useInfiniteTopManga(
    typeFilter === "all" ? undefined : typeFilter,
    sortBy
  );
  const infiniteGenre = useInfiniteMangaByGenre(
    genreName,
    typeFilter === "all" ? undefined : typeFilter,
    sortToAniList(sortBy)
  );
  const infiniteSearch = useInfiniteSearchManga(
    debouncedSearch,
    isSearching,
    typeFilter === "all" ? undefined : typeFilter
  );

  // Pick the right infinite query
  const activeInfinite = isSearching ? infiniteSearch : genreId ? infiniteGenre : infiniteTop;
  const allItems = activeInfinite.data?.pages.flat() ?? [];
  const gridLoading = activeInfinite.isLoading;
  const isFetchingNext = activeInfinite.isFetchingNextPage;
  const hasNextPage = activeInfinite.hasNextPage;

  // Intersection observer for infinite scroll
  const { ref: loadMoreRef, isInView: loadMoreInView } = useInView({ threshold: 0, rootMargin: "400px 0px" });

  useEffect(() => {
    if (loadMoreInView && hasNextPage && !isFetchingNext) {
      activeInfinite.fetchNextPage();
    }
  }, [loadMoreInView, hasNextPage, isFetchingNext, activeInfinite]);

  // Get top rated manga (sorted by score)
  const topRatedManga = useMemo(() => {
    return [...(mangaOnly || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12);
  }, [mangaOnly]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <SEO
        title="Browse Manga"
        description="Discover top manga, manhwa, and manhua. Browse by genre, popularity, and ratings on Bibue."
        url="/manga"
        jsonLd={itemListJsonLd("Browse Manga", "/manga")}
      />
      <CollapsibleNavbar />

      {/* Apple-style Search Hero */}
      <section className="pt-24 sm:pt-28 pb-4 sm:pb-6">
        <div className="container mx-auto px-4">
          {/* Large Search Bar */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <SearchDropdown
              type="manga"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search any manga… (One Piece, Jujutsu Kaisen, genre, author, year...)"
              size="large"
            />
          </div>

          {/* Advanced Filters Row */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Type Filter */}
            {(["all", "manga", "manhwa", "manhua"] as const).map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? "default" : "outline"}
                size="sm"
                className="rounded-full capitalize"
                onClick={() => handleTypeFilter(type)}
              >
                {type === "all" ? t("common.all") : type.charAt(0).toUpperCase() + type.slice(1)}
              </Button>
            ))}

            <div className="w-px h-6 bg-border/40 mx-1 hidden sm:block" />

            {/* Sort */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Sort: {sortBy === "popularity" ? "Trending" : sortBy === "score" ? "Top Rated" : "Newest"}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-44 p-2" align="start">
                {([
                  { value: "popularity" as const, label: "Trending" },
                  { value: "score" as const, label: "Top Rated" },
                  { value: "newest" as const, label: "Newest" },
                ] as const).map((s) => (
                  <button
                    key={s.value}
                    onClick={() => { isUserAction.current = true; setSortBy(s.value); }}
                    className={cn(
                      "w-full text-left px-3 py-2 rounded-lg text-sm transition-colors",
                      sortBy === s.value ? "bg-primary/10 text-primary font-medium" : "hover:bg-muted"
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </PopoverContent>
            </Popover>

            {/* Genre Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant={genreId ? "default" : "outline"} size="sm" className="rounded-full gap-1.5">
                  {genreId ? GENRE_ID_TO_NAME[genreId] || "Genre" : "Genre"}
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="start">
                <div className="grid grid-cols-2 gap-1.5 max-h-64 overflow-y-auto">
                  {genreId && (
                    <button
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.delete("genre");
                        setSearchParams(params, { replace: true });
                      }}
                      className="col-span-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      ✕ Clear Genre
                    </button>
                  )}
                  {QUICK_GENRES.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set("genre", g.id);
                        if (typeFilter !== "all") params.set("filter", typeFilter);
                        setSearchParams(params, { replace: true });
                      }}
                      className={cn(
                        "px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left",
                        genreId === g.id ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex-1" />
            
            {user && (
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/recommendations">
                  <Sparkles className="w-4 h-4" />
                  {t("nav.forYou")}
                </Link>
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
              <Link to="/watchlist?type=manga">
                <Bookmark className="w-4 h-4" />
                {t("nav.saved")}
              </Link>
            </Button>
          </div>

          {/* Page Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2">
            Browse Manga
          </h1>
          <p className="text-sm text-muted-foreground mb-4">Your discovery hub for manga, manhwa & manhua — search, filter, explore.</p>
        </div>
      </section>

      {/* Recently Updated — filter by typeFilter client-side */}
      {!isSearching && !genreId && (
        <ContentSection
          title={t("manga.recentlyUpdated")}
          titleJp={t("manga.recentlyUpdatedJp")}
          icon={RefreshCw}
          linkTo="/manga"
        >
          {recentlyUpdatedMangaError ? (
            <SectionError onRetry={() => refetchRecentlyUpdatedManga()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {recentlyUpdatedMangaLoading ? (
                <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
              ) : (
                recentlyUpdatedManga
                  ?.filter((m) => {
                    if (typeFilter === "all") return true;
                    if (typeFilter === "manhwa") return m.countryOfOrigin === "KR";
                    if (typeFilter === "manhua") return m.countryOfOrigin === "CN";
                    // "manga" = JP (or anything not KR/CN)
                    return m.countryOfOrigin === "JP" || (!m.countryOfOrigin || (m.countryOfOrigin !== "KR" && m.countryOfOrigin !== "CN"));
                  })
                  .slice(0, 12)
                  .map((manga, index) => (
                    <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                      <MangaCard manga={manga} index={index} />
                    </div>
                  ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {/* Most Popular Manga */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manga") && (
        <ContentSection
          title={t("manga.mostPopular")}
          titleJp={t("manga.mostPopularJp")}
          icon={TrendingUp}
          linkTo="/manga?filter=manga"
        >
          {mangaError ? (
            <SectionError onRetry={() => refetchManga()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {mangaLoading ? (
                <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
              ) : (
                mangaOnly?.slice(0, 12).map((manga, index) => (
                  <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                    <MangaCard manga={manga} index={index} />
                  </div>
                ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {/* Top Rated Manga */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manga") && (
        <ContentSection
          title={t("manga.topRated")}
          titleJp={t("manga.topRatedJp")}
          icon={Trophy}
          linkTo="/manga?filter=manga&sort=score"
        >
          {mangaError ? (
            <SectionError onRetry={() => refetchManga()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {mangaLoading ? (
                <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
              ) : (
                topRatedManga?.map((manga, index) => (
                  <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                    <MangaCard manga={manga} index={index} />
                  </div>
                ))
              )}
            </HorizontalScroll>
          )}
        </ContentSection>
      )}

      {/* Trending Manhwa - Deferred */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manhwa") && <DeferredTrendingManhwaSection isMobile={isMobile} />}

      {/* Top Manhwa - Deferred */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manhwa") && <DeferredTopManhwaSection isMobile={isMobile} />}

      {/* Trending Manhua - Deferred */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manhua") && <DeferredTrendingManhuaSection isMobile={isMobile} />}

      {/* Top Manhua - Deferred */}
      {!isSearching && !genreId && (typeFilter === "all" || typeFilter === "manhua") && <DeferredTopManhuaSection isMobile={isMobile} />}

      {/* New This Week - Deferred (only show when no specific type filter since this section doesn't filter by type) */}
      {!isSearching && !genreId && typeFilter === "all" && <DeferredNewThisWeekSection isMobile={isMobile} />}

      {/* Completed Series - Deferred (same: only when typeFilter is "all") */}
      {!isSearching && !genreId && typeFilter === "all" && <DeferredCompletedSection isMobile={isMobile} />}

      {/* Genre Sections - Deferred */}
      {!isSearching && !genreId && <DeferredMangaGenreSection genre="Action" titleJp="アクション" icon={Swords} linkTo={`/manga?genre=1${typeFilter !== "all" ? `&filter=${typeFilter}` : ""}`} isMobile={isMobile} />}
      {!isSearching && !genreId && <DeferredMangaGenreSection genre="Romance" titleJp="ロマンス" icon={Heart} linkTo={`/manga?genre=22${typeFilter !== "all" ? `&filter=${typeFilter}` : ""}`} isMobile={isMobile} />}
      {!isSearching && !genreId && <DeferredMangaGenreSection genre="Fantasy" titleJp="ファンタジー" icon={Wand2} linkTo={`/manga?genre=10${typeFilter !== "all" ? `&filter=${typeFilter}` : ""}`} isMobile={isMobile} />}

      {/* Results anchor */}
      <div ref={resultsRef} />

      {/* Active Filters Chips */}
      {(typeFilter !== "all" || sortBy !== "popularity" || genreId) && (
        <section className="pb-2">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">{t("browse.activeFilters")}:</span>
              {typeFilter !== "all" && (
                <button
                  onClick={() => { isUserAction.current = true; setTypeFilter("all"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  {t("browse.type")}: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                  <span className="text-primary/60 text-sm">×</span>
                </button>
              )}
              {sortBy !== "popularity" && (
                <button
                  onClick={() => { isUserAction.current = true; setSortBy("popularity"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  {t("browse.sortBy")}: {sortBy === "score" ? t("browse.topRated") : t("browse.newest")}
                  <span className="text-primary/60 text-sm">×</span>
                </button>
              )}
              {genreId && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("genre");
                    setSearchParams(params, { replace: true });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  Genre: {genreId}
                  <span className="text-primary/60 text-sm">×</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Manga Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {isSearching 
              ? `${t("common.searchResults")} "${debouncedSearch}"` 
              : genreId
                ? `${typeFilter !== "all" ? typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1) + " — " : ""}${genreName}`
                : typeFilter !== "all" 
                  ? `Top ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`
                  : t("manga.topManga")}
          </h2>
          
          {isSearching && gridLoading ? (
            <div className={cn(
              "grid place-items-center rounded-2xl liquid-glass-subtle",
              viewMode === "grid" ? "min-h-[320px]" : "min-h-[220px]"
            )}>
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
                <Button variant="outline" onClick={clearSearch} className="rounded-full mt-2">
                  {t("common.clearSearch")}
                </Button>
              </div>
            </div>
          ) : gridLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-20 rounded-xl"} />
              ))}
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
                {allItems.map((manga, index) => (
                  viewMode === "grid" ? (
                    <MangaCard key={`${manga.anilist_id}-${index}`} manga={manga} index={index} />
                  ) : (
                    <MangaCard key={`${manga.anilist_id}-${index}`} manga={manga} index={index} variant="compact" />
                  )
                ))}
              </div>

              {/* Infinite scroll trigger */}
              <div ref={loadMoreRef} className="flex justify-center py-8">
                {isFetchingNext && (
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                )}
                {!hasNextPage && allItems.length > 0 && (
                  <p className="text-sm text-muted-foreground">{t("common.noMoreResults") || "No more results"}</p>
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
