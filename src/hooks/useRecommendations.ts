import { useQuery } from "@tanstack/react-query";
import { useWatchlist } from "./useWatchlist";
import { getAnimeRecommendations, Anime } from "@/lib/api";

export interface Recommendation {
  entry: {
    mal_id: number;
    title: string;
    images: {
      jpg: { large_image_url: string; image_url: string };
      webp: { large_image_url: string; image_url: string };
    };
  };
  votes: number;
}

// Rate-limited fetcher with delay between requests
async function fetchRecommendationsWithDelay(
  animeIds: number[],
  maxItems: number = 3
): Promise<Map<number, Recommendation[]>> {
  const results = new Map<number, Recommendation[]>();
  const itemsToFetch = animeIds.slice(0, maxItems);
  
  for (let i = 0; i < itemsToFetch.length; i++) {
    const id = itemsToFetch[i];
    try {
      // Add delay between requests to avoid rate limiting (Jikan needs 400ms+)
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      const recs = await getAnimeRecommendations(id);
      results.set(id, recs?.slice(0, 6) || []);
    } catch (error) {
      console.error(`Failed to fetch recommendations for anime ${id}:`, error);
      results.set(id, []);
    }
  }
  
  return results;
}

export function useRecommendations() {
  const { watchlist, isLoading: watchlistLoading } = useWatchlist();
  
  // Get anime IDs from watchlist
  const animeIds = watchlist
    ?.filter(item => item.media_type === "anime")
    .map(item => item.mal_id) || [];
  
  const { data: recommendationsMap, isLoading: recsLoading, error } = useQuery({
    queryKey: ["recommendations", animeIds.slice(0, 3).join(",")],
    queryFn: () => fetchRecommendationsWithDelay(animeIds, 3),
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
        if (!seenIds.has(rec.entry.mal_id)) {
          seenIds.add(rec.entry.mal_id);
          recommendations.push(rec);
        }
      });
    });
  }
  
  // Sort by votes (popularity of the recommendation)
  recommendations.sort((a, b) => b.votes - a.votes);
  
  return {
    recommendations: recommendations.slice(0, 12),
    isLoading: watchlistLoading || recsLoading,
    error,
    hasWatchlistItems: animeIds.length > 0,
  };
}
