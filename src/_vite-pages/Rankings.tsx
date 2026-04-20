import { useState, useEffect } from "react";
import { SEO, itemListJsonLd } from "@/components/SEO";
import { useSearchParams } from "react-router-dom";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { AnimeCard } from "@/components/AnimeCard";
import { MangaCard } from "@/components/MangaCard";
import { FilterBar } from "@/components/FilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionError } from "@/components/SectionError";
import { useInfiniteFilteredAnime, useInfiniteFilteredManga } from "@/hooks/useAnimeData";
import { useFilterPreferences } from "@/hooks/useFilterPreferences";
import { cn } from "@/lib/utils";

const ANIME_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "TV", label: "TV" },
  { value: "MOVIE", label: "Film" },
  { value: "OVA", label: "OVA" },
];

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = (searchParams.get("type") as "anime" | "manga") || "anime";
  
  const [activeType, setActiveType] = useState<"anime" | "manga">(initialType);
  const { filters: animeFilters, updateFilter: updateAnimeFilter, resetFilters: resetAnimeFilters, activeCount: animeActiveCount } = useFilterPreferences("rankings_anime");
  const { filters: mangaFilters, updateFilter: updateMangaFilter, resetFilters: resetMangaFilters, activeCount: mangaActiveCount } = useFilterPreferences("rankings_manga");

  useEffect(() => {
    setSearchParams({ type: activeType });
  }, [activeType, setSearchParams]);

  const filters = activeType === "anime" ? animeFilters : mangaFilters;

  // Use the unified filtered queries that pass ALL filters to the AniList API
  const animeQuery = useInfiniteFilteredAnime(animeFilters);
  const mangaQuery = useInfiniteFilteredManga(mangaFilters);

  const query = activeType === "anime" ? animeQuery : mangaQuery;
  const data = query.data?.pages.flat() || [];
  const isLoading = query.isLoading;
  const error = query.error;
  const refetch = query.refetch;

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
      <section className="pb-4 sm:pb-6">
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

      {/* FilterBar */}
      <section className="pb-6 sm:pb-10">
        <div className="container mx-auto px-4 sm:px-6">
          <FilterBar
            filters={activeType === "anime" ? animeFilters : mangaFilters}
            onFilterChange={activeType === "anime" ? updateAnimeFilter : updateMangaFilter}
            onReset={activeType === "anime" ? resetAnimeFilters : resetMangaFilters}
            activeCount={activeType === "anime" ? animeActiveCount : mangaActiveCount}
            mediaType={activeType}
            typeOptions={activeType === "anime" ? ANIME_TYPE_OPTIONS : undefined}
          />
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

              {data.length === 0 && (
                <div className="col-span-full text-center py-16">
                  <p className="text-muted-foreground">No results found for these filters. Try adjusting your criteria.</p>
                </div>
              )}
            </div>
          )}

          {/* Load More */}
          {query.hasNextPage && (
            <div className="flex justify-center mt-12">
              <button
                onClick={() => query.fetchNextPage()}
                disabled={query.isFetchingNextPage}
                className="px-8 py-3 rounded-full text-sm font-medium tracking-wide uppercase bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors btn-press"
              >
                {query.isFetchingNextPage ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}