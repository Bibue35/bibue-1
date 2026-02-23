import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuickProgressButtonProps {
  mal_id: number;
  media_type: "anime" | "manga";
  totalEpisodes?: number;
  totalChapters?: number;
  className?: string;
  size?: "sm" | "default";
}

export function QuickProgressButton({
  mal_id,
  media_type,
  totalEpisodes,
  totalChapters,
  className,
  size = "sm",
}: QuickProgressButtonProps) {
  const { getWatchlistItem, updateProgress } = useWatchlist();
  const { toast } = useToast();
  const item = getWatchlistItem(mal_id, media_type);

  if (!item) return null;

  const isAnime = media_type === "anime";
  const current = isAnime ? (item.episodes_watched || 0) : (item.chapters_read || 0);
  const total = isAnime ? totalEpisodes : totalChapters;
  const field = isAnime ? "episodes_watched" : "chapters_read";
  const lastField = isAnime ? "last_episode_watched" : "last_chapter_read";
  const label = isAnime ? "Ep" : "Ch";

  const atMax = total ? current >= total : false;

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (atMax) return;
    const newValue = current + 1;
    updateProgress.mutate({ mal_id, media_type, field, value: newValue });
    updateProgress.mutate({ mal_id, media_type, field: lastField, value: newValue });
    toast({
      title: `${item.title}: ${label} ${newValue}${total ? ` of ${total}` : ""} ✓`,
    });
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (current <= 0) return;
    const newValue = current - 1;
    updateProgress.mutate({ mal_id, media_type, field, value: newValue });
    updateProgress.mutate({ mal_id, media_type, field: lastField, value: newValue });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-full bg-muted/80 backdrop-blur-sm",
        size === "sm" ? "h-7 px-1" : "h-9 px-1.5",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full hover:bg-background/60",
          size === "sm" ? "h-5 w-5" : "h-7 w-7"
        )}
        onClick={handleDecrement}
        disabled={current <= 0 || updateProgress.isPending}
      >
        <Minus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      </Button>
      <span className={cn(
        "font-medium tabular-nums text-center min-w-[3rem]",
        size === "sm" ? "text-xs" : "text-sm"
      )}>
        {label} {current}{total ? `/${total}` : ""}
      </span>
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "rounded-full hover:bg-primary/20 hover:text-primary",
          size === "sm" ? "h-5 w-5" : "h-7 w-7"
        )}
        onClick={handleIncrement}
        disabled={atMax || updateProgress.isPending}
      >
        <Plus className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />
      </Button>
    </div>
  );
}
