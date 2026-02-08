import { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ExpandOverlayProps {
  rect: Rect | null;
  onComplete: () => void;
}

/**
 * Full-screen overlay that animates from a source rect to cover the viewport,
 * then fades out. Used for episode/chapter card → player/reader transitions.
 */
function ExpandOverlay({ rect, onComplete }: ExpandOverlayProps) {
  const [phase, setPhase] = useState<"expand" | "hold" | "done">("expand");

  useEffect(() => {
    if (!rect) return;
    // After expand animation finishes, hold briefly then complete
    const expandTimer = setTimeout(() => {
      setPhase("hold");
      const holdTimer = setTimeout(() => {
        setPhase("done");
        onComplete();
      }, 100);
      return () => clearTimeout(holdTimer);
    }, 350);
    return () => clearTimeout(expandTimer);
  }, [rect, onComplete]);

  if (!rect || phase === "done") return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div
        className={cn(
          "absolute bg-background/95 backdrop-blur-sm rounded-xl",
          "transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]"
        )}
        style={
          phase === "expand"
            ? {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                borderRadius: "0.75rem",
                transitionDuration: "0ms",
              }
            : undefined
        }
        ref={(el) => {
          if (el && phase === "expand") {
            // Force reflow then animate to fullscreen
            el.getBoundingClientRect();
            requestAnimationFrame(() => {
              el.style.transitionDuration = "350ms";
              el.style.top = "0px";
              el.style.left = "0px";
              el.style.width = "100vw";
              el.style.height = "100vh";
              el.style.borderRadius = "0px";
            });
          }
        }}
      />
    </div>,
    document.body
  );
}

/**
 * Hook that manages the expand-to-fullscreen transition.
 * Returns a trigger function and the overlay component to render.
 */
export function useExpandTransition(onComplete: () => void) {
  const [sourceRect, setSourceRect] = useState<Rect | null>(null);
  const callbackRef = useRef(onComplete);
  callbackRef.current = onComplete;

  const handleComplete = useCallback(() => {
    setSourceRect(null);
    callbackRef.current();
  }, []);

  const trigger = useCallback((event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget;
    const rect = el.getBoundingClientRect();
    setSourceRect({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
  }, []);

  const overlay = sourceRect ? (
    <ExpandOverlay rect={sourceRect} onComplete={handleComplete} />
  ) : null;

  return { trigger, overlay };
}
