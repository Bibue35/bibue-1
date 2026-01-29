// Jikan API (MyAnimeList) and AniList API integration
const JIKAN_BASE = "https://api.jikan.moe/v4";

export interface Anime {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: { large_image_url: string; image_url: string };
    webp: { large_image_url: string; image_url: string };
  };
  trailer?: { youtube_id?: string; url?: string };
  synopsis?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  episodes?: number;
  status?: string;
  aired?: { from: string; to: string; string: string };
  duration?: string;
  rating?: string;
  source?: string;
  genres?: Array<{ mal_id: number; name: string }>;
  studios?: Array<{ mal_id: number; name: string }>;
  year?: number;
  season?: string;
}

export interface Manga {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: { large_image_url: string; image_url: string };
    webp: { large_image_url: string; image_url: string };
  };
  synopsis?: string;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  chapters?: number;
  volumes?: number;
  status?: string;
  published?: { from: string; to: string; string: string };
  genres?: Array<{ mal_id: number; name: string }>;
  authors?: Array<{ mal_id: number; name: string }>;
  type?: string;
}

export interface NewsItem {
  mal_id: number;
  url: string;
  title: string;
  date: string;
  author_username: string;
  images?: { jpg: { image_url: string } };
  excerpt: string;
}

// Rate limiting helper
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 400; // Jikan rate limit

async function rateLimitedFetch(url: string) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

// Anime endpoints
export async function getTopAnime(page = 1, limit = 25, filter?: 'airing' | 'upcoming' | 'bypopularity' | 'favorite') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filter) params.append('filter', filter);
  const data = await rateLimitedFetch(`${JIKAN_BASE}/top/anime?${params}`);
  return data.data as Anime[];
}

export async function getSeasonalAnime(year?: number, season?: string) {
  const currentDate = new Date();
  const y = year || currentDate.getFullYear();
  const s = season || getCurrentSeason();
  const data = await rateLimitedFetch(`${JIKAN_BASE}/seasons/${y}/${s}`);
  return data.data as Anime[];
}

export async function getAnimeById(id: number) {
  const data = await rateLimitedFetch(`${JIKAN_BASE}/anime/${id}/full`);
  return data.data as Anime;
}

export async function searchAnime(query: string, page = 1, limit = 25) {
  const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
  const data = await rateLimitedFetch(`${JIKAN_BASE}/anime?${params}`);
  return data.data as Anime[];
}

export async function getAnimeRecommendations(id: number) {
  const data = await rateLimitedFetch(`${JIKAN_BASE}/anime/${id}/recommendations`);
  return data.data;
}

// Manga endpoints
export async function getTopManga(page = 1, limit = 25, filter?: 'manga' | 'novels' | 'lightnovels' | 'oneshots' | 'doujin' | 'manhwa' | 'manhua') {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filter) params.append('type', filter);
  const data = await rateLimitedFetch(`${JIKAN_BASE}/top/manga?${params}`);
  return data.data as Manga[];
}

export async function getMangaById(id: number) {
  const data = await rateLimitedFetch(`${JIKAN_BASE}/manga/${id}/full`);
  return data.data as Manga;
}

export async function searchManga(query: string, page = 1, limit = 25) {
  const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
  const data = await rateLimitedFetch(`${JIKAN_BASE}/manga?${params}`);
  return data.data as Manga[];
}

// News
export async function getAnimeNews() {
  const data = await rateLimitedFetch(`${JIKAN_BASE}/anime/1/news`); // Get from a popular anime
  return data.data as NewsItem[];
}

// Schedule
export async function getSchedule(day?: string) {
  const url = day ? `${JIKAN_BASE}/schedules?filter=${day}` : `${JIKAN_BASE}/schedules`;
  const data = await rateLimitedFetch(url);
  return data.data as Anime[];
}

// Helpers
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return 'winter';
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  return 'fall';
}

export function formatScore(score?: number): string {
  return score ? score.toFixed(1) : 'N/A';
}

export function formatNumber(num?: number): string {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}
