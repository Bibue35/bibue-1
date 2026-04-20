import type { Metadata } from 'next';
import Link from 'next/link';

import Nav from '@/components/next/Nav';
import HeroSection from '@/components/next/HeroSection';
import MangaCarousel from '@/components/next/MangaCarousel';
import { createClient } from '@/lib/supabase/server';
import { cn } from '@/lib/utils';

import FadeInSection from './_home/FadeInSection';

export const metadata: Metadata = {
  title: 'Bibue — Manga, Manhwa & Manhua',
  description:
    'Discover your next favorite manga. Creator-first platform with 67% revenue to creators.',
};

// ---------------------------------------------------------------------------
// Placeholder data
// ---------------------------------------------------------------------------
// Real titles so designers can eyeball proportions, but all cover art is
// served from picsum.photos so we never accidentally ship copyrighted images
// to the staging deploy. Swap for AniList URLs once the fetch hooks land.

type MangaItem = {
  title: string;
  author: string;
  coverUrl: string;
  coverColor: string;
  score: number;
  chapters: number;
  genre: string;
  year: number;
  href: string;
};

const slugify = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const placeholderCover = (title: string) =>
  `https://picsum.photos/seed/${slugify(title)}/400/600`;

const PLACEHOLDER_MANGA: MangaItem[] = [
  { title: 'Berserk',           author: 'Kentaro Miura',     coverColor: '#1a0f0a', score: 9.8, chapters: 374, genre: 'Fantasy',       year: 1989 },
  { title: 'Vagabond',          author: 'Takehiko Inoue',    coverColor: '#1f1a14', score: 9.3, chapters: 327, genre: 'Drama',         year: 1998 },
  { title: 'Monster',           author: 'Naoki Urasawa',     coverColor: '#12131a', score: 9.5, chapters: 162, genre: 'Psychological', year: 1994 },
  { title: 'Pluto',             author: 'Naoki Urasawa',     coverColor: '#0e1620', score: 9.1, chapters:  65, genre: 'Sci-Fi',        year: 2003 },
  { title: 'Vinland Saga',      author: 'Makoto Yukimura',   coverColor: '#172019', score: 9.2, chapters: 210, genre: 'Drama',         year: 2005 },
  { title: 'Chainsaw Man',      author: 'Tatsuki Fujimoto',  coverColor: '#1a0d0d', score: 8.9, chapters: 150, genre: 'Action',        year: 2018 },
  { title: 'Witch Hat Atelier', author: 'Kamome Shirahama',  coverColor: '#1c1426', score: 9.0, chapters:  80, genre: 'Fantasy',       year: 2016 },
  { title: 'Goodnight Punpun',  author: 'Inio Asano',        coverColor: '#0d0d0d', score: 9.2, chapters: 147, genre: 'Psychological', year: 2007 },
  { title: '20th Century Boys', author: 'Naoki Urasawa',     coverColor: '#181510', score: 9.4, chapters: 249, genre: 'Drama',         year: 1999 },
  { title: 'Dorohedoro',        author: 'Q Hayashida',       coverColor: '#1a1612', score: 8.8, chapters: 167, genre: 'Horror',        year: 2000 },
  { title: 'BLAME!',            author: 'Tsutomu Nihei',     coverColor: '#0a0e14', score: 8.7, chapters:  65, genre: 'Sci-Fi',        year: 1997 },
  { title: 'Akira',             author: 'Katsuhiro Otomo',   coverColor: '#1a0a0a', score: 9.3, chapters: 120, genre: 'Sci-Fi',        year: 1988 },
].map((m) => ({
  ...m,
  coverUrl: placeholderCover(m.title),
  href: `/manga/${slugify(m.title)}`,
}));

// Different visual permutations per shelf so the page feels curated rather
// than a copy-paste of the same row. Each helper always returns 12 items so
// MangaCarousel gets a stable length regardless of which shelf is rendering.
const rotate = <T,>(arr: T[], n: number): T[] => {
  const len = arr.length;
  const offset = ((n % len) + len) % len;
  return [...arr.slice(offset), ...arr.slice(0, offset)];
};

const TRENDING = PLACEHOLDER_MANGA;
const TOP_RATED = [...PLACEHOLDER_MANGA].sort((a, b) => b.score - a.score);
const RECENTLY_UPDATED = rotate(PLACEHOLDER_MANGA, 3);
const CLASSICS = [...PLACEHOLDER_MANGA].sort((a, b) => a.year - b.year); // oldest first


// ---------------------------------------------------------------------------
// Page (Server Component)
// ---------------------------------------------------------------------------
export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Profile lookup (display_name) intentionally deferred — the profiles table
  // will be wired up once the data hooks ship. Until then `display_name` is
  // null and Nav falls back to the email.
  const navUser = user
    ? { email: user.email ?? '', display_name: null as string | null }
    : null;

  return (
    <div className="relative min-h-screen bg-background text-foreground antialiased">
      <Nav user={navUser} />

      <main>
        <HeroSection />

        <FadeInSection className="py-12 sm:py-16">
          <MangaCarousel title="Trending this week" items={TRENDING} />
        </FadeInSection>

        <FadeInSection className="py-12 sm:py-16">
          <MangaCarousel title="Top-rated manga" items={TOP_RATED} />
        </FadeInSection>

        <FadeInSection className="py-12 sm:py-16">
          <MangaCarousel title="Recently updated" items={RECENTLY_UPDATED} />
        </FadeInSection>

        <FadeInSection className="py-12 sm:py-16">
          <MangaCarousel title="All-time classics" items={CLASSICS} />
        </FadeInSection>
      </main>

      <FadeInSection>
        <Footer />
      </FadeInSection>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Footer (inline — not important enough to be its own file yet)
// ---------------------------------------------------------------------------
const FOOTER_LINKS: { label: string; href: string }[] = [
  { label: 'Pricing',  href: '/pricing' },
  { label: 'Terms',    href: '/terms' },
  { label: 'Privacy',  href: '/privacy' },
  { label: 'Contact',  href: '/contact' },
];

function Footer() {
  return (
    <footer
      className={cn(
        'mt-16 border-t border-border/60',
        'px-6 py-16 sm:px-10 sm:py-20',
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 text-center">
        <p className="font-serif text-base text-foreground/80 sm:text-lg">
          © 2026 Bibue Press · Read the story, not the algorithm
        </p>

        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <p className="text-xs tracking-wide text-muted-foreground/70">
          Made with care
        </p>
      </div>
    </footer>
  );
}
