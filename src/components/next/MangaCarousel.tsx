'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import MangaCard, { type MangaCardProps } from './MangaCard';

export interface MangaCarouselProps {
  title: string;
  sublabel?: string | null;
  items: Array<Omit<MangaCardProps, 'index' | 'variant'>>;
}

export default function MangaCarousel({ title, sublabel, items }: MangaCarouselProps) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const updateEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // 1px tolerance — sub-pixel scroll positions are common on trackpads.
    setAtStart(scrollLeft <= 1);
    setAtEnd(scrollLeft + clientWidth >= scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener('scroll', updateEdges, { passive: true });

    // Re-evaluate on resize — visible width changes which edge we're at.
    const ro = new ResizeObserver(updateEdges);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', updateEdges);
      ro.disconnect();
    };
  }, [updateEdges, items.length]);

  const scrollBy = useCallback((direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8 * direction;
    el.scrollBy({ left: amount, behavior: 'smooth' });
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="relative w-full">
      {/* Header */}
      <div className="flex items-end justify-between gap-4 px-4 md:px-6 lg:px-8">
        <div className="min-w-0">
          <h2 className="font-editorial text-3xl leading-tight text-foreground md:text-4xl">
            {title}
          </h2>
          {sublabel && (
            <p className="mt-1 text-sm italic text-muted-foreground md:text-base">
              {sublabel}
            </p>
          )}
        </div>

        {/* Chevron controls */}
        <div className="flex shrink-0 items-center gap-2">
          <ArrowButton
            aria-label="Scroll left"
            disabled={atStart}
            onClick={() => scrollBy(-1)}
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </ArrowButton>
          <ArrowButton
            aria-label="Scroll right"
            disabled={atEnd}
            onClick={() => scrollBy(1)}
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </ArrowButton>
        </div>
      </div>

      {/* Scroller + edge fade masks */}
      <div className="relative mt-6">
        {/* Left fade */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-background to-transparent transition-opacity duration-300 md:w-16',
            atStart ? 'opacity-0' : 'opacity-100',
          )}
        />
        {/* Right fade */}
        <div
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-background to-transparent transition-opacity duration-300 md:w-16',
            atEnd ? 'opacity-0' : 'opacity-100',
          )}
        />

        <div
          ref={scrollerRef}
          className={cn(
            'flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-2 md:gap-5 md:px-6 lg:px-8',
            // Hide scrollbar across engines while keeping native scrolling.
            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
          )}
        >
          {items.map((item, i) => (
            <div
              key={`${item.href}-${i}`}
              className="w-[44vw] shrink-0 snap-start sm:w-[30vw] md:w-[220px] lg:w-[200px]"
            >
              <MangaCard {...item} index={i} variant="grid" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ArrowButton({
  children,
  onClick,
  disabled,
  ...props
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  'aria-label': string;
}) {
  return (
    <motion.button
      type="button"
      whileTap={disabled ? undefined : { scale: 0.94 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-background/70 text-foreground/80 backdrop-blur-md transition-all duration-300',
        'hover:text-foreground hover:bg-muted hover:border-border',
        disabled && 'pointer-events-none opacity-30',
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
