import { useRef, useEffect, useState, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HorizontalScrollProps {
  children: React.ReactNode;
  title?: string;
  titleJp?: string;
  showArrows?: boolean;
  className?: string;
}

export const HorizontalScroll = memo(function HorizontalScroll({
  children,
  title,
  titleJp,
  showArrows = true,
  className,
}: HorizontalScrollProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const rafIdRef = useRef<number>(0);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    // Cancel any pending rAF to debounce rapid calls (e.g. from ResizeObserver)
    cancelAnimationFrame(rafIdRef.current);
    rafIdRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    
    // Defer initial check until browser is idle to avoid forced reflow on mount
    let idleHandle: number;
    const win = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (win.requestIdleCallback) {
      idleHandle = win.requestIdleCallback(() => checkScroll(), { timeout: 500 });
    } else {
      idleHandle = window.setTimeout(() => checkScroll(), 100);
    }
    
    el.addEventListener("scroll", checkScroll, { passive: true });
    
    // Use ResizeObserver instead of window resize for better performance
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    
    return () => {
      if (win.cancelIdleCallback) {
        win.cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }
      cancelAnimationFrame(rafIdRef.current);
      el.removeEventListener("scroll", checkScroll);
      resizeObserver.disconnect();
    };
  }, [checkScroll]);

  const scroll = useCallback((direction: "left" | "right") => {
    if (!scrollRef.current) return;
    // Batch layout read in rAF to avoid forced reflow
    requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    });
  }, []);

  return (
    <div className={cn("relative group", className)}>
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              {title}
            </h2>
            {titleJp && (
              <span className="font-jp text-sm text-muted-foreground">
                {titleJp}
              </span>
            )}
          </div>
          
          {showArrows && (
            <div className="hidden sm:flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                className="rounded-full h-8 w-8"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                className="rounded-full h-8 w-8"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Scroll container — outer clips horizontal overflow, inner allows card hover expansion */}
      <div className="relative overflow-hidden -mx-3 px-3 sm:mx-0 sm:px-0">
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto hide-scrollbar scroll-smooth py-4 -my-4 transform-gpu snap-x snap-mandatory [&>*]:snap-start"
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            touchAction: "pan-x",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
});
