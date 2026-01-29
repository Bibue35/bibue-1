import { useState } from "react";
import { BookOpen, Filter, Grid, List } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MangaCard } from "@/components/MangaCard";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTopManga } from "@/hooks/useAnimeData";
import { cn } from "@/lib/utils";

export default function MangaPage() {
  const [filter, setFilter] = useState<'manga' | 'manhwa' | 'manhua' | undefined>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: topManga, isLoading: topLoading } = useTopManga(1, filter);
  const { data: manhwa, isLoading: manhwaLoading } = useTopManga(1, 'manhwa');
  const { data: manhua, isLoading: manhuaLoading } = useTopManga(1, 'manhua');

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-accent-foreground" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="gradient-text">Discover Manga</span>
            </h1>
            <p className="font-jp text-xl text-muted-foreground mb-2">漫画を発見</p>
            <p className="text-muted-foreground text-lg">
              Explore manga, manhwa, and manhua from around the world.
            </p>
          </div>
        </div>
      </section>

      {/* Top Manhwa */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <HorizontalScroll title="Top Manhwa" titleJp="韓国漫画">
            {manhwaLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              manhwa?.slice(0, 12).map((manga, index) => (
                <div key={manga.mal_id} className="flex-shrink-0 w-44">
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
                <div key={i} className="flex-shrink-0 w-44">
                  <Skeleton className="aspect-[2/3] rounded-2xl" />
                </div>
              ))
            ) : (
              manhua?.slice(0, 12).map((manga, index) => (
                <div key={manga.mal_id} className="flex-shrink-0 w-44">
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Type:</span>
              </div>
              
              {([undefined, 'manga', 'manhwa', 'manhua'] as const).map((f) => (
                <Button
                  key={f || 'all'}
                  variant={filter === f ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="rounded-full capitalize"
                >
                  {f === undefined ? "All" : f}
                </Button>
              ))}
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
          <h2 className="text-2xl font-bold mb-6">
            Top {filter ? filter.charAt(0).toUpperCase() + filter.slice(1) : "Manga"}
          </h2>
          
          {topLoading ? (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
                : "grid-cols-1"
            )}>
              {Array.from({ length: 20 }).map((_, i) => (
                <Skeleton key={i} className={viewMode === "grid" ? "aspect-[2/3] rounded-2xl" : "h-24 rounded-2xl"} />
              ))}
            </div>
          ) : (
            <div className={cn(
              "grid gap-6",
              viewMode === "grid" 
                ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" 
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
