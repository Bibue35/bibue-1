import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RatingPopoverProps {
  currentScore: number | null;
  onRate: (score: number | null) => void;
  size?: "sm" | "default";
}

export function RatingPopover({ currentScore, onRate, size = "default" }: RatingPopoverProps) {
  const [open, setOpen] = useState(false);
  const [hoverScore, setHoverScore] = useState<number | null>(null);

  const displayScore = hoverScore ?? currentScore;

  const handleRate = (score: number) => {
    // If clicking on the same score, remove it
    if (score === currentScore) {
      onRate(null);
    } else {
      onRate(score);
    }
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size === "sm" ? "sm" : "default"}
          className={cn(
            "gap-1 rounded-full",
            size === "sm" ? "h-7 px-2 text-xs" : "h-8 px-3 text-sm"
          )}
        >
          <Star
            className={cn(
              size === "sm" ? "w-3 h-3" : "w-4 h-4",
              currentScore ? "fill-primary text-primary" : "text-muted-foreground"
            )}
          />
          <span className={currentScore ? "text-foreground" : "text-muted-foreground"}>
            {currentScore ? currentScore.toFixed(0) : "Rate"}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="start">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center mb-2">
            {displayScore ? `${displayScore}/10` : "Tap to rate"}
          </p>
          <div className="flex gap-0.5">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
              <button
                key={score}
                onClick={() => handleRate(score)}
                onMouseEnter={() => setHoverScore(score)}
                onMouseLeave={() => setHoverScore(null)}
                className="p-0.5 hover:scale-110 transition-transform"
              >
                <Star
                  className={cn(
                    "w-5 h-5 transition-colors",
                    (displayScore ?? 0) >= score
                      ? "fill-primary text-primary"
                      : "text-muted-foreground/40"
                  )}
                />
              </button>
            ))}
          </div>
          {currentScore && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs h-7 mt-2"
              onClick={() => {
                onRate(null);
                setOpen(false);
              }}
            >
              Remove rating
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
