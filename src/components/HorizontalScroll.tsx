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
    
    // Defer initial check until after first paint to avoid forced reflow
    // Use double-rAF to ensure we're past layout/paint phases
    let frameId1: number;
    let frameId2: number;
    frameId1 = requestAnimationFrame(() => {
      frameId2 = requestAnimationFrame(() => {
        checkScroll();
      });
    });
    
    el.addEventListener("scroll", checkScroll, { passive: true });
    
    // Use ResizeObserver instead of window resize for better performance
    const resizeObserver = new ResizeObserver(checkScroll);
    resizeObserver.observe(el);
    
    return () => {
      cancelAnimationFrame(frameId1);
      cancelAnimationFrame(frameId2);
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
      
      {/* Scroll container */}
      <div className="relative">
        
        <div
          ref={scrollRef}
          className="flex gap-2.5 sm:gap-4 overflow-x-auto hide-scrollbar scroll-smooth pb-4 -mx-3 px-3 sm:mx-0 sm:px-0 transform-gpu"
        >
          {children}
        </div>
      </div>
    </div>
  );
});
