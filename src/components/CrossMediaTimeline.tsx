import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tv, BookOpen, Film, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface CrossMediaTimelineProps {
  userId: string;
}

interface TimelineEntry {
  id: string;
  title: string;
  media_type: string;
  status: string | null;
  image_url: string | null;
  updated_at: string;
  episodes_watched: number | null;
  chapters_read: number | null;
  score: number | null;
  mal_id: number;
}

const MEDIA_TYPE_CONFIG: Record<string, { icon: typeof Tv; label: string; colorClass: string }> = {
  anime: { icon: Tv, label: "Anime", colorClass: "text-blue-400 bg-blue-400/10" },
  manga: { icon: BookOpen, label: "Manga", colorClass: "text-green-400 bg-green-400/10" },
  manhwa: { icon: BookOpen, label: "Manhwa", colorClass: "text-purple-400 bg-purple-400/10" },
  manhua: { icon: BookOpen, label: "Manhua", colorClass: "text-red-400 bg-red-400/10" },
  novel: { icon: BookOpen, label: "Light Novel", colorClass: "text-amber-400 bg-amber-400/10" },
  movie: { icon: Film, label: "Movie", colorClass: "text-pink-400 bg-pink-400/10" },
};

function getConfig(type: string) {
  return MEDIA_TYPE_CONFIG[type] || MEDIA_TYPE_CONFIG.anime;
}

export function CrossMediaTimeline({ userId }: CrossMediaTimelineProps) {
  const { data: entries, isLoading } = useQuery({
    queryKey: ["cross-media-timeline", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("watchlist")
        .select("id, title, media_type, status, image_url, updated_at, episodes_watched, chapters_read, score, mal_id")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data as TimelineEntry[];
    },
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!entries?.length) {
    return (
      <p className="text-muted-foreground text-center py-8">No media tracked yet.</p>
    );
  }

  // Group by connections (same title, different media types)
  const titleGroups: Record<string, TimelineEntry[]> = {};
  entries.forEach((e) => {
    // Normalize title for grouping
    const key = e.title.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!titleGroups[key]) titleGroups[key] = [];
    titleGroups[key].push(e);
  });

  const crossMediaEntries = Object.values(titleGroups).filter((g) => g.length > 1);

  return (
    <div className="space-y-6">
      {/* Cross-media connections */}
      {crossMediaEntries.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            🔗 Cross-Media Connections
          </h4>
          <div className="space-y-3">
            {crossMediaEntries.map((group) => (
              <div
                key={group[0].title}
                className="rounded-xl bg-muted/30 border border-border/50 p-3"
              >
                <p className="font-medium text-sm mb-2">{group[0].title}</p>
                <div className="flex flex-wrap gap-2">
                  {group.map((entry) => {
                    const config = getConfig(entry.media_type);
                    const Icon = config.icon;
                    return (
                      <span
                        key={entry.id}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                          config.colorClass
                        )}
                      >
                        <Icon className="w-3 h-3" />
                        {config.label}
                        {entry.status && (
                          <span className="opacity-70">
                            · {entry.status === "completed" ? "✓" : entry.status === "watching" ? "▶" : entry.status}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full timeline */}
      <div className="relative">
        <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
        <div className="space-y-4">
          {entries.map((entry) => {
            const config = getConfig(entry.media_type);
            const Icon = config.icon;
            return (
              <div key={entry.id} className="relative pl-10">
                <div className={cn(
                  "absolute left-2.5 top-3 w-3 h-3 rounded-full border-2 border-background",
                  config.colorClass.split(" ")[0].replace("text-", "bg-")
                )} />
                <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors">
                  {entry.image_url && (
                    <img
                      src={entry.image_url}
                      alt={entry.title}
                      className="w-10 h-14 object-cover rounded-lg flex-shrink-0"
                      loading="lazy"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{entry.title}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                      <span className={cn("inline-flex items-center gap-1", config.colorClass.split(" ")[0])}>
                        <Icon className="w-3 h-3" />
                        {config.label}
                      </span>
                      {entry.status && (
                        <span className="capitalize">{entry.status.replace(/_/g, " ")}</span>
                      )}
                      {entry.episodes_watched ? (
                        <span>Ep {entry.episodes_watched}</span>
                      ) : entry.chapters_read ? (
                        <span>Ch {entry.chapters_read}</span>
                      ) : null}
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex-shrink-0">
                    {formatDistanceToNow(new Date(entry.updated_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
