import { useState } from "react";
import { useSpoilerFree } from "@/contexts/SpoilerFreeContext";
import { EyeOff, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpoilerGuardProps {
  children: React.ReactNode;
  /** What kind of spoiler this is */
  type?: "synopsis" | "review" | "comment" | "episode";
  /** Episode/chapter number this spoiler is about */
  episodeNumber?: number;
  /** User's progress (episode/chapter they've reached) */
  userProgress?: number;
  className?: string;
}

export function SpoilerGuard({
  children,
  type = "synopsis",
  episodeNumber,
  userProgress,
  className,
}: SpoilerGuardProps) {
  const { isSpoilerFree } = useSpoilerFree();
  const [revealed, setRevealed] = useState(false);

  // If spoiler-free mode is off, show content normally
  if (!isSpoilerFree) return <>{children}</>;

  // If user has progressed past this episode, show it
  if (episodeNumber && userProgress && userProgress >= episodeNumber) {
    return <>{children}</>;
  }

  // For episode-specific content, hide if user hasn't reached it
  const shouldHide =
    type === "synopsis" ||
    type === "review" ||
    (type === "episode" && episodeNumber && episodeNumber > 1) ||
    (type === "comment" && episodeNumber && userProgress && episodeNumber > userProgress);

  if (!shouldHide) return <>{children}</>;

  if (revealed) return <>{children}</>;

  return (
    <div className={cn("relative", className)}>
      <div className="blur-md select-none pointer-events-none" aria-hidden>
        {children}
      </div>
      <button
        onClick={() => setRevealed(true)}
        className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-xl transition-all hover:bg-background/40"
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <EyeOff className="w-5 h-5" />
          <span className="text-xs font-medium">
            {type === "synopsis" ? "Spoiler-free mode active" : `Spoiler: Episode ${episodeNumber || "?"}`}
          </span>
          <span className="text-[10px] text-muted-foreground/70">Tap to reveal</span>
        </div>
      </button>
    </div>
  );
}
