import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { DeferredPopularSection, DeferredUpcomingSection, DeferredClassicSection, DeferredAllTimeTopSection, DeferredGenreSection } from "@/components/DeferredAnimeSections";
import { Bookmark, Sparkles, Loader2, Flame, Users, Swords, Heart, Wand2, Rocket, RefreshCw } from "lucide-react";
import { SectionError } from "@/components/SectionError";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { MobileAnimeCard } from "@/components/MobileAnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { BrowseFilterBar } from "@/components/BrowseFilterBar";
import { ContentSection } from "@/components/ContentSection";

import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";
import { ScheduleSection } from "@/components/ScheduleSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CardSkeletonRow } from "@/components/skeletons";
import { useTopAnime, useSeasonalAnime, useSearchAnime, useRecentlyUpdatedAnime } from "@/hooks/useAnimeData";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") as 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'seasonal' | 'new' | 'completed' | undefined;
  const genreId = searchParams.get("genre");
  
  const [filter, setFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'new' | 'completed' | undefined>(
    initialFilter === 'seasonal' ? undefined : initialFilter
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'popularity' | 'trending'>('popularity');
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  
  // Sync state FROM URL when params change (e.g. "See All" link clicked)
  useEffect(() => {
    const urlFilter = searchParams.get("filter") as typeof initialFilter;
    const urlQ = searchParams.get("q") || "";
    
    const mappedFilter = urlFilter === 'seasonal' ? undefined : urlFilter || undefined;
    setFilter(mappedFilter);
    setLocalSearch(urlQ);

    // Auto-scroll to results grid when navigated via "See All"
    if (urlFilter && !urlQ) {
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [searchParams]);

  // Debounce search input (150ms default for faster response)
  const debouncedSearch = useDebounce(localSearch.trim());

  // Sync URL when debounced value changes (only from user interaction)
  const isUserAction = useRef(false);
  
  const handleFilterChange = (newFilter: typeof filter) => {
    isUserAction.current = true;
    setFilter(newFilter);
  };

  useEffect(() => {
    // Skip URL sync if change came from URL (avoid loop)
    if (!isUserAction.current && !localSearch) return;
    isUserAction.current = false;
    
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (filter) params.set("filter", filter);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, filter, genreId, setSearchParams]);

  const isSearching = debouncedSearch.length > 0;

  const clearSearch = () => {
    setLocalSearch("");
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["seasonalAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["classicAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["allTimeTopAnime"] });
    await queryClient.invalidateQueries({ queryKey: ["animeByGenre"] });
    await queryClient.invalidateQueries({ queryKey: ["recentlyUpdatedAnime"] });
  }, [queryClient]);

  // Only eagerly load the first 2 above-fold sections + search/filter data
  const { data: topAnime, isLoading: topLoading } = useTopAnime(1, filter);
  const { data: airingAnime, isLoading: airingLoading, isError: airingError, refetch: refetchAiring } = useTopAnime(1, 'airing');
  const { data: seasonalAnime, isLoading: seasonalLoading, isError: seasonalError, refetch: refetchSeasonal } = useSeasonalAnime();
  const { data: searchResults, isLoading: searchLoading } = useSearchAnime(debouncedSearch, !!debouncedSearch);
  const { data: recentlyUpdatedAnime, isLoading: recentlyUpdatedLoading, isError: recentlyUpdatedError, refetch: refetchRecentlyUpdated } = useRecentlyUpdatedAnime(1);
  
  const sortedSeasonalAnime = seasonalAnime?.slice().sort((a, b) => {
    const aIsAiring = a.status === "Currently Airing" ? 1 : 0;
    const bIsAiring = b.status === "Currently Airing" ? 1 : 0;
    if (bIsAiring !== aIsAiring) return bIsAiring - aIsAiring;
    return (b.members || 0) - (a.members || 0);
  });

  // Sort the display anime based on sortBy selection
  const sortedDisplayAnime = useMemo(() => {
    const baseData = isSearching 
      ? searchResults 
      : initialFilter === 'seasonal' 
        ? seasonalAnime 
        : topAnime;
    
    if (!baseData) return [];
    
    const list = [...baseData];
    switch (sortBy) {
      case 'score':
        return list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
      case 'trending':
        return list.sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0));
      case 'popularity':
      default:
        return list.sort((a, b) => (b.members ?? 0) - (a.members ?? 0));
    }
  }, [isSearching, searchResults, initialFilter, seasonalAnime, topAnime, sortBy]);

  const displayAnime = sortedDisplayAnime;
  const isLoading = isSearching ? searchLoading : (initialFilter === 'seasonal' ? seasonalLoading : topLoading);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <CollapsibleNavbar />

      {/* Hero with Search */}
      <section className="pt-28 sm:pt-32 pb-6 sm:pb-8">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Discover Anime
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-6">アニメを発見</p>
            
            {/* Search Input */}
            <SearchDropdown
              type="anime"
              value={localSearch}
              onChange={setLocalSearch}
              placeholder="Search anime by title..."
            />

            {/* Action Buttons */}
            <div className="flex justify-center gap-3 mt-6">
              {user ? (
                <>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                    <Link to="/recommendations">
                      <Sparkles className="w-4 h-4" />
                      For You
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                    <Link to="/community">
                      <Users className="w-4 h-4" />
                      Community
                    </Link>
                  </Button>
                </>
              ) : null}
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/watchlist?type=anime">
                  <Bookmark className="w-4 h-4" />
                  Saved
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Browse & Filter - Hide when searching */}
      {!isSearching && (
        <section className="py-2">
          <div className="container mx-auto px-3 sm:px-4">
            <BrowseFilterBar
              type="anime"
              filter={filter}
              sortBy={sortBy}
              viewMode={viewMode}
              onFilterChange={(f) => { isUserAction.current = true; handleFilterChange(f as typeof filter); }}
              onSortChange={(s) => { isUserAction.current = true; setSortBy(s); }}
              onViewModeChange={setViewMode}
            />
          </div>
        </section>
      )}

      {/* Trending Now - Hide when searching or genre filtering */}
      {!isSearching && !genreId && (
        <ContentSection
          title="Trending Now"
          titleJp="トレンド"
          icon={Flame}
          linkTo="/anime?filter=airing"
          compact
        >
          {airingError ? (
            <SectionError onRetry={() => refetchAiring()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
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
      )}

      {/* Recently Updated */}
      {!isSearching && !genreId && (
        <ContentSection
          title="Recently Updated"
          titleJp="最近更新"
          icon={RefreshCw}
          linkTo="/anime?filter=airing"
          compact
        >
          {recentlyUpdatedError ? (
            <SectionError onRetry={() => refetchRecentlyUpdated()} />
          ) : (
            <HorizontalScroll showArrows={!isMobile}>
              {recentlyUpdatedLoading ? (
                <CardSkeletonRow count={6} variant={isMobile ? "mobile" : "default"} itemClassName="w-32 sm:w-40 md:w-44" />
              ) : (
                recentlyUpdatedAnime?.slice(0, 12).map((anime, index) => (
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
      )}

      {/* Today's Schedule - Hide when searching */}
      {!isSearching && !genreId && <ScheduleSection />}

      {/* This Season */}
      {!isSearching && !genreId && (
        <ContentSection
          title="This Season"
          titleJp="今季"
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
                sortedSeasonalAnime?.slice(0, 12).map((anime, index) => (
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
      )}

      {/* Most Popular - Deferred */}
      {!isSearching && !genreId && <DeferredPopularSection isMobile={isMobile} />}

      {/* Coming Soon - Deferred */}
      {!isSearching && !genreId && <DeferredUpcomingSection isMobile={isMobile} />}

      {/* Classic Anime - Deferred */}
      {!isSearching && !genreId && <DeferredClassicSection isMobile={isMobile} />}

      {/* All-Time Top Rated - Deferred */}
      {!isSearching && !genreId && <DeferredAllTimeTopSection isMobile={isMobile} />}

      {/* Genre Sections - Deferred */}
      {!isSearching && !genreId && <DeferredGenreSection genre="Action" titleJp="アクション" icon={Swords} linkTo="/anime?genre=1" isMobile={isMobile} />}
      {!isSearching && !genreId && <DeferredGenreSection genre="Romance" titleJp="ロマンス" icon={Heart} linkTo="/anime?genre=22" isMobile={isMobile} />}
      {!isSearching && !genreId && <DeferredGenreSection genre="Fantasy" titleJp="ファンタジー" icon={Wand2} linkTo="/anime?genre=10" isMobile={isMobile} />}
      {!isSearching && !genreId && <DeferredGenreSection genre="Sci-Fi" titleJp="SF" icon={Rocket} linkTo="/anime?genre=24" isMobile={isMobile} />}

      {/* Results anchor */}
      <div ref={resultsRef} />

      {/* Active Filters Chips */}
      {(filter || sortBy !== 'popularity' || genreId) && (
        <section className="pb-2">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filter && (
                <button
                  onClick={() => { isUserAction.current = true; setFilter(undefined); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  Status: {filter === 'bypopularity' ? 'Popular' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="text-primary/60 text-sm">×</span>
                </button>
              )}
              {sortBy !== 'popularity' && (
                <button
                  onClick={() => { isUserAction.current = true; setSortBy('popularity'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-95 min-h-[36px] sm:min-h-0"
                >
                  Sort: {sortBy === 'score' ? 'Top Rated' : 'Trending'}
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

      {/* All Anime Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {isSearching 
              ? `Search results for "${debouncedSearch}"` 
              : `${initialFilter === 'seasonal' ? "This Season's" : filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Top Rated"} Anime`}
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
          ) : isSearching && !isLoading && (displayAnime?.length ?? 0) === 0 ? (
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
              {displayAnime?.map((anime, index) => (
                viewMode === "grid" ? (
                  <AnimeCard key={anime.anilist_id} anime={anime} index={index} />
                ) : (
                  <AnimeCard key={anime.anilist_id} anime={anime} index={index} variant="compact" />
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
