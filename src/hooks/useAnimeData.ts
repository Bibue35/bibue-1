import { useQuery } from "@tanstack/react-query";
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
  Anime,
  Manga,
  ScheduleItem,
} from "@/lib/api";

export function useTopAnime(page = 1, filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite') {
  return useQuery({
    queryKey: ["topAnime", page, filter],
    queryFn: () => getTopAnime(page, 25, filter),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

export function useSeasonalAnime(year?: number, season?: string) {
  return useQuery({
    queryKey: ["seasonalAnime", year, season],
    queryFn: () => getSeasonalAnime(year, season),
    staleTime: 1000 * 60 * 5,
  });
}

export function useTopManga(page = 1, type?: 'manga' | 'novels' | 'lightnovels' | 'oneshots' | 'doujin' | 'manhwa' | 'manhua') {
  return useQuery({
    queryKey: ["topManga", page, type],
    queryFn: () => getTopManga(page, 25, type),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchAnime(query: string, enabled = true) {
  return useQuery({
    queryKey: ["searchAnime", query],
    queryFn: () => searchAnime(query),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSearchManga(query: string, enabled = true) {
  return useQuery({
    queryKey: ["searchManga", query],
    queryFn: () => searchManga(query),
    enabled: enabled && query.length > 2,
    staleTime: 1000 * 60 * 5,
  });
}

export function useAnimeDetails(id: number, enabled = true) {
  return useQuery({
    queryKey: ["anime", id],
    queryFn: () => getAnimeById(id),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useMangaDetails(id: number, enabled = true) {
  return useQuery({
    queryKey: ["manga", id],
    queryFn: () => getMangaById(id),
    enabled,
    staleTime: 1000 * 60 * 10,
  });
}

export function useSchedule(day?: string) {
  return useQuery({
    queryKey: ["schedule", day],
    queryFn: () => getSchedule(day),
    staleTime: 1000 * 60 * 5,
  });
}

export function useScheduleByDay(day: string) {
  return useQuery<ScheduleItem[]>({
    queryKey: ["scheduleByDay", day],
    queryFn: () => getScheduleByDay(day),
    staleTime: 1000 * 60 * 5,
  });
}
