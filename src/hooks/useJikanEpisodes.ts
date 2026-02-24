import { useQuery } from "@tanstack/react-query";

export interface JikanEpisode {
  mal_id: number;
  title: string;
  title_japanese?: string;
  title_romanji?: string;
  aired?: string;
  score?: number;
  filler: boolean;
  recap: boolean;
  synopsis?: string;
}

interface JikanEpisodesResponse {
  data: JikanEpisode[];
  pagination: { last_visible_page: number; has_next_page: boolean };
}

/**
 * Fetches episode data from Jikan (MyAnimeList) API.
 * Used as a fallback when AniList streamingEpisodes data is unavailable.
 */
export function useJikanEpisodes(malId: number | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ["jikan-episodes", malId],
    queryFn: async (): Promise<JikanEpisode[]> => {
      if (!malId) return [];

      // Fetch up to 4 pages (100 episodes each) to cover long-running series
      const allEpisodes: JikanEpisode[] = [];
      let page = 1;
      const maxPages = 4;

      while (page <= maxPages) {
        const res = await fetch(
          `https://api.jikan.moe/v4/anime/${malId}/episodes?page=${page}`
        );
        if (!res.ok) break;

        const json: JikanEpisodesResponse = await res.json();
        allEpisodes.push(...json.data);

        if (!json.pagination.has_next_page) break;
        page++;

        // Jikan rate limit: 3 req/s — wait 400ms between pages
        if (page <= maxPages && json.pagination.has_next_page) {
          await new Promise((r) => setTimeout(r, 400));
        }
      }

      return allEpisodes;
    },
    enabled: enabled && !!malId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2,
  });
}
