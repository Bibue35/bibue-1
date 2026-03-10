import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCallback } from "react";

function formatViewCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return count.toString();
}

/** Fetch view count for a single media item */
export function useMediaViewCount(mediaId: number | undefined, mediaType: string = "manga") {
  const { data: viewCount = 0 } = useQuery({
    queryKey: ["media-views", mediaId, mediaType],
    queryFn: async () => {
      const { data } = await supabase
        .from("media_view_counts" as any)
        .select("view_count")
        .eq("media_id", mediaId!)
        .eq("media_type", mediaType)
        .maybeSingle();
      return (data as any)?.view_count ?? 0;
    },
    enabled: !!mediaId,
    staleTime: 60_000,
  });

  return { viewCount, formatted: formatViewCount(viewCount) };
}

/** Fetch view counts for multiple media items at once */
export function useBatchMediaViewCounts(mediaIds: number[], mediaType: string = "manga") {
  const { data: viewMap = {} } = useQuery({
    queryKey: ["media-views-batch", mediaType, ...mediaIds.slice(0, 20)],
    queryFn: async () => {
      if (!mediaIds.length) return {};
      const { data } = await supabase
        .from("media_view_counts" as any)
        .select("media_id, view_count")
        .eq("media_type", mediaType)
        .in("media_id", mediaIds);
      const map: Record<number, number> = {};
      (data as any[])?.forEach((row) => { map[row.media_id] = row.view_count; });
      return map;
    },
    enabled: mediaIds.length > 0,
    staleTime: 60_000,
  });

  return {
    getCount: (id: number) => viewMap[id] ?? 0,
    getFormatted: (id: number) => formatViewCount(viewMap[id] ?? 0),
  };
}

/** Record a view (call when user opens detail modal) */
export function useRecordView() {
  const queryClient = useQueryClient();

  const recordView = useCallback(async (mediaId: number, mediaType: string = "manga") => {
    // Optimistic update
    queryClient.setQueryData(["media-views", mediaId, mediaType], (old: number | undefined) => (old ?? 0) + 1);

    await supabase.rpc("increment_view_count" as any, {
      p_media_id: mediaId,
      p_media_type: mediaType,
    });
  }, [queryClient]);

  return recordView;
}
