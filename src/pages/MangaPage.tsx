import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, Bookmark, Sparkles, Loader2, Flame, TrendingUp, Trophy, Star, Zap, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { ContentSection } from "@/components/ContentSection";
import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";
import { CardSkeletonRow } from "@/components/skeletons";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopManga, useSearchManga, useTrendingManhwa, useTrendingManhua } from "@/hooks/useAnimeData";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

type SortOption = "popularity" | "score" | "newest";

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");
  const filterParam = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
  const sortParam = searchParams.get("sort") as SortOption | null;
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "manhwa" | "manhua">(filterParam || "all");
  const [sortBy, setSortBy] = useState<SortOption>(sortParam || "popularity");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  // Debounce search input (150ms default for faster response)
  const debouncedSearch = useDebounce(localSearch.trim());

  // Sync state FROM URL when params change (e.g. "See All" link clicked)
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
    const urlSort = searchParams.get("sort") as SortOption | null;
    const urlQ = searchParams.get("q") || "";

    setTypeFilter(urlFilter || "all");
    setSortBy(urlSort || "popularity");
    setLocalSearch(urlQ);

    // Auto-scroll to results grid when navigated via "See All"
    if ((urlFilter || urlSort) && !urlQ) {
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
    await queryClient.invalidateQueries({ queryKey: ["trendingManhwa"] });
    await queryClient.invalidateQueries({ queryKey: ["trendingManhua"] });
  }, [queryClient]);

  // Fetch data based on type filter
  const { data: allManga, isLoading: allLoading } = useTopManga(1, undefined);
  const { data: mangaOnly, isLoading: mangaLoading } = useTopManga(1, 'manga');
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
  const { data: trendingManhwa, isLoading: trendingManhwaLoading } = useTrendingManhwa(1);
  const { data: trendingManhua, isLoading: trendingManhuaLoading } = useTrendingManhua(1);
  const { data: searchResults, isLoading: searchLoading } = useSearchManga(
    debouncedSearch,
    isSearching,
    typeFilter === "all" ? undefined : typeFilter,
  );

  // Select the correct data based on filter
  const getFilteredManga = () => {
    if (isSearching) return searchResults;
    switch (typeFilter) {
      case "manga": return mangaOnly;
      case "manhwa": return manhwa;
      case "manhua": return manhua;
      default: return allManga;
    }
  };

  const getFilterLoading = () => {
    if (isSearching) return searchLoading;
    switch (typeFilter) {
      case "manga": return mangaLoading;
      case "manhwa": return manhwaLoading;
      case "manhua": return manhuaLoading;
      default: return allLoading;
    }
  };

  const displayManga = getFilteredManga();
  const isLoading = getFilterLoading();

  const sortedManga = useMemo(() => {
    const list = (displayManga || []).slice();
    switch (sortBy) {
      case "score":
        return list.sort((a, b) => (b.score ?? -1) - (a.score ?? -1));
      case "newest":
        return list.sort(
          (a, b) =>
            (b.published?.from ? Date.parse(b.published.from) : 0) -
            (a.published?.from ? Date.parse(a.published.from) : 0),
        );
      case "popularity":
      default:
        return list.sort((a, b) => (b.popularity ?? -1) - (a.popularity ?? -1));
    }
  }, [displayManga, sortBy]);

  // Get top rated manga (sorted by score)
  const topRatedManga = useMemo(() => {
    return [...(mangaOnly || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12);
  }, [mangaOnly]);

  // Get top rated manhwa (sorted by score)
  const topRatedManhwa = useMemo(() => {
    return [...(manhwa || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12);
  }, [manhwa]);

  // Get top rated manhua (sorted by score)
  const topRatedManhua = useMemo(() => {
    return [...(manhua || [])].sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 12);
  }, [manhua]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <CollapsibleNavbar />

      {/* Hero with Search */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Discover Manga
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-6">漫画を発見</p>
            
            {/* Search Input */}
            <SearchDropdown
              type="manga"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search manga, manhwa, manhua..."
            />

            {/* Action Buttons - For You & Saved */}
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/recommendations">
                  <Sparkles className="w-4 h-4" />
                  For You
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/watchlist?type=manga">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </Link>
              </Button>
            </div>

            {/* Type Filter Buttons - Manga/Manhwa/Manhua */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {(["all", "manga", "manhwa", "manhua"] as const).map((filter) => (
                <Button
                  key={filter}
                  variant={typeFilter === filter ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleTypeFilter(filter)}
                  className={cn(
                    "rounded-full capitalize",
                    typeFilter !== filter && "glass-button"
                  )}
                >
                  {filter === "all" ? "All" : filter}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>


      {/* Genres - Hide when searching */}
      {!isSearching && (
        <section className="py-2">
          <div className="container mx-auto px-4">
            <GenreSection type="manga" className="opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </section>
      )}

      {/* Most Popular Manga - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manga") && (
        <ContentSection
          title="Most Popular Manga"
          titleJp="人気漫画"
          icon={TrendingUp}
          linkTo="/manga?filter=manga"
        >
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
        </ContentSection>
      )}

      {/* Top Rated Manga - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manga") && (
        <ContentSection
          title="Top Rated Manga"
          titleJp="高評価"
          icon={Trophy}
          linkTo="/rankings?type=manga&sort=score"
        >
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
        </ContentSection>
      )}

      {/* Trending Manhwa - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhwa") && (
        <ContentSection
          title="Trending Manhwa"
          titleJp="韓国漫画"
          icon={Zap}
          linkTo="/manga?filter=manhwa"
        >
          <HorizontalScroll showArrows={!isMobile}>
            {trendingManhwaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              trendingManhwa?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* Top Manhwa - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhwa") && (
        <ContentSection
          title="Top Manhwa"
          titleJp="韓国トップ"
          icon={Star}
          linkTo="/manga?filter=manhwa&sort=score"
        >
          <HorizontalScroll showArrows={!isMobile}>
            {manhwaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              topRatedManhwa?.map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* Trending Manhua - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhua") && (
        <ContentSection
          title="Trending Manhua"
          titleJp="中国漫画"
          icon={Zap}
          linkTo="/manga?filter=manhua"
        >
          <HorizontalScroll showArrows={!isMobile}>
            {trendingManhuaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              trendingManhua?.slice(0, 12).map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* Top Manhua - Hide when searching */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhua") && (
        <ContentSection
          title="Top Manhua"
          titleJp="中国トップ"
          icon={Star}
          linkTo="/manga?filter=manhua&sort=score"
        >
          <HorizontalScroll showArrows={!isMobile}>
            {manhuaLoading ? (
              <CardSkeletonRow count={6} itemClassName="w-28 sm:w-36 md:w-44" />
            ) : (
              topRatedManhua?.map((manga, index) => (
                <div key={manga.anilist_id} className="flex-shrink-0 w-28 sm:w-36 md:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </ContentSection>
      )}

      {/* Collapsible Filters Section */}
      <section className="py-4" ref={resultsRef}>
        <div className="container mx-auto px-4">
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primary/10">
                  <Filter className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold">Browse & Filter</h3>
              </div>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                  {isFiltersOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent className="space-y-4 transition-all duration-300">
              {/* Type Filter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Type:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["all", "manga", "manhwa", "manhua"] as const).map((f) => (
                    <Button
                      key={f}
                      variant={typeFilter === f ? "default" : "ghost"}
                      size="sm"
                      onClick={() => { isUserAction.current = true; setTypeFilter(f); }}
                      className={cn(
                        "rounded-full text-xs capitalize h-8",
                        typeFilter !== f && "glass-button"
                      )}
                    >
                      {f === "all" ? "All" : f}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Filter */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Sort by:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'popularity', label: 'Popular' },
                    { value: 'score', label: 'Top Rated' },
                    { value: 'newest', label: 'Newest' },
                  ] as const).map((sort) => (
                    <Button
                      key={sort.value}
                      variant={sortBy === sort.value ? "default" : "ghost"}
                      size="sm"
                      onClick={() => { isUserAction.current = true; setSortBy(sort.value); }}
                      className={cn(
                        "rounded-full text-xs h-8",
                        sortBy !== sort.value && "glass-button"
                      )}
                    >
                      {sort.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-border/30">
                <span className="text-xs text-muted-foreground">View mode:</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant={viewMode === "grid" ? "outline" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                    className="rounded-full h-8 w-8"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "outline" : "ghost"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                    className="rounded-full h-8 w-8"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </section>

      {/* Active Filters Chips */}
      {(typeFilter !== "all" || sortBy !== "popularity" || genreId) && (
        <section className="pb-2">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {typeFilter !== "all" && (
                <button
                  onClick={() => { isUserAction.current = true; setTypeFilter("all"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                  <span className="text-primary/60 text-sm">×</span>
                </button>
              )}
              {sortBy !== "popularity" && (
                <button
                  onClick={() => { isUserAction.current = true; setSortBy("popularity"); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  Sort: {sortBy === "score" ? "Top Rated" : "Newest"}
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
              ? `Search results for "${debouncedSearch}"` 
              : typeFilter !== "all" 
                ? `Top ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`
                : "Top Manga"}
          </h2>
          
          {isSearching && isLoading ? (
            <div className={cn(
              "grid place-items-center rounded-2xl liquid-glass-subtle",
              viewMode === "grid" ? "min-h-[320px]" : "min-h-[220px]"
            )}>
              <div className="flex flex-col items-center text-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching for "{debouncedSearch}"</p>
              </div>
            </div>
          ) : isSearching && !isLoading && (displayManga?.length ?? 0) === 0 ? (
            <div className="rounded-2xl liquid-glass-subtle py-12">
              <div className="flex flex-col items-center text-center gap-3 px-6">
                <p className="text-base font-medium">No results for "{debouncedSearch}"</p>
                <p className="text-sm text-muted-foreground">Check your spelling or try a different title</p>
                <Button variant="outline" onClick={clearSearch} className="rounded-full mt-2">
                  Clear search
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {Array.from({ length: 21 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-20 rounded-xl"} />
              ))}
            </div>
          ) : (
            <div className="grid gap-3 sm:gap-4 grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
              {sortedManga?.map((manga, index) => (
                viewMode === "grid" ? (
                  <MangaCard key={manga.anilist_id} manga={manga} index={index} />
                ) : (
                  <MangaCard key={manga.anilist_id} manga={manga} index={index} variant="compact" />
                )
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </PullToRefresh>
  );
}
