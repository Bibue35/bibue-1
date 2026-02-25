import { useQuery } from "@tanstack/react-query";

const FUNCTION_NAME = "mangadex-proxy";

async function callMangaDex(params: Record<string, string>) {
  const query = new URLSearchParams(params).toString();
  const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
  const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  
  const res = await fetch(
    `https://${projectId}.supabase.co/functions/v1/${FUNCTION_NAME}?${query}`,
    {
      headers: {
        'apikey': anonKey,
        'Authorization': `Bearer ${anonKey}`,
      },
    }
  );
  
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'MangaDex request failed');
  }
  
  return res.json();
}

export interface MangaDexSearchResult {
  id: string;
  title: string;
  altTitles?: Record<string, string>[];
  description: string;
  status: string;
  year: number | null;
  contentRating: string;
  tags: string[];
  originalLanguage: string;
  coverUrl: string | null;
  lastChapter: string | null;
  lastVolume: string | null;
}

export interface MangaDexChapter {
  id: string;
  chapter: string | null;
  title: string | null;
  volume: string | null;
  pages: number;
  publishAt: string;
  readableAt: string;
  translatedLanguage: string;
  externalUrl: string | null;
  scanlationGroup: string | null;
}

/**
 * Search MangaDex by title to find a matching manga.
 * Used to link AniList manga to MangaDex chapters.
 */
export function useMangaDexSearch(title: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-search', title],
    queryFn: () => callMangaDex({ action: 'search', title: title!, limit: '5' }),
    enabled: enabled && !!title,
    staleTime: 30 * 60 * 1000, // 30 min
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

/**
 * Fetch chapter list for a MangaDex manga.
 */
export function useMangaDexChapters(mangadexId: string | undefined, offset = 0, limit = 100, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-chapters', mangadexId, offset, limit],
    queryFn: () => callMangaDex({ 
      action: 'chapters', 
      mangadexId: mangadexId!, 
      limit: String(limit), 
      offset: String(offset) 
    }),
    enabled: enabled && !!mangadexId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    select: (data) => ({
      chapters: (data.chapters as MangaDexChapter[])
        .filter((ch) => ch.chapter !== null && !ch.externalUrl) // filter out external-only chapters
        .sort((a, b) => parseFloat(b.chapter!) - parseFloat(a.chapter!)),
      total: data.total as number,
    }),
  });
}

/**
 * Fetch page URLs for a specific chapter.
 */
export function useMangaDexPages(chapterId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-pages', chapterId],
    queryFn: () => callMangaDex({ action: 'pages', chapterId: chapterId! }),
    enabled: enabled && !!chapterId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
    select: (data) => ({
      pages: data.pages as string[],
      dataSaver: data.dataSaver as string[],
    }),
  });
}

/**
 * Helper: Find the best MangaDex match for an AniList manga title.
 * Compares title similarity and returns the top match.
 */
export function findBestMatch(
  searchResults: MangaDexSearchResult[] | undefined,
  anilistTitle: string
): MangaDexSearchResult | null {
  if (!searchResults || searchResults.length === 0) return null;
  
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedTarget = normalize(anilistTitle);
  
  // First try exact match
  const exact = searchResults.find(r => normalize(r.title) === normalizedTarget);
  if (exact) return exact;
  
  // Then try includes
  const includes = searchResults.find(r => 
    normalize(r.title).includes(normalizedTarget) || 
    normalizedTarget.includes(normalize(r.title))
  );
  if (includes) return includes;
  
  // Check alt titles
  for (const result of searchResults) {
    for (const altTitle of result.altTitles || []) {
      for (const val of Object.values(altTitle)) {
        if (normalize(val) === normalizedTarget || 
            normalize(val).includes(normalizedTarget) ||
            normalizedTarget.includes(normalize(val))) {
          return result;
        }
      }
    }
  }
  
  // Return first result as fallback
  return searchResults[0];
}
