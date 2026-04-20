import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: {
    // keep imports consistent with vite alias @/*
  },
  turbopack: {
    // Silence lockfile warning in monorepo-like setup
    root: __dirname,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 's4.anilist.co' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: 'uploads.mangadex.org' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'media.kitsu.app' },
      { protocol: 'https', hostname: '**.ytimg.com' },
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        ],
      },
    ];
  },
};

export default config;
