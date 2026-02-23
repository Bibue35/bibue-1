import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";

const ANILIST_API = "https://graphql.anilist.co";

/**
 * On site visit, checks airing schedule for tracked anime and generates
 * notifications for newly aired episodes. Runs once per session.
 */
export function useNotificationGenerator() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();
  const { createNotification } = useNotifications();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!user || !watchlist?.length || hasRun.current) return;
    hasRun.current = true;

    // Get notification settings
    const checkAndGenerate = async () => {
      try {
        // Get user notification settings
        const { data: prefs } = await supabase
          .from("user_preferences")
          .select("notify_new_episodes, notify_new_chapters, notify_season_announcements")
          .eq("user_id", user.id)
          .maybeSingle();

        const notifyEpisodes = prefs?.notify_new_episodes ?? true;
        if (!notifyEpisodes) return;

        // Get notification preferences for specific media
        const { data: mediaPrefsList } = await supabase
          .from("notification_preferences")
          .select("media_id, media_type, enabled")
          .eq("user_id", user.id);

        const mediaPrefs = new Map(
          (mediaPrefsList || []).map((p) => [`${p.media_type}-${p.media_id}`, p.enabled])
        );

        // Filter watching anime that have notifications enabled (or no explicit pref = default on for watching)
        const watchingAnime = watchlist.filter((item) => {
          if (item.media_type !== "anime") return false;
          if (item.status !== "watching" && item.status !== "Watching") return false;
          const prefKey = `anime-${item.mal_id}`;
          const pref = mediaPrefs.get(prefKey);
          return pref !== false; // Default to enabled
        });

        if (watchingAnime.length === 0) return;

        // Batch check airing status for up to 20 anime
        const ids = watchingAnime.slice(0, 20).map((a) => a.mal_id);

        const query = `
          query ($ids: [Int]) {
            Page(perPage: 50) {
              media(id_in: $ids, type: ANIME) {
                id
                title { english romaji }
                coverImage { large }
                nextAiringEpisode { airingAt episode }
                status
                episodes
              }
            }
          }
        `;

        const response = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ query, variables: { ids } }),
        });

        const json = await response.json();
        const mediaList = json.data?.Page?.media || [];

        for (const media of mediaList) {
          const watchlistItem = watchingAnime.find((w) => w.mal_id === media.id);
          if (!watchlistItem) continue;

          const title = media.title.english || media.title.romaji;
          const imageUrl = media.coverImage?.large;

          // Check if a new episode recently aired (within last 24h)
          if (media.nextAiringEpisode) {
            const airingAt = media.nextAiringEpisode.airingAt * 1000;
            const now = Date.now();
            const epNum = media.nextAiringEpisode.episode - 1; // The one that just aired

            // If the previous episode aired within last 24h
            if (epNum > 0 && epNum > (watchlistItem.episodes_watched || 0)) {
              await createNotification({
                media_id: media.id,
                media_type: "anime",
                type: "new_episode",
                message: `${title} Episode ${epNum} is now available!`,
                title: title,
                image_url: imageUrl,
              });
            }
          }

          // Status change notification (e.g. new season confirmed)
          if (media.status === "NOT_YET_RELEASED") {
            await createNotification({
              media_id: media.id,
              media_type: "anime",
              type: "status_change",
              message: `${title} has been announced!`,
              title: title,
              image_url: imageUrl,
            });
          }
        }
      } catch (error) {
        console.error("[NotificationGenerator] Error:", error);
      }
    };

    // Delay to avoid blocking initial page render
    const timeout = setTimeout(checkAndGenerate, 5000);
    return () => clearTimeout(timeout);
  }, [user, watchlist, createNotification]);
}
