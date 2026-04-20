'use client';

import { useRef } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import { cn } from '@/lib/utils';

const HEADLINE = 'Read the next chapter';
const SUBHEAD =
  'A quiet home for manga, manhwa, and manhua. Editorial picks, curated shelves, and the stories you will remember.';

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.15,
    },
  },
};

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.55,
    },
  },
};

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const reducedMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Parallax: heading floats upward, glow dims as user scrolls
  const headingY = useTransform(scrollYProgress, [0, 1], ['0%', '-22%']);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const glowScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const words = HEADLINE.split(' ');

  return (
    <section
      ref={sectionRef}
      aria-label="Bibue hero"
      className="relative isolate flex min-h-[85vh] w-full items-center justify-center overflow-hidden bg-background"
    >
      {/* Ambient glow — scroll-driven fade */}
      <motion.div
        aria-hidden="true"
        style={reducedMotion ? undefined : { opacity: glowOpacity, scale: glowScale }}
        className="ambient-glow"
      />

      {/* Faint manga-panel decoration (pure CSS) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
        {/* Stacked card silhouettes, upper-right */}
        <div className="absolute right-[6%] top-[14%] hidden md:block">
          <div className="relative h-64 w-44 rotate-6 rounded-lg border border-border/60 bg-muted/40 shadow-sm" />
          <div className="absolute -left-8 -top-4 h-64 w-44 -rotate-3 rounded-lg border border-border/50 bg-muted/25" />
          <div className="absolute -left-16 -top-8 h-64 w-44 -rotate-12 rounded-lg border border-border/40 bg-muted/15" />
        </div>

        {/* Lower-left diagonal gutter — evokes a manga panel break */}
        <div className="absolute bottom-[12%] left-[-4%] hidden h-px w-[38%] rotate-[-8deg] bg-gradient-to-r from-transparent via-border to-transparent md:block" />

        {/* Soft gold bloom, lower-right */}
        <div className="absolute bottom-[-10%] right-[-10%] h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(circle_at_center,hsl(var(--primary)/0.18),transparent_65%)] blur-2xl" />

        {/* Dotted tone — cheap halftone feel */}
        <div
          className="absolute inset-0 opacity-[0.05] mix-blend-multiply"
          style={{
            backgroundImage:
              'radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-6 text-center sm:px-10">
        <motion.div
          style={reducedMotion ? undefined : { y: headingY }}
          className="w-full"
        >
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="mb-5 text-[11px] font-medium uppercase tracking-[0.35em] text-muted-foreground sm:text-xs"
          >
            Bibue — the quiet reader
          </motion.p>

          <motion.h1
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="font-editorial text-[clamp(2.75rem,8.5vw,7rem)] font-semibold leading-[0.95] tracking-tight text-foreground"
          >
            {words.map((word, i) => (
              <motion.span
                key={`${word}-${i}`}
                variants={wordVariants}
                className="mr-[0.22em] inline-block will-change-transform"
              >
                {word}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base"
          >
            {SUBHEAD}
          </motion.p>

          <motion.div
            variants={fadeUpVariants}
            initial="hidden"
            animate="show"
            className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
          >
            <a
              href="/catalog"
              className={cn(
                'group inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-3',
                'text-sm font-semibold tracking-wide text-primary-foreground',
                'shadow-sm transition-all duration-300 ease-out',
                'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/40',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              Start reading
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
              >
                →
              </span>
            </a>

            <a
              href="/browse"
              className={cn(
                'group relative inline-flex items-center justify-center overflow-hidden rounded-full px-7 py-3',
                'border border-border text-sm font-semibold tracking-wide text-foreground',
                'transition-colors duration-300 ease-out hover:text-primary-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-0 -z-10 origin-left scale-x-0 bg-foreground',
                  'transition-transform duration-[400ms] ease-out group-hover:scale-x-100',
                )}
              />
              Browse catalog
            </a>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={reducedMotion ? undefined : { opacity: glowOpacity }}
        className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-muted-foreground"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <motion.span
          animate={
            reducedMotion
              ? undefined
              : {
                  y: [0, 6, 0],
                  opacity: [0.4, 1, 0.4],
                }
          }
          transition={{
            duration: 1.8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="block"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.span>
      </motion.div>
    </section>
  );
}
