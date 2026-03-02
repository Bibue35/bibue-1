import { memo } from "react";
import type { TranslationBubble } from "@/hooks/useChapterTranslation";
import { cn } from "@/lib/utils";

interface TranslationOverlayProps {
  bubbles: TranslationBubble[];
  visible: boolean;
}

const bubbleSizeClasses: Record<string, string> = {
  small: "text-[9px] sm:text-[10px] px-1.5 py-0.5 max-w-[100px] sm:max-w-[120px]",
  medium: "text-[10px] sm:text-xs px-2 py-1 max-w-[140px] sm:max-w-[180px]",
  large: "text-xs sm:text-sm px-2.5 py-1.5 max-w-[180px] sm:max-w-[240px]",
};

const typeStyles: Record<string, string> = {
  speech: "bg-background/90 text-foreground border border-primary/30 rounded-lg",
  thought: "bg-background/80 text-foreground/90 border border-border/40 rounded-2xl italic",
  narration: "bg-primary/90 text-primary-foreground border-none rounded-sm",
  sfx: "bg-destructive/80 text-destructive-foreground font-bold border-none rounded-md tracking-wide uppercase",
};

export const TranslationOverlay = memo(function TranslationOverlay({ bubbles, visible }: TranslationOverlayProps) {
  if (!visible || !bubbles || bubbles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className={cn(
            "absolute transform -translate-x-1/2 -translate-y-1/2 shadow-lg backdrop-blur-sm transition-opacity duration-300 pointer-events-auto cursor-default",
            bubbleSizeClasses[bubble.size] || bubbleSizeClasses.medium,
            typeStyles[bubble.type] || typeStyles.speech,
          )}
          style={{
            left: `${Math.min(Math.max(bubble.position.x * 100, 10), 90)}%`,
            top: `${Math.min(Math.max(bubble.position.y * 100, 5), 95)}%`,
          }}
          title={bubble.original}
        >
          <span className="leading-tight block text-center">{bubble.translated}</span>
        </div>
      ))}
    </div>
  );
});
