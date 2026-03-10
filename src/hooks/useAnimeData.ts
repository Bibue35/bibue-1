import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
import { FilterState } from "@/hooks/useFilterPreferences";
import {
  getTopAnime,
  getSeasonalAnime,
  getTopManga,
  searchAnime,
  searchManga,
  getAnimeById,
  getMangaById,
  getSchedule,
  getScheduleByDay,
  getAnimeRecommendations,
  getMangaRecommendations,
  getAnimeByYearRange,
  getAllTimeTopAnime,
  getClassicAnime,
  getAnimeByDecade,
  getAnimeByGenre,
  getRecentlyUpdatedAnime,
  getRecentlyUpdatedManga,
  getMangaByYearRange,
  getAllTimeTopManga,
  getClassicManga,
  getTrendingManhwa,
  getTrendingManhua,
  getMangaByGenre,
  getNewThisWeekManga,
  getCompletedManga,
  Anime,
  Manga,
  ScheduleItem,
  SupportedLanguage,
} from "@/lib/api";

export function useTopAnime(page = 1, filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'new' | 'completed', enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["topAnime", page, filter, language],
    queryFn: () => getTopAnime(page, 25, filter, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled,
  });
}

export function useSeasonalAnime(year?: number, season?: string) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["seasonalAnime", year, season, language],
    queryFn: () => getSeasonalAnime(year, season, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useTopManga(
  page = 1, 
  type?: 'manga' | 'novels' | 'lightnovels' | 'oneshots' | 'doujin' | 'manhwa' | 'manhua',
  sort: 'popularity' | 'score' | 'trending' | 'newest' = 'popularity',
  enabled = true
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["topManga", page, type, sort, language],
    queryFn: () => getTopManga(page, 25, type, sort, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled,
  });
}

export function useSearchAnime(query: string, enabled = true, sort: "SEARCH_MATCH" | "START_DATE_DESC" | "POPULARITY_DESC" = "START_DATE_DESC") {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["searchAnime", query, sort, language],
    queryFn: () => searchAnime(query.trim(), 1, 25, language as SupportedLanguage, sort),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useSearchManga(
  query: string,
  enabled = true,
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua",
  sort: "SEARCH_MATCH" | "START_DATE_DESC" | "POPULARITY_DESC" = "START_DATE_DESC"
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["searchManga", query, filter, sort, language],
    queryFn: () => searchManga(query.trim(), 1, 25, filter, language as SupportedLanguage, sort),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAnimeDetails(id: number, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["anime", id, language],
    queryFn: () => getAnimeById(id, language as SupportedLanguage),
    enabled,
    staleTime: 1000 * 60 * 15, // Details can be cached longer
    gcTime: 1000 * 60 * 60, // 1 hour
  });
}

