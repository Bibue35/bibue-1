import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";
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
  Anime,
  Manga,
  ScheduleItem,
  SupportedLanguage,
} from "@/lib/api";

export function useTopAnime(page = 1, filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite') {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["topAnime", page, filter, language],
    queryFn: () => getTopAnime(page, 25, filter, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSeasonalAnime(year?: number, season?: string) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["seasonalAnime", year, season, language],
    queryFn: () => getSeasonalAnime(year, season, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopManga(
  page = 1, 
  type?: 'manga' | 'novels' | 'lightnovels' | 'oneshots' | 'doujin' | 'manhwa' | 'manhua',
  sort: 'popularity' | 'score' | 'trending' | 'newest' = 'popularity'
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["topManga", page, type, sort, language],
    queryFn: () => getTopManga(page, 25, type, sort, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchAnime(query: string, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["searchAnime", query, language],
    queryFn: () => searchAnime(query.trim(), 1, 25, language as SupportedLanguage),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchManga(
  query: string,
  enabled = true,
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua",
) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["searchManga", query, filter, language],
    queryFn: () => searchManga(query.trim(), 1, 25, filter, language as SupportedLanguage),
    enabled: enabled && query.trim().length > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnimeDetails(id: number, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["anime", id, language],
    queryFn: () => getAnimeById(id, language as SupportedLanguage),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMangaDetails(id: number, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["manga", id, language],
    queryFn: () => getMangaById(id, language as SupportedLanguage),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSchedule(day?: string) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["schedule", day, language],
    queryFn: () => getSchedule(day, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
  });
}

export function useScheduleByDay(day: string) {
  const { language } = useLanguage();
  return useQuery<ScheduleItem[]>({
    queryKey: ["scheduleByDay", day, language],
    queryFn: () => getScheduleByDay(day, language as SupportedLanguage),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnimeRecommendations(id: number | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["animeRecommendations", id, language],
    queryFn: () => getAnimeRecommendations(id!, language as SupportedLanguage),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMangaRecommendations(id: number | undefined, enabled = true) {
  const { language } = useLanguage();
  return useQuery({
    queryKey: ["mangaRecommendations", id, language],
    queryFn: () => getMangaRecommendations(id!, language as SupportedLanguage),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 10,
  });
}
