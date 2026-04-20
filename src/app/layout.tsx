import type { Metadata } from 'next';
import { Cinzel, Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cinzel',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bibue.net'),
  title: {
    default: 'Bibue — Manga, Manhwa & Manhua',
    template: '%s · Bibue',
  },
  description:
    'Discover your next favorite manga, manhwa, and manhua. Creator-first platform with 67% revenue to creators.',
  openGraph: {
    siteName: 'Bibue',
    type: 'website',
    locale: 'en_US',
  },
  twitter: { card: 'summary_large_image' },
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
