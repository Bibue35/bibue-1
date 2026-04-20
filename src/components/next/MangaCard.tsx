'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MangaCardProps {
  title: string;
  author?: string | null;
  coverUrl: string;
  coverColor?: string | null;
  score?: number | null;
  chapters?: number | null;
  genre?: string | null;
  year?: number | null;
  href: string;
  index?: number;
  variant?: 'grid' | 'masonry';
}

const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

export default function MangaCard({
  title,
  author,
  coverUrl,
  coverColor,
  score,
  chapters,
  genre,
  year,
  href,
  index = 0,
  variant = 'grid',
}: MangaCardProps) {
  // Cap stagger delay so very large grids don't queue forever.
  const delay = Math.min(index * 0.04, 0.3);
  const isMasonry = variant === 'masonry';
  const hasScore = typeof score === 'number' && score > 0;
  const hasMeta = typeof chapters === 'number' || typeof year === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: EASE }}
      className="group relative w-full"
    >
      <Link
        href={href}
        aria-label={title}
        className="block rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        {/* Cover wrapper */}
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.5, ease: EASE }}
          className={cn(
            'relative overflow-hidden rounded-xl bg-muted shadow-[0_4px_20px_-8px_rgba(0,0,0,0.15)] transition-shadow duration-500 group-hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.35)]',
            isMasonry ? 'h-auto' : 'aspect-[3/4]',
          )}
          style={{
            backgroundColor: coverColor ?? undefined,
          }}
        >
          {isMasonry ? (
            // Masonry: intrinsic-height <img> so column layout can measure naturally.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={coverUrl}
              alt={title}
              loading="lazy"
              className="w-full h-auto object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
            />
          ) : (
            <Image
              src={coverUrl}
              alt={title}
              fill
              sizes="(max-width:768px) 50vw, (max-width:1280px) 25vw, 200px"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:scale-[1.03]"
            />
          )}

          {/* Bottom gradient — revealed on hover so overlaid chip stays legible. */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Score badge */}
          {hasScore && (
            <div className="absolute top-2 right-2 flex items-center gap-1 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-md">
              <Star className="w-3 h-3 fill-primary text-primary" strokeWidth={1.75} />
              <span>{score!.toFixed(1)}</span>
            </div>
          )}

          {/* Genre chip overlaid on hover */}
          {genre && (
            <div className="pointer-events-none absolute left-2 bottom-2 translate-y-1 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] group-hover:translate-y-0 group-hover:opacity-100">
              <span className="inline-flex items-center rounded-full bg-primary/90 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary-foreground">
                {genre}
              </span>
            </div>
          )}
        </motion.div>

        {/* Text block */}
        <div className="mt-3 px-0.5">
          <h3 className="font-editorial text-sm leading-snug text-foreground line-clamp-2 transition-colors duration-300 group-hover:text-primary md:text-base">
            {title}
          </h3>

          {author && (
            <p className="mt-0.5 text-xs italic text-muted-foreground line-clamp-1">
              {author}
            </p>
          )}

          {hasMeta && (
            <p className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground/80">
              {typeof chapters === 'number' && `${chapters} ch`}
              {typeof chapters === 'number' && typeof year === 'number' && (
                <span className="mx-1.5 opacity-60">·</span>
              )}
              {typeof year === 'number' && year}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
