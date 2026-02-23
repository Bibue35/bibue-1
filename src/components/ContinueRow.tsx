import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Play, BookOpen } from "lucide-react";
import { useWatchlist, WatchlistItem } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { HorizontalScroll } from "@/components/HorizontalScroll";
import { ContentSection } from "@/components/ContentSection";
import { QuickProgressButton } from "@/components/QuickProgressButton";
import { Progress } from "@/components/ui/progress";

function ContinueCard({ item }: { item: WatchlistItem }) {
  const isAnime = item.media_type === "anime";
  const current = isAnime ? (item.episodes_watched || 0) : (item.chapters_read || 0);
  // We don't have total stored in watchlist, so show what we have
  const label = isAnime
    ? `Episode ${current}`
    : `Chapter ${current}`;

  return (
    <div
      className="flex-shrink-0 w-32 sm:w-40 md:w-44 group relative"
      style={{ scrollSnapAlign: "start" }}
    >
      <Link to={`/${item.media_type}/${item.mal_id}`}>
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted mb-1.5">
          {item.image_url ? (
            <img
              src={item.image_url}
              alt={`${item.title} cover`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {isAnime ? (
                <Play className="w-8 h-8 text-muted-foreground" />
              ) : (
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
          )}
          {/* Progress bar at bottom */}
          {current > 0 && (
            <div className="absolute bottom-0 left-0 right-0">
              <div className="h-1 bg-muted/50">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.min(current * 4, 100)}%` }}
                />
              </div>
            </div>
          )}
          {/* Episode/Chapter overlay */}
          <div className="absolute bottom-1 left-0 right-0 px-1.5">
            <div className="bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5">
              <span className="text-[10px] sm:text-xs font-medium">{label}</span>
            </div>
          </div>
        </div>
      </Link>

      {/* Title */}
      <p className="text-xs sm:text-sm font-medium truncate group-hover:text-primary transition-colors mb-1">
        {item.title}
      </p>

      {/* Quick +1 button */}
      <QuickProgressButton
        mal_id={item.mal_id}
        media_type={item.media_type}
        className="w-full justify-center"
        size="sm"
      />
    </div>
  );
}

export function ContinueWatchingRow() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const watchingItems = useMemo(() => {
    if (!watchlist) return [];
    return watchlist
      .filter(
        (item) =>
          item.media_type === "anime" &&
          (item.status === "watching" || item.status === "Watching") &&
          (item.episodes_watched || 0) > 0
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 20);
  }, [watchlist]);

  if (!user || watchingItems.length === 0) return null;

  return (
    <ContentSection
      title="Continue Watching"
      icon={Play}
      linkTo="/watchlist"
      linkText="View All"
      compact
    >
      <HorizontalScroll showArrows={false}>
        {watchingItems.map((item) => (
          <ContinueCard key={item.id} item={item} />
        ))}
      </HorizontalScroll>
    </ContentSection>
  );
}

export function ContinueReadingRow() {
  const { user } = useAuth();
  const { watchlist } = useWatchlist();

  const readingItems = useMemo(() => {
    if (!watchlist) return [];
    return watchlist
      .filter(
        (item) =>
          item.media_type === "manga" &&
          (item.status === "reading" || item.status === "Reading") &&
          (item.chapters_read || 0) > 0
      )
      .sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      )
      .slice(0, 20);
  }, [watchlist]);

  if (!user || readingItems.length === 0) return null;

  return (
    <ContentSection
      title="Continue Reading"
      icon={BookOpen}
      linkTo="/watchlist"
      linkText="View All"
      compact
    >
      <HorizontalScroll showArrows={false}>
        {readingItems.map((item) => (
          <ContinueCard key={item.id} item={item} />
        ))}
      </HorizontalScroll>
    </ContentSection>
  );
}
