import { useCallback, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

const PREFETCH_DELAY = 200; // ms of hover before prefetching

/**
 * Hook that prefetches anime/manga detail data on hover after a 200ms delay.
 * Returns onMouseEnter/onMouseLeave handlers to attach to cards.
 */
export function usePrefetch() {
  const queryClient = useQueryClient();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const prefetchDetail = useCallback(
    (type: "anime" | "manga", id: number) => {
      // Don't prefetch if already in cache
      const existing = queryClient.getQueryData([`${type}Detail`, id]);
      if (existing) return;

      queryClient.prefetchQuery({
        queryKey: [`${type}Detail`, id],
        queryFn: async () => {
          const res = await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-proxy`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                query: `query ($id: Int) { Media(id: $id, type: ${type === "anime" ? "ANIME" : "MANGA"}) { id title { romaji english native } description episodes chapters status genres averageScore coverImage { extraLarge large } bannerImage } }`,
                variables: { id },
              }),
            }
          );
          return res.json();
        },
        staleTime: 1000 * 60 * 10, // 10 min
      });
    },
    [queryClient]
  );

  const onHoverStart = useCallback(
    (type: "anime" | "manga", id: number) => {
      timerRef.current = setTimeout(() => {
        prefetchDetail(type, id);
      }, PREFETCH_DELAY);
    },
    [prefetchDetail]
  );

  const onHoverEnd = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { onHoverStart, onHoverEnd };
}
