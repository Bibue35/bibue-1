import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getAnimeRecommendations, getMangaRecommendations } from "@/lib/api";

interface WatchlistButtonProps {
  mal_id: number;
  media_type: "anime" | "manga";
  title: string;
  title_japanese?: string;
  image_url?: string;
  score?: number;
  variant?: "icon" | "full";
  className?: string;
}

export function WatchlistButton({
  mal_id,
  media_type,
  title,
  title_japanese,
  image_url,
  score,
  variant = "icon",
  className,
}: WatchlistButtonProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const queryClient = useQueryClient();

  const inWatchlist = isInWatchlist(mal_id, media_type);
  const isLoading = addToWatchlist.isPending || removeFromWatchlist.isPending;

  // Show a recommendation after adding to watchlist
  const showRecommendation = useCallback(async (mediaId: number, mediaType: "anime" | "manga", addedTitle: string) => {
    try {
      const recs = mediaType === "anime" 
        ? await queryClient.fetchQuery({
            queryKey: ["animeRecommendations", mediaId],
            queryFn: () => getAnimeRecommendations(mediaId),
            staleTime: 1000 * 60 * 15,
          })
        : await queryClient.fetchQuery({
            queryKey: ["mangaRecommendations", mediaId],
            queryFn: () => getMangaRecommendations(mediaId),
            staleTime: 1000 * 60 * 15,
          });

      if (recs && recs.length > 0) {
        const rec = recs[0].entry;
        toast(`Since you liked ${addedTitle}`, {
          description: `Check out "${rec.title}"`,
          duration: 5000,
          action: {
            label: "View",
            onClick: () => {
              window.location.href = `/${mediaType}/${rec.anilist_id}`;
            },
          },
        });
      }
    } catch {
      // Silently fail — recommendation is non-critical
    }
  }, [queryClient]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) return;

    if (inWatchlist) {
      removeFromWatchlist.mutate({ mal_id, media_type });
    } else {
      addToWatchlist.mutate(
        { mal_id, media_type, title, title_japanese, image_url, score },
        {
          onSuccess: () => {
            showRecommendation(mal_id, media_type, title);
          },
        }
      );
    }
  };

  if (!user) return null;

  if (variant === "full") {
    return (
      <Button
        variant={inWatchlist ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={isLoading}
        className={cn("gap-2", className)}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Heart className={cn("w-4 h-4", inWatchlist && "fill-current")} />
        )}
        {inWatchlist ? t("status.inWatchlist") : t("status.addToWatchlist")}
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      disabled={isLoading}
      aria-label={inWatchlist ? `Remove ${title} from watchlist` : `Add ${title} to watchlist`}
      className={cn(
        "rounded-full h-8 w-8",
        inWatchlist && "text-destructive hover:text-destructive/80",
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart className={cn("w-4 h-4", inWatchlist && "fill-current")} />
      )}
    </Button>
  );
}
