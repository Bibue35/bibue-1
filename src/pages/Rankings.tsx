import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Crown, Medal, Award } from "lucide-react";
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

  // Get rank badge styling
  const getRankBadge = (index: number) => {
    if (index === 0) {
      return {
        className: "rank-gold",
        icon: <Crown className="w-4 h-4" />,
        size: "w-12 h-12 text-base"
      };
    }
    if (index === 1) {
      return {
        className: "rank-silver",
        icon: <Medal className="w-4 h-4" />,
        size: "w-11 h-11 text-sm"
      };
    }
    if (index === 2) {
      return {
        className: "rank-bronze",
        icon: <Award className="w-4 h-4" />,
        size: "w-11 h-11 text-sm"
      };
    }
    return {
      className: "rank-badge",
      icon: null,
      size: "w-10 h-10 text-sm"
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero - Clean text-only design */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 font-sacred">
              Top Rankings
            </h1>
            <p className="font-jp text-xl text-muted-foreground mb-2">ランキング</p>
            <p className="text-muted-foreground text-lg">
              Discover the highest-rated anime and manga as voted by millions of fans worldwide.
            </p>
            {/* Decorative underline */}
            <div className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Type Toggle - Subtle, consistent styling */}
      <section className="pb-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setActiveType("anime")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeType === "anime"
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
              Anime
            </button>
            <button
              onClick={() => setActiveType("manga")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200",
                activeType === "manga"
                  ? "bg-foreground/10 text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
              )}
            >
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

      {/* Rankings Grid with enhanced visibility */}
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
              {data?.map((item, index) => {
                const rankStyle = getRankBadge(index);
                
                return (
                  <div 
                    key={item.mal_id} 
                    className="relative"
                    style={{ zIndex: 25 - index }}
                  >
                    {/* Enhanced rank badge */}
                    <div className={cn(
                      "absolute -top-3 -left-3 z-10 rounded-full flex items-center justify-center font-bold shadow-lg",
                      rankStyle.size,
                      rankStyle.className
                    )}>
                      {rankStyle.icon ? (
                        <div className="flex flex-col items-center">
                          {rankStyle.icon}
                          <span className="text-[10px] mt-0.5">{index + 1}</span>
                        </div>
                      ) : (
                        index + 1
                      )}
                    </div>
                    
                    {/* Card */}
                    {activeType === "anime" ? (
                      <AnimeCard anime={item as any} index={index} />
                    ) : (
                      <MangaCard manga={item as any} index={index} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
