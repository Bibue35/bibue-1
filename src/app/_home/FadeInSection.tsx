'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type FadeInSectionProps = Omit<HTMLMotionProps<'section'>, 'children'> & {
  children: ReactNode;
  className?: string;
  /**
   * Delay before the section animates in (seconds). Useful when stacking
   * multiple sections that should cascade slightly rather than fire at once.
   */
  delay?: number;
};

/**
 * Client-only wrapper that fades a server-rendered section into view with a
 * small y-offset as it enters the viewport. Animation is one-shot per scroll
 * session (`once: true`) to avoid jitter on scroll-back.
 *
 * Easing `[0.22, 1, 0.36, 1]` is the "expo-out" curve used across the hero —
 * it gives the motion a cinematic settle rather than a linear glide, which
 * feels closer to Apple's product pages than stock framer defaults.
 */
export default function FadeInSection({
  children,
  className,
  delay = 0,
  ...rest
}: FadeInSectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay }}
      className={cn(className)}
      {...rest}
    >
      {children}
    </motion.section>
  );
}
