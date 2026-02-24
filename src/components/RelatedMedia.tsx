import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Film, BookOpen, Book, ArrowRight, Loader2, Tv, Gamepad2, Plus, Play, Sparkles, FastForward } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

interface RelatedMediaItem {
  id: number;
  title: string;
  type: "ANIME" | "MANGA";
  format: string;
  relationType: string;
  relationRaw: string;
  image: string;
  status?: string;
  episodes?: number;
  chapters?: number;
  volumes?: number;
}

interface RelatedMediaProps {
  mediaId: number;
  mediaType: "anime" | "manga";
  onNavigate?: () => void;
  /** Current title for cross-media banner context */
  currentTitle?: string;
  currentStatus?: string;
}

const ANILIST_API = "https://graphql.anilist.co";

async function fetchRelatedMedia(mediaId: number, mediaType: "anime" | "manga"): Promise<RelatedMediaItem[]> {
  const type = mediaType.toUpperCase();
  
  const query = `
    query ($id: Int, $type: MediaType) {
      Media(id: $id, type: $type) {
        relations {
          edges {
            relationType
            node {
              id
              title { english romaji }
              type
              format
              status
              episodes
              chapters
              volumes
              coverImage { large medium }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables: { id: mediaId, type } }),
  });

  const json = await response.json();
  const relations = json.data?.Media?.relations?.edges || [];

  return relations.map((edge: any) => ({
    id: edge.node.id,
    title: edge.node.title.english || edge.node.title.romaji,
    type: edge.node.type,
    format: edge.node.format,
    relationType: formatRelationType(edge.relationType),
    relationRaw: edge.relationType,
    image: edge.node.coverImage?.large || edge.node.coverImage?.medium || "",
    status: edge.node.status,
    episodes: edge.node.episodes,
    chapters: edge.node.chapters,
    volumes: edge.node.volumes,
  }));
}

function formatRelationType(type: string): string {
  const map: Record<string, string> = {
    SOURCE: "Source Material",
    ADAPTATION: "Adaptation",
    PREQUEL: "Prequel",
    SEQUEL: "Sequel",
    PARENT: "Parent Story",
    SIDE_STORY: "Side Story",
    SPIN_OFF: "Spin-off",
    ALTERNATIVE: "Alternative",
    OTHER: "Related",
    CHARACTER: "Shared Characters",
    SUMMARY: "Summary",
    COMPILATION: "Compilation",
  };
  return map[type] || type;
}

function formatMediaFormat(format: string): string {
  const map: Record<string, string> = {
    TV: "Anime",
    TV_SHORT: "Anime Short",
    MOVIE: "Movie",
    SPECIAL: "Special",
    OVA: "OVA",
    ONA: "ONA",
    MANGA: "Manga",
    NOVEL: "Light Novel",
    ONE_SHOT: "One-shot",
    MUSIC: "Music",
  };
  return map[format] || format;
}

function formatStatus(status?: string): string {
  const map: Record<string, string> = {
    FINISHED: "Completed",
    RELEASING: "Ongoing",
    NOT_YET_RELEASED: "Upcoming",
    CANCELLED: "Cancelled",
    HIATUS: "Hiatus",
  };
  return status ? map[status] || status : "";
}

function getFormatIcon(format: string) {
  switch (format) {
    case "TV":
    case "TV_SHORT":
    case "ONA":
      return Tv;
    case "MOVIE":
    case "SPECIAL":
    case "OVA":
      return Film;
    case "MANGA":
    case "ONE_SHOT":
      return BookOpen;
    case "NOVEL":
      return Book;
    default:
      return Film;
  }
}

function getFormatEmoji(format: string): string {
  switch (format) {
    case "TV":
    case "TV_SHORT":
    case "ONA":
      return "📺";
    case "MOVIE":
    case "SPECIAL":
    case "OVA":
      return "🎬";
    case "MANGA":
    case "ONE_SHOT":
      return "📖";
    case "NOVEL":
      return "📚";
    default:
      return "🔗";
  }
}

// Priority for sorting relation types
const RELATION_PRIORITY: Record<string, number> = {
  SOURCE: 0,
  ADAPTATION: 1,
  PREQUEL: 2,
  SEQUEL: 3,
  PARENT: 4,
  SIDE_STORY: 5,
  SPIN_OFF: 6,
  ALTERNATIVE: 7,
  SUMMARY: 8,
  COMPILATION: 9,
  CHARACTER: 10,
  OTHER: 11,
};

/**
 * Estimate which manga chapter corresponds to a given anime episode.
 * Uses a rough heuristic: ~2-3 manga chapters per anime episode on average.
 * If we know total episodes and total chapters we can be more precise.
 */
function estimateChapterFromEpisode(
  episodesWatched: number,
  totalEpisodes?: number,
  totalChapters?: number
): number {
  if (totalEpisodes && totalChapters && totalEpisodes > 0) {
    // Proportional mapping
    const ratio = totalChapters / totalEpisodes;
    return Math.round(episodesWatched * ratio);
  }
  // Fallback: ~2.5 chapters per episode (common ratio)
  return Math.round(episodesWatched * 2.5);
}

/**
 * Estimate which anime episode corresponds to a given manga chapter.
 */
function estimateEpisodeFromChapter(
  chaptersRead: number,
  totalEpisodes?: number,
  totalChapters?: number
): number {
  if (totalEpisodes && totalChapters && totalChapters > 0) {
    const ratio = totalEpisodes / totalChapters;
    return Math.round(chaptersRead * ratio);
  }
  // Fallback: ~1 episode per 2.5 chapters
  return Math.max(1, Math.round(chaptersRead / 2.5));
}

export function RelatedMedia({ mediaId, mediaType, onNavigate, currentTitle, currentStatus }: RelatedMediaProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { watchlist, addToWatchlist } = useWatchlist();

  // Get current media's progress from watchlist
  const currentProgress = useMemo(() => {
    if (!watchlist) return null;
    return watchlist.find((w) => w.mal_id === mediaId);
  }, [watchlist, mediaId]);
  
  const { data: relatedMedia, isLoading } = useQuery({
    queryKey: ["related-media-full", mediaId, mediaType],
    queryFn: () => fetchRelatedMedia(mediaId, mediaType),
    staleTime: 1000 * 60 * 15,
  });

  // Group by format category and sort by relation priority
  const grouped = useMemo(() => {
    if (!relatedMedia?.length) return null;

    const sorted = [...relatedMedia].sort(
      (a, b) => (RELATION_PRIORITY[a.relationRaw] ?? 99) - (RELATION_PRIORITY[b.relationRaw] ?? 99)
    );

    const groups: Record<string, RelatedMediaItem[]> = {};
    sorted.forEach((item) => {
      const key = item.type === "ANIME" ? "Anime" : item.format === "NOVEL" ? "Light Novel" : "Manga";
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });

    return groups;
  }, [relatedMedia]);

  // Find cross-media suggestions with chapter/episode correlation
  const crossMediaSuggestion = useMemo(() => {
    if (!relatedMedia?.length || !user) return null;

    const adaptations = relatedMedia.filter(
      (r) => r.relationRaw === "ADAPTATION" || r.relationRaw === "SOURCE"
    );
    if (!adaptations.length) return null;

    for (const item of adaptations) {
      const isTracking = watchlist?.some(
        (w) => w.mal_id === item.id
      );

      if (!isTracking) {
        const isAnime = item.type === "ANIME";
        
        // Calculate suggested starting point based on current progress
        let startPoint: { label: string; value: number } | null = null;
        
        if (currentProgress) {
          if (mediaType === "anime" && !isAnime) {
            // Watching anime → suggesting manga: estimate chapter from episodes watched
            const epsWatched = currentProgress.episodes_watched || currentProgress.last_episode_watched || 0;
            if (epsWatched > 0) {
              const chapter = estimateChapterFromEpisode(epsWatched, currentProgress.episodes_watched ? undefined : undefined, item.chapters);
              // Try using total episodes from the current anime in the watchlist or fallback
              const animeItem = relatedMedia.find(r => r.type === "ANIME" && r.id === mediaId);
              const chapterEstimate = estimateChapterFromEpisode(
                epsWatched,
                animeItem?.episodes,
                item.chapters
              );
              startPoint = { label: `Chapter ${chapterEstimate}`, value: chapterEstimate };
            }
          } else if (mediaType === "manga" && isAnime) {
            // Reading manga → suggesting anime: estimate episode from chapters read
            const chRead = currentProgress.chapters_read || currentProgress.last_chapter_read || 0;
            if (chRead > 0) {
              const episodeEstimate = estimateEpisodeFromChapter(
                chRead,
                item.episodes,
                currentProgress.chapters_read ? undefined : undefined
              );
              startPoint = { label: `Episode ${episodeEstimate}`, value: episodeEstimate };
            }
          }
        }

        return {
          item,
          message: isAnime
            ? "The anime adaptation is available — want to add it to your list?"
            : "The source manga is available — want to add it to your list?",
          type: "add" as const,
          startPoint,
        };
      }
    }
    return null;
  }, [relatedMedia, watchlist, user, currentProgress, mediaId, mediaType]);

  const handleClick = (item: RelatedMediaItem) => {
    const path = item.type === "ANIME" ? `/anime/${item.id}` : `/manga/${item.id}`;
    onNavigate?.();
    navigate(path);
  };

  const handleAddToList = (item: RelatedMediaItem) => {
    addToWatchlist.mutate({
      mal_id: item.id,
      media_type: item.type === "ANIME" ? "anime" : "manga",
      title: item.title,
      image_url: item.image,
    });
  };

  const getUserProgress = (itemId: number) => {
    if (!watchlist) return null;
    return watchlist.find((w) => w.mal_id === itemId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!grouped || Object.keys(grouped).length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
        <Sparkles className="w-4 h-4" />
        Related Media
      </h3>

      {/* Cross-media suggestion banner */}
      {crossMediaSuggestion && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-center gap-3">
          <img
            src={crossMediaSuggestion.item.image || "/placeholder.svg"}
            alt={crossMediaSuggestion.item.title}
            className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium mb-0.5">
              {crossMediaSuggestion.message}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {crossMediaSuggestion.item.title}
            </p>
            {crossMediaSuggestion.startPoint && (
              <p className="text-[11px] text-primary/70 mt-0.5 flex items-center gap-1">
                <FastForward className="w-3 h-3" />
                Pick up from {crossMediaSuggestion.startPoint.label} (est.)
              </p>
            )}
          </div>
          <div className="flex gap-1.5 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleClick(crossMediaSuggestion.item)}
            >
              View
            </Button>
            <Button
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => handleAddToList(crossMediaSuggestion.item)}
            >
              <Plus className="w-3 h-3" />
              Add
            </Button>
          </div>
        </div>
      )}

      {/* Grouped relations */}
      {Object.entries(grouped).map(([groupName, items]) => (
        <div key={groupName}>
          <p className="text-xs font-semibold text-muted-foreground mb-1.5 uppercase tracking-wider">
            {groupName === "Anime" ? "📺" : groupName === "Manga" ? "📖" : "📚"} {groupName}
          </p>
          <div className="space-y-1.5">
            {items.map((item) => {
              const progress = getUserProgress(item.id);
              const Icon = getFormatIcon(item.format);
              const statusStr = formatStatus(item.status);

              // Build progress text
              let progressText = "";
              let catchUpText = "";
              if (progress) {
                if (item.type === "ANIME") {
                  const ep = progress.episodes_watched || 0;
                  const total = item.episodes;
                  progressText = total
                    ? `Episode ${ep} of ${total}`
                    : `Episode ${ep}`;
                  progressText += ` (You're ${progress.status || "tracking"})`;
                } else {
                  const ch = progress.chapters_read || 0;
                  const total = item.chapters;
                  progressText = total
                    ? `Chapter ${ch} of ${total}`
                    : `Chapter ${ch}`;
                  progressText += ` (You're ${progress.status || "tracking"})`;
                }
              } else if (
                currentProgress &&
                (item.relationRaw === "ADAPTATION" || item.relationRaw === "SOURCE")
              ) {
                // Show catch-up suggestion for untracked adaptations
                if (mediaType === "anime" && item.type === "MANGA") {
                  const epsWatched = currentProgress.episodes_watched || currentProgress.last_episode_watched || 0;
                  if (epsWatched > 0) {
                    const ch = estimateChapterFromEpisode(epsWatched, undefined, item.chapters);
                    catchUpText = `Start from Chapter ${ch} (based on Ep ${epsWatched})`;
                  }
                } else if (mediaType === "manga" && item.type === "ANIME") {
                  const chRead = currentProgress.chapters_read || currentProgress.last_chapter_read || 0;
                  if (chRead > 0) {
                    const ep = estimateEpisodeFromChapter(chRead, item.episodes, undefined);
                    catchUpText = `Start from Episode ${ep} (based on Ch ${chRead})`;
                  }
                }
              }

              // Build info text
              let infoText = formatMediaFormat(item.format);
              if (item.type === "ANIME" && item.episodes) {
                infoText += ` · ${item.episodes} eps`;
              } else if (item.type === "MANGA" && item.chapters) {
                infoText += ` · ${item.chapters} ch`;
              }
              if (statusStr) infoText += ` · ${statusStr}`;

              return (
                <button
                  key={item.id}
                  onClick={() => handleClick(item)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/60 transition-all group text-left"
                >
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-10 h-14 sm:w-12 sm:h-16 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span
                        className={cn(
                          "text-xs px-2 py-0.5 rounded-full inline-flex items-center gap-1",
                          item.type === "ANIME"
                            ? "bg-primary/10 text-primary"
                            : item.format === "NOVEL"
                              ? "bg-accent/50 text-accent-foreground"
                              : "bg-secondary text-secondary-foreground"
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {item.relationType}
                      </span>
                      <span className="text-xs text-muted-foreground">{infoText}</span>
                    </div>
                    {/* User progress */}
                    {progress && (
                      <p className="text-[11px] text-primary/80 mt-1 truncate">
                        {getFormatEmoji(item.format)} {progressText}
                      </p>
                    )}
                    {/* Catch-up suggestion or not-on-list */}
                    {!progress && catchUpText && (
                      <p className="text-[11px] text-primary/70 mt-1 flex items-center gap-1 truncate">
                        <FastForward className="w-3 h-3 flex-shrink-0" />
                        {catchUpText} (est.)
                      </p>
                    )}
                    {!progress && !catchUpText && user && (
                      <p className="text-[11px] text-muted-foreground/60 mt-1">
                        Not on your list
                      </p>
                    )}
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
