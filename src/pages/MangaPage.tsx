import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Grid, List, Search, Bookmark, Sparkles, Loader2 } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopManga, useSearchManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const genreId = searchParams.get("genre");
  const searchQuery = searchParams.get("q") || "";
  const filterParam = searchParams.get("filter") as "manga" | "manhwa" | "manhua" | null;
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [typeFilter, setTypeFilter] = useState<"all" | "manga" | "manhwa" | "manhua">(filterParam || "all");

  const isSearching = searchQuery.trim().length > 0;

  const clearSearch = () => {
    setLocalSearch("");
    const params = new URLSearchParams();
    if (typeFilter !== "all") params.set("filter", typeFilter);
    setSearchParams(params);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (localSearch.trim()) {
      params.set("q", localSearch.trim());
    }
    if (typeFilter !== "all") {
      params.set("filter", typeFilter);
    }
    setSearchParams(params);
  };

  const handleTypeFilter = (filter: "all" | "manga" | "manhwa" | "manhua") => {
    setTypeFilter(filter);
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (filter !== "all") params.set("filter", filter);
    setSearchParams(params);
  };

  // Fetch data based on type filter
  const { data: topManga, isLoading: topLoading } = useTopManga(1, typeFilter === "all" ? undefined : typeFilter);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');
  const { data: searchResults, isLoading: searchLoading } = useSearchManga(
    searchQuery,
    isSearching,
    typeFilter === "all" ? undefined : typeFilter,
  );

  const displayManga = isSearching ? searchResults : topManga;
  const isLoading = isSearching ? searchLoading : topLoading;

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero with Search */}
      <section className="pt-28 sm:pt-32 pb-8 sm:pb-12">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Discover Manga
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-6">漫画を発見</p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <div className="liquid-glass-strong rounded-2xl transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/30">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search manga, manhwa, manhua..."
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

      {/* Genres */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <GenreSection type="manga" className="opacity-70 hover:opacity-100 transition-opacity" />
        </div>
      </section>

      {/* Top Manhwa */}
      <section className="py-8">
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
                <div key={manga.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Top Manhua */}
      <section className="py-8">
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
                <div key={manga.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <MangaCard manga={manga} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* View Toggle */}
      <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-end gap-2">
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
      </section>

      {/* All Manga Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            {isSearching 
              ? `Search results for "${searchQuery}"` 
              : typeFilter !== "all" 
                ? `Top ${typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}`
                : "Top Manga"}
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
          ) : isSearching && !isLoading && (displayManga?.length ?? 0) === 0 ? (
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
              {displayManga?.map((manga, index) => (
                viewMode === "grid" ? (
                  <MangaCard key={manga.mal_id} manga={manga} index={index} />
                ) : (
                  <MangaCard key={manga.mal_id} manga={manga} index={index} variant="compact" />
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