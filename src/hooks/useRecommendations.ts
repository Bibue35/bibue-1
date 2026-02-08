import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "./useWatchlist";
import { getAnimeRecommendations, getMangaRecommendations, Anime, Manga } from "@/lib/api";

export type MediaType = "anime" | "manga" | "manhwa" | "manhua";

export interface Recommendation {
  entry: {
    /** Primary ID - AniList ID */
    anilist_id: number;
    /** @deprecated Use anilist_id */
    mal_id: number;
    title: string;
    images: {
      jpg: { large_image_url: string; image_url: string };
      webp: { large_image_url: string; image_url: string };
    };
    score?: number;
    genres?: Array<{ mal_id: number; name: string }>;
    status?: string;
    country?: string;
  };
  mediaType: MediaType;
}

async function fetchAnimeRecommendations(animeIds: number[], maxItems = 5): Promise<Recommendation[]> {
  const itemsToFetch = animeIds.slice(0, maxItems);
  const results: Recommendation[] = [];
  const seenIds = new Set<number>(animeIds);

  const promises = itemsToFetch.map(async (id) => {
    try {
      const recs = await getAnimeRecommendations(id);
      return recs?.slice(0, 6).map(r => ({
        entry: {
          anilist_id: r.entry.anilist_id || r.entry.mal_id,
          mal_id: r.entry.mal_id,
          title: r.entry.title,
          images: r.entry.images,
          score: r.entry.score,
          genres: r.entry.genres,
          status: r.entry.status,
        },
        mediaType: "anime" as MediaType,
      })) || [];
    } catch {
      return [];
    }
  });

  const allResults = await Promise.all(promises);
  allResults.flat().forEach(rec => {
    if (!seenIds.has(rec.entry.anilist_id)) {
      seenIds.add(rec.entry.anilist_id);
      results.push(rec);
    }
  });

  return results;
}

async function fetchMangaRecommendations(mangaIds: number[], maxItems = 5): Promise<Recommendation[]> {
  const itemsToFetch = mangaIds.slice(0, maxItems);
  const results: Recommendation[] = [];
  const seenIds = new Set<number>(mangaIds);

  const promises = itemsToFetch.map(async (id) => {
    try {
      const recs = await getMangaRecommendations(id);
      return recs?.slice(0, 6).map(r => ({
        entry: {
          anilist_id: r.entry.anilist_id || r.entry.mal_id,
          mal_id: r.entry.mal_id,
          title: r.entry.title,
          images: r.entry.images,
          score: r.entry.score,
          genres: r.entry.genres,
          status: r.entry.status,
          country: (r.entry as any).countryOfOrigin,
        },
        mediaType: "manga" as MediaType,
      })) || [];
    } catch {
      return [];
    }
  });

  const allResults = await Promise.all(promises);
  allResults.flat().forEach(rec => {
    if (!seenIds.has(rec.entry.anilist_id)) {
      seenIds.add(rec.entry.anilist_id);
      results.push(rec);
    }
  });

  return results;
}

export function useRecommendations(activeType: MediaType = "anime") {
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();

  // Get IDs from watchlist by media type
  const animeIds = watchlist?.filter(item => item.media_type === "anime").map(item => item.mal_id) || [];
  const mangaIds = watchlist?.filter(item => item.media_type === "manga").map(item => item.mal_id) || [];

  const isAnimeType = activeType === "anime";
  const ids = isAnimeType ? animeIds : mangaIds;

  const { data: recommendations, isLoading: recsLoading } = useQuery({
    queryKey: ["recommendations", activeType, ids.slice(0, 5).join(",")],
    queryFn: () => isAnimeType
      ? fetchAnimeRecommendations(animeIds, 5)
      : fetchMangaRecommendations(mangaIds, 5),
    enabled: ids.length > 0,
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
  });

  // Filter by sub-type for manhwa/manhua (based on country or genre heuristic)
  const filtered = (recommendations || [])
    .filter(rec => {
      if (activeType === "anime" || activeType === "manga") return true;
      // For manhwa/manhua, we can't perfectly filter from AniList recs,
      // but we include all manga recs and label them
      return true;
    })
    .sort((a, b) => (b.entry.score || 0) - (a.entry.score || 0))
    .slice(0, 24);

  // Get unique genres from watchlist items for genre-based section
  const watchlistGenres = new Set<string>();
  watchlist?.filter(item => item.media_type === (isAnimeType ? "anime" : "manga"))
    .forEach(() => {
      // We don't have genre info in watchlist, so this is handled by the recs API
    });

  return {
    recommendations: filtered,
    isLoading: watchlistLoading || recsLoading,
    hasWatchlistItems: ids.length > 0,
    watchlistCount: ids.length,
  };
}
