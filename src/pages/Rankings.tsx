import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Film, BookOpen, TrendingUp, Filter } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopAnime, useTopManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as "anime" | "manga") || "anime";
  
  const [activeType, setActiveType] = useState<"anime" | "manga">(initialType);
  const [animeFilter, setAnimeFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>();
  const [mangaFilter, setMangaFilter] = useState<'manga' | 'manhwa' | 'manhua' | undefined>();

  // Sync URL with state
  useEffect(() => {
    setSearchParams({ type: activeType });
  }, [activeType, setSearchParams]);

  const { data: animeData, isLoading: animeLoading } = useTopAnime(1, animeFilter);
  const { data: mangaData, isLoading: mangaLoading } = useTopManga(1, mangaFilter);

  const data = activeType === "anime" ? animeData : mangaData;
  const isLoading = activeType === "anime" ? animeLoading : mangaLoading;

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl liquid-glass flex items-center justify-center sunbeam-hover">
                <TrendingUp className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Top Rankings
            </h1>
            <p className="font-jp text-xl text-muted-foreground mb-2">ランキング</p>
            <p className="text-muted-foreground text-lg">
              Discover the highest-rated anime and manga as voted by millions of fans worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Type Toggle */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2 p-1 rounded-xl liquid-glass w-fit mx-auto">
            <button
              onClick={() => setActiveType("anime")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                activeType === "anime"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Film className="w-4 h-4" />
              Anime
            </button>
            <button
              onClick={() => setActiveType("manga")}
              className={cn(
                "flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                activeType === "manga"
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <BookOpen className="w-4 h-4" />
              Manga
            </button>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Sort by:</span>
            </div>
            
            {activeType === "anime" ? (
              <>
                {([undefined, 'airing', 'upcoming', 'bypopularity', 'favorite'] as const).map((filter) => (
                  <Button
                    key={filter || 'all'}
                    variant={animeFilter === filter ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setAnimeFilter(filter)}
                    className={cn(
                      "rounded-full capitalize",
                      animeFilter !== filter && "glass-button"
                    )}
                  >
                    {filter === undefined ? "Score" : filter === 'bypopularity' ? "Popular" : filter}
                  </Button>
                ))}
              </>
            ) : (
              <>
                {([undefined, 'manga', 'manhwa', 'manhua'] as const).map((filter) => (
                  <Button
                    key={filter || 'all'}
                    variant={mangaFilter === filter ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setMangaFilter(filter)}
                    className={cn(
                      "rounded-full capitalize",
                      mangaFilter !== filter && "glass-button"
                    )}
                  >
                    {filter === undefined ? "All" : filter}
                  </Button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Rankings Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 25 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {data?.map((item, index) => (
                <div key={item.mal_id} className="relative">
                  {/* Rank badge */}
                  <div className={cn(
                    "absolute -top-3 -left-3 z-20 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg",
                    index === 0 && "bg-foreground text-background",
                    index === 1 && "bg-muted text-foreground",
                    index === 2 && "bg-accent text-accent-foreground",
                    index > 2 && "bg-card text-muted-foreground border border-border"
                  )}>
                    {index + 1}
                  </div>
                  
                  {activeType === "anime" ? (
                    <AnimeCard anime={item as any} index={index} />
                  ) : (
                    <MangaCard manga={item as any} index={index} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
