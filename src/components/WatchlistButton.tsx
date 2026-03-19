import { Bookmark, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWatchlist } from "@/hooks/useWatchlist";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { useState, lazy, Suspense, useRef } from "react";

const AuthModal = lazy(() => import("./AuthModal").then(m => ({ default: m.AuthModal })));

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
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const inWatchlist = user ? isInWatchlist(mal_id, media_type) : false;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    // Trigger micro-animation
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    // Debounce rapid clicks
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
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
    }, 150);
  };

  const bookmarkIcon = (
    <Bookmark
      className={cn(
        "w-4 h-4 transition-all duration-200",
        inWatchlist && "fill-primary text-primary",
        animating && "scale-125"
      )}
    />
  );

  if (variant === "full") {
    return (
      <>
        <Button
          variant={inWatchlist ? "secondary" : "outline"}
          size="sm"
          onClick={handleClick}
          className={cn(
            "gap-2 transition-all duration-200",
            inWatchlist && "text-primary border-primary/30",
            animating && "scale-95",
            className
          )}
        >
          {bookmarkIcon}
          {inWatchlist ? "Bookmarked" : "Bookmark"}
        </Button>
        {authModalOpen && (
          <Suspense fallback={null}>
            <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
          </Suspense>
        )}
      </>
    );
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        aria-label={inWatchlist ? `Remove ${title} from bookmarks` : `Bookmark ${title}`}
        className={cn(
          "rounded-full h-8 w-8 transition-all duration-200",
          inWatchlist && "text-primary hover:text-primary/80",
          animating && "scale-110",
          className
        )}
      >
        {bookmarkIcon}
      </Button>
      {authModalOpen && (
        <Suspense fallback={null}>
          <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
        </Suspense>
      )}
    </>
  );
}
