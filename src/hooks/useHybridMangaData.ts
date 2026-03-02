import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  getMangaByGenre,
  getMangaByTag,
  isNicheTagGenre,
  NICHE_TAG_GENRES,
  deduplicateManga,
  Manga,
  SupportedLanguage,
} from "@/lib/api";

const MANGADEX_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/mangadex-proxy`;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// MangaDex tag-based search for supplemental results
async function searchMangaDexByTags(tags: string[], limit = 25, offset = 0): Promise<Manga[]> {
  const query = new URLSearchParams({
    action: 'search-by-tags',
    tags: tags.join(','),
    limit: String(limit),
    offset: String(offset),
  });

  try {
    const res = await fetch(`${MANGADEX_PROXY_URL}?${query}`, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    if (!res.ok) return [];
    const data = await res.json();

    // Convert MangaDex results to our Manga format
    return (data.results || []).map((r: any) => ({
      anilist_id: -Math.abs(r.id?.charCodeAt(0) || 0) * 100000 - Math.random() * 10000, // negative ID for MangaDex-only titles
      mal_id: 0,
      title: r.title || 'Unknown',
      images: {
        jpg: { large_image_url: r.coverUrl || '', image_url: r.coverUrl || '' },
        webp: { large_image_url: r.coverUrl || '', image_url: r.coverUrl || '' },
      },
      synopsis: r.description || undefined,
      chapters: r.lastChapter ? parseInt(r.lastChapter) || undefined : undefined,
      status: r.status || undefined,
      genres: (r.tags || []).map((t: string, i: number) => ({ mal_id: i, name: t })),
      countryOfOrigin: r.originalLanguage === 'ko' ? 'KR' : r.originalLanguage === 'zh' ? 'CN' : 'JP',
    } as Manga));
  } catch {
    return [];
  }
}

/**
 * Hybrid genre query: uses AniList tags for niche genres, 
 * supplements with MangaDex tag search, deduplicates results.
 */
export function useHybridMangaByGenre(
  genreName: string,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC"
) {
  const { language } = useLanguage();
  const isNiche = isNicheTagGenre(genreName);
  const tagNames = isNiche ? NICHE_TAG_GENRES[genreName] : undefined;

  return useInfiniteQuery({
    queryKey: ["hybridMangaByGenre", genreName, filter, sort, language],
    queryFn: async ({ pageParam = 1 }) => {
      // Run AniList and MangaDex in parallel for niche genres
      if (isNiche && tagNames) {
        const [anilistResults, mangadexResults] = await Promise.all([
          getMangaByTag(tagNames, pageParam, 25, filter, sort, language as SupportedLanguage),
          pageParam === 1 ? searchMangaDexByTags(tagNames, 10) : Promise.resolve([]),
        ]);
        return deduplicateManga(anilistResults, mangadexResults);
      }

      // Standard genre — just AniList
      return getMangaByGenre(genreName, pageParam, 25, filter, sort, language as SupportedLanguage);
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= 20 ? allPages.length + 1 : undefined,
    enabled: !!genreName,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}
