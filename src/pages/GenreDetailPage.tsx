import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getAnimeByGenre, Anime } from "@/lib/api";
import { useLanguage } from "@/contexts/LanguageContext";
import { CollapsibleNavbar } from "@/components/CollapsibleNavbar";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { AnimeCard } from "@/components/AnimeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { genreDefinitions } from "@/data/genreDefinitions";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const SORT_OPTIONS = [
  { value: "SCORE_DESC", label: "Top Rated" },
  { value: "POPULARITY_DESC", label: "Most Popular" },
  { value: "TRENDING_DESC", label: "Trending" },
] as const;

type SortOption = (typeof SORT_OPTIONS)[number]["value"];

const GenreDetailPage = () => {
  const { genre: genreSlug } = useParams<{ genre: string }>();
  const { language } = useLanguage();
  const genreDef = genreDefinitions.find((g) => g.slug === genreSlug);

  const [sort, setSort] = useState<SortOption>("SCORE_DESC");
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset on genre/sort change
  useEffect(() => {
    setAllAnime([]);
    setPage(1);
    setHasMore(true);
  }, [genreSlug, sort]);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["genre-anime", genreDef?.anilistGenre, page, sort, language],
    queryFn: () => getAnimeByGenre(genreDef!.anilistGenre, page, 25, sort as any, language),
    staleTime: 1000 * 60 * 60,
    enabled: !!genreDef,
  });

  // Append new data
  useEffect(() => {
    if (data) {
      if (data.length < 25) setHasMore(false);
      setAllAnime((prev) => {
        if (page === 1) return data;
        const existingIds = new Set(prev.map((a) => a.anilist_id));
        const newItems = data.filter((a) => !existingIds.has(a.anilist_id));
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  // Infinite scroll
  const loadMore = useCallback(() => {
    if (!isFetching && hasMore) setPage((p) => p + 1);
  }, [isFetching, hasMore]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "400px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [loadMore]);

  if (!genreDef) return <Navigate to="/genres" replace />;

  return (
    <div className="min-h-screen bg-background">
      <CollapsibleNavbar />
      <SEO
        title={`Best ${genreDef.name} Anime — Top Rated & Most Popular`}
        description={genreDef.description}
        url={`/genre/${genreDef.slug}`}
      />

      <main id="main-content" className="container mx-auto px-4 pt-20 pb-16">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{genreDef.emoji}</span>
            <h1 className="text-2xl sm:text-3xl font-bold">{genreDef.name} Anime</h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-2xl">{genreDef.description}</p>
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-1 bg-card rounded-full p-1 border border-border/50 w-fit mb-6">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSort(opt.value)}
              className={cn(
                "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors",
                sort === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {isLoading && page === 1 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[2/3] rounded-xl mb-2" />
                <Skeleton className="h-3 w-3/4 mb-1" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {allAnime.map((anime) => (
                <AnimeCard key={anime.anilist_id} anime={anime} />
              ))}
            </div>

            {/* Infinite scroll loader */}
            <div ref={loaderRef} className="flex justify-center py-8">
              {isFetching && (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              )}
              {!hasMore && allAnime.length > 0 && (
                <p className="text-sm text-muted-foreground">You've seen all the {genreDef.name} anime!</p>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default GenreDetailPage;
