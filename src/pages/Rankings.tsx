import { useState, useEffect } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/SectionError";
import { useTopAnime, useTopManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as "anime" | "manga") || "anime";
  
  const [activeType, setActiveType] = useState<"anime" | "manga">(initialType);
  const [animeFilter, setAnimeFilter] = useState<'airing' | 'upcoming' | 'bypopularity' | 'favorite' | undefined>();
  const [mangaFilter, setMangaFilter] = useState<'manga' | 'manhwa' | 'manhua' | undefined>();

  useEffect(() => {
    setSearchParams({ type: activeType });
  }, [activeType, setSearchParams]);

  const { data: animeData, isLoading: animeLoading, error: animeError, refetch: refetchAnime } = useTopAnime(1, animeFilter);
  const { data: mangaData, isLoading: mangaLoading, error: mangaError, refetch: refetchManga } = useTopManga(1, mangaFilter);

  const data = activeType === "anime" ? animeData : mangaData;
  const isLoading = activeType === "anime" ? animeLoading : mangaLoading;
  const error = activeType === "anime" ? animeError : mangaError;
  const refetch = activeType === "anime" ? refetchAnime : refetchManga;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Top Rankings"
        description="Discover the highest-rated anime and manga as voted by fans worldwide on Bibue."
        url="/rankings"
        jsonLd={itemListJsonLd("Top Rankings", "/rankings")}
      />
      <CollapsibleNavbar />

      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-8 sm:pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 font-sacred liquid-metal-text">
              Top Rankings
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-2">ランキング</p>
            <p className="text-sm sm:text-base text-muted-foreground">
              Discover the highest-rated anime and manga as voted by millions of fans worldwide.
            </p>
          </div>
        </div>
      </section>

      {/* Type Toggle */}
      <section className="pb-4 sm:pb-8">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2">
            {(["anime", "manga"] as const).map(type => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 btn-press capitalize",
                  activeType === type
                    ? "filter-pill-active"
                    : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Sort filters */}
      <section className="pb-6 sm:pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground mr-2">Sort:</span>
            {activeType === "anime" ? (
              <>
                {([undefined, 'airing', 'upcoming', 'bypopularity', 'favorite'] as const).map((filter) => (
                  <button
                    key={filter || 'score'}
                    onClick={() => setAnimeFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press",
                      animeFilter === filter
                        ? "filter-pill-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {filter === undefined ? "Score" : filter === 'bypopularity' ? "Popular" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </>
            ) : (
              <>
                {([undefined, 'manga', 'manhwa', 'manhua'] as const).map((filter) => (
                  <button
                    key={filter || 'all'}
                    onClick={() => setMangaFilter(filter)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 btn-press capitalize",
                      mangaFilter === filter
                        ? "filter-pill-active"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                    )}
                  >
                    {filter === undefined ? "All" : filter}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>
      </section>

      {/* Rankings Grid */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {error ? (
            <SectionError message="Failed to load rankings" onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
              {Array.from({ length: 25 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 entrance-stagger">
              {data?.map((item, index) => (
                <div 
                  key={item.anilist_id}
                  className="relative"
                  style={{ zIndex: 25 - index }}
                >
                  {/* Text-only rank number */}
                  <div className={cn(
                    "absolute -top-2 -left-1 z-10 text-xs sm:text-sm font-bold tabular-nums",
                    "bg-background/80 backdrop-blur-sm rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center",
                    index === 0 && "rank-gold",
                    index === 1 && "rank-silver",
                    index === 2 && "rank-bronze",
                    index > 2 && "rank-badge"
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
