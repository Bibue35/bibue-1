import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, Bookmark, Sparkles, Loader2, ArrowUpDown } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { SearchDropdown } from "@/components/SearchDropdown";
import { PullToRefresh } from "@/components/PullToRefresh";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTopManga, useSearchManga } from "@/hooks/useAnimeData";
import { useDebounce } from "@/hooks/useDebounce";
import { useQueryClient } from "@tanstack/react-query";
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
  const resultsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Debounce search input (150ms default for faster response)
  const debouncedSearch = useDebounce(localSearch.trim());

  // Sync URL when debounced value or filter changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (typeFilter !== "all") params.set("filter", typeFilter);
    if (sortBy !== "popularity") params.set("sort", sortBy);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params, { replace: true });
  }, [debouncedSearch, typeFilter, sortBy, genreId, setSearchParams]);

  const isSearching = debouncedSearch.length > 0;

  const clearSearch = () => {
    setLocalSearch("");
  };

  const handleTypeFilter = (filter: "all" | "manga" | "manhwa" | "manhua") => {
    setTypeFilter(filter);
  };

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ["topManga"] });
  }, [queryClient]);

  // Fetch data based on type filter - separate queries for each filter type
  // (sorting is applied client-side below)
  const { data: allManga, isLoading: allLoading } = useTopManga(1, undefined);
  const { data: mangaOnly, isLoading: mangaLoading } = useTopManga(1, 'manga');
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
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

      {/* Top Manhwa - Only show when not searching and not filtering to a different type */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhwa") && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <HorizontalScroll title="Top Manhwa" titleJp="韓国漫画">
              {manhwaLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                    <Skeleton className="aspect-[2/3] rounded-2xl" />
                  </div>
                ))
              ) : (
                manhwa?.slice(0, 12).map((manga, index) => (
                  <div key={manga.anilist_id} className="flex-shrink-0 w-36 sm:w-44">
                    <MangaCard manga={manga} index={index} />
                  </div>
                ))
              )}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* Top Manhua - Only show when not searching and not filtering to a different type */}
      {!isSearching && (typeFilter === "all" || typeFilter === "manhua") && (
        <section className="py-4">
          <div className="container mx-auto px-4">
            <HorizontalScroll title="Top Manhua" titleJp="中国漫画">
              {manhuaLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                    <Skeleton className="aspect-[2/3] rounded-2xl" />
                  </div>
                ))
              ) : (
                manhua?.slice(0, 12).map((manga, index) => (
                  <div key={manga.anilist_id} className="flex-shrink-0 w-36 sm:w-44">
                    <MangaCard manga={manga} index={index} />
                  </div>
                ))
              )}
            </HorizontalScroll>
          </div>
        </section>
      )}

      {/* View Toggle & Sort */}
      <section className="py-4" ref={resultsRef}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4">
            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                <SelectTrigger className="w-[140px] rounded-full h-9">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="score">Score</SelectItem>
                  <SelectItem value="newest">Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* View Toggle */}
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
      {(typeFilter !== "all" || sortBy !== "popularity" || genreId) && (
        <section className="pb-2">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">Active filters:</span>
              {typeFilter !== "all" && (
                <button
                  onClick={() => setTypeFilter("all")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Type: {typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
                  <span className="text-primary/60">×</span>
                </button>
              )}
              {sortBy !== "popularity" && (
                <button
                  onClick={() => setSortBy("popularity")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Sort: {sortBy === "score" ? "Score" : "Date"}
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

      {/* All Manga Grid */}
      <section className="py-4 pb-24">
        <div className="container mx-auto px-4">
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
