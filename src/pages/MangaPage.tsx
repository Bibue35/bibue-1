import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Grid, List } from "lucide-react";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { GenreSection } from "@/components/GenreSection";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function MangaPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("filter") as 'manga' | 'manhwa' | 'manhua' | 'bypopularity' | undefined;
  const genreId = searchParams.get("genre");
  
  const [filter, setFilter] = useState<'manga' | 'manhwa' | 'manhua' | undefined>(
    initialFilter === 'bypopularity' ? undefined : initialFilter as 'manga' | 'manhwa' | 'manhua' | undefined
  );
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Update URL when filter changes
  const handleFilterChange = (newFilter: typeof filter) => {
    setFilter(newFilter);
    const params = new URLSearchParams();
    if (newFilter) params.set("filter", newFilter);
    if (genreId) params.set("genre", genreId);
    setSearchParams(params);
  };

  const { data: topManga, isLoading: topLoading } = useTopManga(1, filter);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />

      {/* Hero - Clean text-only design */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 font-sacred">
              Discover Manga
            </h1>
            <p className="font-jp text-lg sm:text-xl text-muted-foreground mb-2">漫画を発見</p>
            <p className="text-muted-foreground text-sm sm:text-lg px-4">
              Explore manga, manhwa, and manhua from around the world.
            </p>
            {/* Decorative underline */}
            <div className="mt-6 mx-auto w-24 h-1 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* Genres */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <GenreSection type="manga" />
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

      {/* Filters */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Type:</span>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {([undefined, 'manga', 'manhwa', 'manhua'] as const).map((f) => (
                  <Button
                    key={f || 'all'}
                    variant={filter === f ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleFilterChange(f)}
                    className={cn(
                      "rounded-full capitalize text-xs sm:text-sm",
                      filter !== f && "glass-button"
                    )}
                  >
                    {f === undefined ? "All" : f}
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

      {/* All Manga Grid */}
      <section className="py-8 pb-24">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl font-bold mb-6">
            Top {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Manga"}
            {genreId && <span className="text-muted-foreground font-normal ml-2">(filtered by genre)</span>}
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
              {topManga?.map((manga, index) => (
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
