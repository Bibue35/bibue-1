import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

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

  const inWatchlist = isInWatchlist(mal_id, media_type);
  const isLoading = addToWatchlist.isPending || removeFromWatchlist.isPending;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      return;
    }

    if (inWatchlist) {
      removeFromWatchlist.mutate({ mal_id, media_type });
    } else {
      addToWatchlist.mutate({
        mal_id,
        media_type,
        title,
        title_japanese,
        image_url,
        score,
      });
    }
  };

  if (!user) {
    return null;
  }

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
