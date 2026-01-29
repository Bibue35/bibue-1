import { useState } from "react";
import { Film, Filter, Grid, List } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ParticleBackground } from "@/components/ParticleBackground";
import { AnimeCard } from "@/components/AnimeCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
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
      <ParticleBackground />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-anime flex items-center justify-center shadow-neon animate-floating">
                <Film className="w-8 h-8 text-primary-foreground" />
              </div>
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Discover Anime</span>
            </h1>
            <p className="font-jp text-xl text-muted-foreground mb-2">アニメを発見</p>
            <p className="text-muted-foreground text-lg">
              Explore the best anime from every season, genre, and era.
            </p>
          </div>
        </div>
      </section>

      {/* Currently Airing */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Currently Airing" titleJp="放送中">
            {airingLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              airingAnime?.slice(0, 15).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-48">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Seasonal */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="This Season" titleJp="今季">
            {seasonalLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <Skeleton className="aspect-[2/3] rounded-xl" />
                </div>
              ))
            ) : (
              seasonalAnime?.slice(0, 15).map((anime, index) => (
                <div key={anime.mal_id} className="flex-shrink-0 w-48">
                  <AnimeCard anime={anime} index={index} />
                </div>
              ))
            )}
          </HorizontalScroll>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground font-display uppercase tracking-wider">Filter:</span>
              </div>
              
              {([undefined, 'airing', 'upcoming', 'bypopularity', 'favorite'] as const).map((f) => (
                <Button
                  key={f || 'all'}
                  variant={filter === f ? "glow" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="font-display uppercase tracking-wider"
                >
                  {f === undefined ? "Top Rated" : f === 'bypopularity' ? "Popular" : f}
                </Button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "outline" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* All Anime Grid */}
      <section className="py-8 pb-24 relative z-10">
        <div className="container mx-auto px-4">
          <h2 className="font-display text-2xl font-bold mb-6">
            {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Top Rated"} Anime
          </h2>
          
          {topLoading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-xl" : "h-24 rounded-xl"} />
              ))}
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
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
