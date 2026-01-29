import { useState } from "react";
import { Film, Filter, Grid, List } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopAnime, useSeasonalAnime } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function AnimePage() {
  const [filter, setFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: topAnime, isLoading: topLoading } = useTopAnime(1, filter);
  const { data: seasonalAnime, isLoading: seasonalLoading } = useSeasonalAnime();
  const { data: airingAnime, isLoading: airingLoading } = useTopAnime(1, 'airing');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl glass-button flex items-center justify-center">
                <Film className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4">
              Discover Anime
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-2">アニメを発見</p>
            <p className="text-muted-foreground text-sm sm:text-lg px-4">
              Explore the best anime from every season, genre, and era.
            </p>
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <GenreSection type="anime" />
        </div>
      </section>

      {/* Currently Airing */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Currently Airing" titleJp="放送中">
            {airingLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-36 sm:w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              airingAnime?.slice(0, 12).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-36 sm:w-44">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Seasonal */}
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
              seasonalAnime?.slice(0, 12).map((anime, index) => (
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
                <span className="text-sm text-muted-foreground">Filter:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {([undefined, 'airing', 'upcoming', 'bypopularity', 'favorite'] as const).map((f) => (
                  <Button
                    key={f || 'all'}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFilter(f)}
                    className="rounded-full text-xs sm:text-sm"
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
            {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Top Rated"} Anime
          </h2>
          
          {topLoading ? (
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
              {topAnime?.map((anime, index) => (
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
