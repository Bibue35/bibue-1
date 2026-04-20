'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Cinematic hero — ported from v1 /src/components/CinematicHero.tsx.
 * Full-bleed background crossfade between 6 featured titles, auto-cycling every 8s.
 * Category switcher (Manga · Manhwa · Manhua) driven by countryOfOrigin.
 * Real manga title is the display heading (not a marketing tagline).
 *
 * Data-layer-agnostic: consumer passes items as props. Migration wiring will
 * fetch from AniList via RSC in Phase 2 and pass into here.
 */

export interface HeroItem {
  id: string;
  title: string;
  href: string;
  coverUrl: string;
  synopsis?: string | null;
  score?: number | null;
  viewCount?: number | null;
  genres?: string[] | null;
  status?: string | null;
  countryOfOrigin?: 'JP' | 'KR' | 'CN' | null;
}

interface Props {
  items: HeroItem[];
}

type MediaFilter = 'manga' | 'manhwa' | 'manhua';

const COUNTRY_TO_FILTER: Record<NonNullable<HeroItem['countryOfOrigin']>, MediaFilter> = {
  JP: 'manga',
  KR: 'manhwa',
  CN: 'manhua',
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim();
}

function formatScore(score: number): string {
  return score.toFixed(1);
}

function formatViewCount(n: number | null | undefined): string {
  if (!n) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export default function HeroSection({ items }: Props) {
  const reduced = useReducedMotion();
  const [activeFilter, setActiveFilter] = useState<MediaFilter>('manga');
  const [idx, setIdx] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Which filters are actually represented in the data
  const availableFilters = useMemo<MediaFilter[]>(() => {
    const s = new Set<MediaFilter>();
    for (const it of items) {
      const f = it.countryOfOrigin ? COUNTRY_TO_FILTER[it.countryOfOrigin] : 'manga';
      s.add(f);
    }
    const order: MediaFilter[] = ['manga', 'manhwa', 'manhua'];
    return order.filter((f) => s.has(f));
  }, [items]);

  const filtered = useMemo(() => {
    return items
      .filter((it) => {
        const f = it.countryOfOrigin ? COUNTRY_TO_FILTER[it.countryOfOrigin] : 'manga';
        return f === activeFilter;
      })
      .slice(0, 6);
  }, [items, activeFilter]);

  // Reset index when filter changes AFTER fade-out finishes
  const handleFilterChange = useCallback(
    (filter: MediaFilter) => {
      if (filter === activeFilter) return;
      setTransitioning(true);
      window.setTimeout(() => {
        setActiveFilter(filter);
        setIdx(0);
        setTransitioning(false);
      }, 300);
    },
    [activeFilter],
  );

  // Auto-cycle every 8s
  useEffect(() => {
    if (reduced) return; // honor user preference
    if (filtered.length <= 1) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % filtered.length), 8000);
    return () => clearInterval(t);
  }, [filtered.length, reduced]);

  // Keyboard arrows
  useEffect(() => {
    if (filtered.length <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') setIdx((p) => (p - 1 + filtered.length) % filtered.length);
      if (e.key === 'ArrowRight') setIdx((p) => (p + 1) % filtered.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [filtered.length]);

  if (filtered.length === 0) {
    return <section aria-label="Featured manga" className="min-h-[90vh] sm:min-h-[92vh]" />;
  }

  const current = filtered[idx];
  const nextIdx = (idx + 1) % filtered.length;

  return (
    <section
      ref={sectionRef}
      aria-label="Featured manga"
      className="relative min-h-[90vh] sm:min-h-[92vh] flex flex-col overflow-hidden"
    >
      {/* Background — crossfade between current and next, everything else hidden */}
      <div className="absolute inset-0 z-0">
        {filtered.map((item, i) => {
          if (i !== idx && i !== nextIdx) return null;
          const isActive = i === idx && !transitioning;
          return (
            <Image
              key={item.id}
              src={item.coverUrl}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              priority={i === idx}
              className={cn(
                'absolute inset-0 object-cover transition-opacity duration-[1500ms] ease-in-out',
                isActive ? 'opacity-100' : 'opacity-0',
              )}
            />
          );
        })}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/60" />
      </div>

      {/* SR-only h1 for SEO */}
      <h1 className="sr-only">Discover Peak Manga, Manhwa & Manhua on Bibue</h1>

      {/* Content */}
      <div
        className={cn(
          'relative z-10 flex-1 flex items-end pb-16 sm:pb-24 pt-32 sm:pt-40 transition-opacity duration-300',
          transitioning ? 'opacity-0' : 'opacity-100',
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category switcher */}
          {availableFilters.length > 1 && (
            <div className="flex items-center gap-1 mb-4 sm:mb-6">
              {availableFilters.map((f, i) => {
                const label = f === 'manga' ? 'Manga' : f === 'manhwa' ? 'Manhwa' : 'Manhua';
                return (
                  <span key={f} className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleFilterChange(f)}
                      className={cn(
                        'text-[11px] sm:text-xs tracking-[0.3em] uppercase font-medium transition-all duration-300',
                        activeFilter === f
                          ? 'text-foreground'
                          : 'text-muted-foreground hover:text-foreground/70',
                      )}
                    >
                      {label}
                    </button>
                    {i < availableFilters.length - 1 && (
                      <span className="text-[11px] sm:text-xs text-muted-foreground/40 mx-1">·</span>
                    )}
                  </span>
                );
              })}
            </div>
          )}

          {/* Eyebrow */}
          <p className="font-editorial text-base sm:text-lg md:text-xl text-muted-foreground/80 mb-2">
            Discover
          </p>

          {/* Giant title */}
          <h2 className="font-editorial font-bold leading-[0.92] tracking-tight max-w-4xl text-[clamp(2.5rem,8vw,7rem)]">
            {current.title}
          </h2>

          {/* Synopsis */}
          {current.synopsis && (
            <p className="mt-6 sm:mt-8 text-sm sm:text-base text-muted-foreground/70 leading-relaxed max-w-lg line-clamp-2">
              {stripHtml(current.synopsis)}
            </p>
          )}

          {/* Metadata row */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
            {current.score != null && (
              <span className="font-medium text-foreground">{formatScore(current.score)}</span>
            )}
            {current.viewCount != null && (
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" strokeWidth={1.75} />
                {formatViewCount(current.viewCount)}
              </span>
            )}
            {current.genres?.slice(0, 3).map((g) => (
              <span key={g}>{g}</span>
            ))}
            {current.status && <span>{current.status}</span>}
          </div>

          {/* CTA — text link with growing underline */}
          <div className="mt-8 sm:mt-10">
            <Link
              href={current.href}
              className="group inline-flex items-center gap-3 text-sm sm:text-base font-medium tracking-wide uppercase text-foreground hover:text-primary transition-colors duration-300"
            >
              Start Reading
              <span className="inline-block w-8 h-px bg-foreground transition-all duration-300 group-hover:w-12 group-hover:bg-primary" />
            </Link>
          </div>

          {/* Progress indicators */}
          {filtered.length > 1 && (
            <div className="mt-12 sm:mt-16 flex items-center gap-2">
              {filtered.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdx(i)}
                  aria-label={`Go to slide ${i + 1}`}
                  className={cn(
                    'transition-all duration-500',
                    i === idx
                      ? 'w-8 h-px bg-foreground'
                      : 'w-3 h-px bg-foreground/20 hover:bg-foreground/50',
                  )}
                />
              ))}
              <span className="ml-3 text-[10px] text-muted-foreground tabular-nums">
                {String(idx + 1).padStart(2, '0')} / {String(filtered.length).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
