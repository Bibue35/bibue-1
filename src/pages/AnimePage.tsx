import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Filter, Grid, List, Search, Bookmark, Sparkles, Loader2 } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopAnime, useSeasonalAnime, useSearchAnime } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function AnimePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") as 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'seasonal' | undefined;
  const genreId = searchParams.get("genre");
  const searchQuery = searchParams.get("q") || "";
  
  const [filter, setFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>(
    initialFilter === 'seasonal' ? undefined : initialFilter
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const isSearching = searchQuery.trim().length > 0;

  const clearSearch = () => {
    setLocalSearch("");
    setSearchParams({});
  };

  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    const params = new URLSearchParams();
    if (newFilter) params.set("filter", newFilter);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localSearch.trim()) {
      setSearchParams({ q: localSearch.trim() });
    } else {
      setSearchParams({});
    }
  };

  const { data: topAnime, isLoading: topLoading } = useTopAnime(1, filter);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: searchResults, isLoading: searchLoading } = useSearchAnime(searchQuery, !!searchQuery);
  
  const sortedSeasonalAnime = seasonalAnime?.slice().sort((a, b) => {
    const aIsAiring = a.status === "Currently Airing" ? 1 : 0;
    const bIsAiring = b.status === "Currently Airing" ? 1 : 0;
    if (bIsAiring !== aIsAiring) return bIsAiring - aIsAiring;
    return (b.members || 0) - (a.members || 0);
  });

  const displayAnime = searchQuery 
    ? searchResults 
    : initialFilter === 'seasonal' 
      ? seasonalAnime 
      : topAnime;
  const isLoading = searchQuery ? searchLoading : (initialFilter === 'seasonal' ? seasonalLoading : topLoading);

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero with Search */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Discover Anime
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-6">アニメを発見</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <div className="liquid-glass-strong rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search anime by title..."
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full h-14 pl-14 pr-24 bg-transparent text-base sm:text-lg placeholder:text-muted-foreground focus:outline-none rounded-2xl"
                />
                <Button 
                  type="submit" 
                  size="sm" 
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-4"
                >
                  Search
                </Button>
              </div>
            </form>

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

            {/* Decorative underline */}
            <div className="mt-8 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <GenreSection type="anime" className="opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* This Season */}
      <section className="py-8">
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

      {/* Filters */}
      <section className="py-8">
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

      {/* All Anime Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {searchQuery 
              ? `Search results for "${searchQuery}"` 
              : `${initialFilter === 'seasonal' ? "This Season's" : filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Top Rated"} Anime`}
            {genreId && <span className="text-muted-foreground font-normal ml-2">(filtered by genre)</span>}
          </h2>
          
          {isSearching && isLoading ? (
            <div className={cn(
              "grid place-items-center rounded-2xl liquid-glass-subtle",
              viewMode === "grid" ? "min-h-[320px]" : "min-h-[220px]"
            )}>
              <div className="flex flex-col items-center text-center gap-3 p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Searching for “{searchQuery.trim()}”</p>
              </div>
            </div>
          ) : isSearching && !isLoading && (displayAnime?.length ?? 0) === 0 ? (
            <div className={cn(
              "rounded-2xl liquid-glass-subtle",
              viewMode === "grid" ? "py-16" : "py-12"
            )}>
              <div className="flex flex-col items-center text-center gap-4 px-6">
                <div className="text-muted-foreground">
                  <p className="text-base font-medium">No results</p>
                  <p className="text-sm">Try a different title or clear your search.</p>
                </div>
                <Button variant="outline" onClick={clearSearch} className="rounded-full">
                  Clear search
                </Button>
              </div>
            </div>
          ) : isLoading ? (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-2xl" : "h-24 rounded-2xl"} />
              ))}
            </div>
          ) : (
            <div className={cn(
              "grid gap-4 sm:gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
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