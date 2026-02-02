import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "./useWatchlist";
import { getAnimeRecommendations, Anime } from "@/lib/api";

export interface Recommendation {
  entry: {
    /** @description Primary ID - This is the AniList ID used for all API calls */
    anilist_id: number;
    /** @deprecated Use anilist_id instead */
    mal_id: number;
    title: string;
    images: {
      jpg: { large_image_url: string; image_url: string };
      webp: { large_image_url: string; image_url: string };
    };
    score?: number;
  };
}

// Fetch recommendations (no rate limiting needed for AniList)
async function fetchRecommendationsFromWatchlist(
  animeIds: number[],
  maxItems: number = 5
): Promise<Map<number, Recommendation[]>> {
  const results = new Map<number, Recommendation[]>();
  const itemsToFetch = animeIds.slice(0, maxItems);
  
  // Fetch all in parallel (AniList has no rate limits for public queries)
  const promises = itemsToFetch.map(async (id) => {
    try {
      const recs = await getAnimeRecommendations(id);
      const mapped: Recommendation[] = recs?.slice(0, 6).map(r => ({
        entry: {
          anilist_id: r.entry.anilist_id || r.entry.mal_id, // Use anilist_id if available
          mal_id: r.entry.mal_id, // Keep for backward compatibility
          title: r.entry.title,
          images: r.entry.images,
          score: r.entry.score,
        }
      })) || [];
      return { id, recs: mapped };
    } catch (error) {
      console.error(`Failed to fetch recommendations for anime ${id}:`, error);
      return { id, recs: [] };
    }
  });
  
  const allResults = await Promise.all(promises);
  allResults.forEach(({ id, recs }) => results.set(id, recs));
  
  return results;
}

export function useRecommendations() {
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();
  
  // Get anime IDs from watchlist
  const animeIds = watchlist
    ?.filter(item => item.media_type === "anime")
    .map(item => item.mal_id) || [];
  
  const { data: recommendationsMap, isLoading: recsLoading, error } = useQuery({
    queryKey: ["recommendations", animeIds.slice(0, 5).join(",")],
    queryFn: () => fetchRecommendationsFromWatchlist(animeIds, 5),
    enabled: animeIds.length > 0,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
    gcTime: 1000 * 60 * 60, // Keep in garbage collection for 1 hour
  });
  
  // Flatten and dedupe recommendations
  const recommendations: Recommendation[] = [];
  const seenIds = new Set<number>();
  
  // Add all anime from watchlist to avoid recommending already-watched
  animeIds.forEach(id => seenIds.add(id));
  
  if (recommendationsMap) {
    recommendationsMap.forEach((recs) => {
      recs.forEach(rec => {
        if (!seenIds.has(rec.entry.anilist_id)) {
          seenIds.add(rec.entry.anilist_id);
          recommendations.push(rec);
        }
      });
    });
  }
  
  // Sort by score (higher rated first)
  recommendations.sort((a, b) => (b.entry.score || 0) - (a.entry.score || 0));
  
  return {
    recommendations: recommendations.slice(0, 12),
    isLoading: watchlistLoading || recsLoading,
    error,
    hasWatchlistItems: animeIds.length > 0,
  };
}
