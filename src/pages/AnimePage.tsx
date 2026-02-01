import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Grid, List, Bookmark, Sparkles, Loader2 } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { SearchDropdown } from "@/components/SearchDropdown";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopAnime, useSeasonalAnime, useSearchAnime } from "@/hooks/useAnimeData";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") as 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'seasonal' | undefined;
  const genreId = searchParams.get("genre");
  
  const [filter, setFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>(
    initialFilter === 'seasonal' ? undefined : initialFilter
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") || "");
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // Debounce search input (150ms default for faster response)
  const debouncedSearch = useDebounce(localSearch.trim());

  // Sync URL when debounced value changes
  useEffect(() => {
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

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
  };

  const { data: topAnime, isLoading: topLoading } = useTopAnime(1, filter);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: searchResults, isLoading: searchLoading } = useSearchAnime(debouncedSearch, !!debouncedSearch);
  
  const sortedSeasonalAnime = seasonalAnime?.slice().sort((a, b) => {
    const aIsAiring = a.status === "Currently Airing" ? 1 : 0;
    const bIsAiring = b.status === "Currently Airing" ? 1 : 0;
    if (bIsAiring !== aIsAiring) return bIsAiring - aIsAiring;
    return (b.members || 0) - (a.members || 0);
  });

  const displayAnime = isSearching 
    ? searchResults 
    : initialFilter === 'seasonal' 
      ? seasonalAnime 
      : topAnime;
  const isLoading = isSearching ? searchLoading : (initialFilter === 'seasonal' ? seasonalLoading : topLoading);

  return (
    <div className="min-h-screen bg-background">
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

            {/* Action Buttons - For You & Saved */}
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" size="sm" className="rounded-full gap-2" asChild>
                <Link to="/recommendations">
                  <Sparkles className="w-4 h-4" />
                  For You
                </Link>
              </Button>
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


      {/* Genres - Hide when searching */}
      {!isSearching && (
        <section className="py-2">
          <div className="container mx-auto px-4">
            <GenreSection type="anime" className="opacity-70 hover:opacity-100 transition-opacity" />
          </div>
        </section>
      )}

      {/* This Season - Hide when searching */}
      {!isSearching && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <HorizontalScroll title="This Season" titleJp="今季">
              {seasonalLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                    <Skeleton className="aspect-[2/3] rounded-2xl" />
                  </div>
                ))
              ) : (
                sortedSeasonalAnime?.slice(0, 12).map((anime, index) => (
                  <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                    <AnimeCard anime={anime} index={index} />
                  </div>
                ))
              )}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* Filters */}
      <section className="py-4" ref={resultsRef}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Sort by:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {([undefined, 'airing', 'upcoming', 'bypopularity', 'favorite'] as const).map((f) => (
                  <Button
                    key={f || 'all'}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFilterChange(f)}
                    className={cn(
                      "rounded-full text-xs sm:text-sm capitalize",
                      filter !== f && "glass-button"
                    )}
                  >
                    {f === undefined ? "Top Rated" : f === 'bypopularity' ? "Popular" : f}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-full"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-full"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Active Filters Chips */}
      {(filter || genreId) && (
        <section className="pb-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {filter && (
                <button
                  onClick={() => setFilter(undefined)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Sort: {filter === 'bypopularity' ? 'Popular' : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="text-primary/60">×</span>
                </button>
              )}
              {genreId && (
                <button
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.delete("genre");
                    setSearchParams(params, { replace: true });
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Genre: {genreId}
                  <span className="text-primary/60">×</span>
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* All Anime Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-4">
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
                  <AnimeCard key={anime.mal_id} anime={anime} index={index} />
                ) : (
                  <AnimeCard key={anime.mal_id} anime={anime} index={index} variant="compact" />
                )
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