export function useMangaDetails(id: number, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["manga", id, language],
    queryFn: () => getMangaById(id, language as SupportedLanguage),
    enabled,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useSchedule(day?: string) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["schedule", day, language],
    queryFn: () => getSchedule(day, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useScheduleByDay(day: string) {
  const { language } = useLanguage();
  return useQuery<ScheduleItem[]>({
    queryKey: ["scheduleByDay", day, language],
    queryFn: () => getScheduleByDay(day, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useAnimeRecommendations(id: number | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["animeRecommendations", id, language],
    queryFn: () => getAnimeRecommendations(id!, language as SupportedLanguage),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useMangaRecommendations(id: number | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["mangaRecommendations", id, language],
    queryFn: () => getMangaRecommendations(id!, language as SupportedLanguage),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// Extended anime hooks for older/classic content
export function useAnimeByYearRange(
  startYear: number,
  endYear: number,
  page = 1,
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "FAVOURITES_DESC" = "SCORE_DESC"
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["animeByYearRange", startYear, endYear, page, sort, language],
    queryFn: () => getAnimeByYearRange(startYear, endYear, page, 25, sort, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useAllTimeTopAnime(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["allTimeTopAnime", page, language],
    queryFn: () => getAllTimeTopAnime(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled,
  });
}

export function useClassicAnime(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["classicAnime", page, language],
    queryFn: () => getClassicAnime(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled,
  });
}

export function useAnimeByDecade(decade: "70s" | "80s" | "90s" | "2000s" | "2010s", page = 1) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["animeByDecade", decade, page, language],
    queryFn: () => getAnimeByDecade(decade, page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useAnimeByGenre(
  genre: string,
  page = 1,
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC"
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["animeByGenre", genre, page, sort, language],
    queryFn: () => getAnimeByGenre(genre, page, 25, sort, language as SupportedLanguage),
    enabled: !!genre,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

// Extended manga hooks
export function useMangaByYearRange(
  startYear: number,
  endYear: number,
  page = 1,
  filter?: "manga" | "manhwa" | "manhua"
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["mangaByYearRange", startYear, endYear, page, filter, language],
    queryFn: () => getMangaByYearRange(startYear, endYear, page, 25, filter, "SCORE_DESC", language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useAllTimeTopManga(page = 1, filter?: "manga" | "manhwa" | "manhua", enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["allTimeTopManga", page, filter, language],
    queryFn: () => getAllTimeTopManga(page, 25, filter, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
    enabled,
  });
}

export function useClassicManga(page = 1) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["classicManga", page, language],
    queryFn: () => getClassicManga(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useTrendingManhwa(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["trendingManhwa", page, language],
    queryFn: () => getTrendingManhwa(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled,
  });
}

export function useTrendingManhua(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["trendingManhua", page, language],
    queryFn: () => getTrendingManhua(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    enabled,
  });
}

export function useMangaByGenre(
  genre: string,
  page = 1,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC"
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["mangaByGenre", genre, page, filter, sort, language],
    queryFn: () => getMangaByGenre(genre, page, 25, filter, sort, language as SupportedLanguage),
    enabled: !!genre,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useNewThisWeekManga(page = 1) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["newThisWeekManga", page, language],
    queryFn: () => getNewThisWeekManga(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useCompletedManga(page = 1) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["completedManga", page, language],
    queryFn: () => getCompletedManga(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useRecentlyUpdatedAnime(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["recentlyUpdatedAnime", page, language],
    queryFn: () => getRecentlyUpdatedAnime(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled,
  });
}

export function useRecentlyUpdatedManga(page = 1, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["recentlyUpdatedManga", page, language],
    queryFn: () => getRecentlyUpdatedManga(page, 25, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    enabled,
  });
}

// Infinite scroll hooks
const PER_PAGE = 25;

export function useInfiniteTopAnime(
  filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite' | 'new' | 'completed'
) {
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: ["infiniteTopAnime", filter, language],
    queryFn: ({ pageParam = 1 }) => getTopAnime(pageParam, PER_PAGE, filter, language as SupportedLanguage),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PER_PAGE ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useInfiniteSearchAnime(
  query: string,
  enabled = true
) {
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: ["infiniteSearchAnime", query, language],
    queryFn: ({ pageParam = 1 }) => searchAnime(query.trim(), pageParam, PER_PAGE, language as SupportedLanguage),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PER_PAGE ? allPages.length + 1 : undefined,
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useInfiniteTopManga(
  type?: 'manga' | 'novels' | 'lightnovels' | 'oneshots' | 'doujin' | 'manhwa' | 'manhua',
  sort: 'popularity' | 'score' | 'trending' | 'newest' = 'popularity'
) {
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: ["infiniteTopManga", type, sort, language],
    queryFn: ({ pageParam = 1 }) => getTopManga(pageParam, PER_PAGE, type, sort, language as SupportedLanguage),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PER_PAGE ? allPages.length + 1 : undefined,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}

export function useInfiniteMangaByGenre(
  genre: string,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC"
) {
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: ["infiniteMangaByGenre", genre, filter, sort, language],
    queryFn: ({ pageParam = 1 }) => getMangaByGenre(genre, pageParam, PER_PAGE, filter, sort, language as SupportedLanguage),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PER_PAGE ? allPages.length + 1 : undefined,
    enabled: !!genre,
    staleTime: 1000 * 60 * 15,
    gcTime: 1000 * 60 * 60,
  });
}

export function useInfiniteSearchManga(
  query: string,
  enabled = true,
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua"
) {
  const { language } = useLanguage();
  return useInfiniteQuery({
    queryKey: ["infiniteSearchManga", query, filter, language],
    queryFn: ({ pageParam = 1 }) => searchManga(query.trim(), pageParam, PER_PAGE, filter, language as SupportedLanguage),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length >= PER_PAGE ? allPages.length + 1 : undefined,
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
  });
}
