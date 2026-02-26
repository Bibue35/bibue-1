import { useQuery } from "@tanstack/react-query";
import type { MangaDexSearchResult } from "./useMangaDex";

const FUNCTION_NAME = "mangadex-proxy";

async function callBrowse(params: Record<string, string>) {
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
    throw new Error(err.error || 'MangaDex browse failed');
  }

  return res.json();
}

export function useMangaDexPopular(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'popular', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'popular', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexLatest(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'latest', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'latest', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexTopRated(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'rating', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'rating', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexManhwa(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'manhwa', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'popular', lang: 'ko', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexManhua(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'manhua', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'popular', lang: 'zh', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexCompleted(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'completed', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'popular', status: 'completed', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}

export function useMangaDexNewest(page = 1, enabled = true) {
  return useQuery({
    queryKey: ['mangadex-browse', 'newest', page],
    queryFn: () => callBrowse({ action: 'browse', sort: 'newest', limit: '20', offset: String((page - 1) * 20) }),
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
    select: (data) => data.results as MangaDexSearchResult[],
  });
}
