// AniList GraphQL API integration — routed through edge function proxy
const ANILIST_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/anilist-proxy`;
const ANILIST_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Language type matching the LanguageContext
export type SupportedLanguage = "en" | "ja" | "es" | "fr" | "de" | "pt" | "ko" | "zh";

// Helper to get the appropriate title based on language preference
function getTitleForLanguage(
  title: { romaji?: string; english?: string; native?: string },
  language: SupportedLanguage = "en"
): string {
  // For Japanese, prefer native title
  if (language === "ja") {
    return title.native || title.romaji || title.english || "Unknown";
  }
  // For English, prefer English title if available
  if (language === "en") {
    return title.english || title.romaji || title.native || "Unknown";
  }
  // For all other languages, prefer Romaji (more recognizable for anime fans)
  return title.romaji || title.english || title.native || "Unknown";
}

export interface Anime {
  /** @description Primary ID - This is the AniList ID used for all API calls */
  anilist_id: number;
  /** @deprecated Use anilist_id instead. Kept for backward compatibility with existing code. */
  mal_id: number;
  /** The real MyAnimeList ID, used for Jikan API calls */
  idMal?: number;
  title: string;
  title_romaji?: string;
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
  nextAiringEpisode?: { airingAt: number; episode: number };
  streamingEpisodes?: Array<{ title?: string; thumbnail?: string; url?: string; site?: string }>;
}

export interface Manga {
  /** @description Primary ID - This is the AniList ID used for all API calls */
  anilist_id: number;
  /** @deprecated Use anilist_id instead. Kept for backward compatibility with existing code. */
  mal_id: number;
  idMal?: number;
  title: string;
  title_romaji?: string;
  title_english?: string;
  title_japanese?: string;
  images: {
    jpg: { large_image_url: string; image_url: string };
    webp: { large_image_url: string; image_url: string };
  };
  bannerImage?: string;
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
  themes?: Array<{ mal_id: number; name: string }>;
  authors?: Array<{ mal_id: number; name: string }>;
  type?: string;
  source?: string;
  countryOfOrigin?: string;
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

// Rate limit error class
class RateLimitError extends Error {
  retryAfter: number;
  constructor(retryAfter: number) {
    super(`Rate limit exceeded. Please try again in ${retryAfter} seconds.`);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// AniList GraphQL query helper — routes through edge function proxy
async function anilistQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const MAX_RETRIES = 3;
  const BASE_DELAY = 1000;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(ANILIST_PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          apikey: ANILIST_ANON_KEY,
        },
        body: JSON.stringify({ query, variables }),
      });

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10);
        console.warn(`[API] Rate limit hit. Retry after ${retryAfter}s`);
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, retryAfter * 1000));
          continue;
        }
        throw new RateLimitError(retryAfter);
      }

      if (!response.ok) {
        console.error(`[API] Proxy error: ${response.status}`);
        if (attempt < MAX_RETRIES && response.status >= 500) {
          await new Promise(r => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`Failed to fetch data. Please try again later.`);
      }

      const json = await response.json();
      if (json.errors) {
        console.error('[API] AniList query error:', json.errors[0]?.message);
        throw new Error('Failed to fetch data. Please try again later.');
      }
      return json.data;
    } catch (error) {
      if (attempt < MAX_RETRIES && !(error instanceof RateLimitError) && (error instanceof TypeError || (error as Error).message === 'Load failed')) {
        console.warn(`[API] Network error, retrying (${attempt + 1}/${MAX_RETRIES})...`);
        await new Promise(r => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to fetch data after multiple retries.');
}

// Convert AniList media to our Anime format
function toAnime(media: AniListMedia, language: SupportedLanguage = "en"): Anime {
  // Use large/extraLarge for hero/carousel, medium for card thumbnails
  const largeImageUrl = media.coverImage.extraLarge || media.coverImage.large || media.coverImage.medium || "";
  const cardImageUrl = media.coverImage.large || media.coverImage.extraLarge || media.coverImage.medium || largeImageUrl;
  
  // IMPORTANT: Always use AniList ID for consistency across the app
  // This ensures the ID passed to cards matches the ID used for detail fetches
  return {
    anilist_id: media.id, // Primary AniList ID for all API calls
    mal_id: media.id, // Keep for backward compatibility (also AniList ID)
    idMal: media.idMal || undefined,
    title: getTitleForLanguage(media.title, language),
    title_romaji: media.title.romaji || undefined,
    title_english: media.title.english || undefined,
    title_japanese: media.title.native || undefined,
    images: {
      jpg: { large_image_url: largeImageUrl, image_url: cardImageUrl },
      webp: { large_image_url: largeImageUrl, image_url: cardImageUrl },
    },
    trailer: media.trailer ? { youtube_id: media.trailer.id, url: media.trailer.site === "youtube" ? `https://youtube.com/watch?v=${media.trailer.id}` : undefined } : undefined,
    synopsis: media.description?.replace(/<[^>]*>/g, "") || undefined,
    score: media.averageScore ? media.averageScore / 10 : undefined,
    scored_by: media.stats?.scoreDistribution?.reduce((sum, s) => sum + s.amount, 0) || undefined,
    rank: media.rankings?.find(r => r.type === "RATED" && r.allTime)?.rank || undefined,
    popularity: media.popularity || undefined,
    members: media.popularity || undefined,
    favorites: media.favourites || undefined,
    episodes: media.episodes || undefined,
    status: media.status || undefined,
    aired: media.startDate ? {
      from: `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, "0")}-${String(media.startDate.day || 1).padStart(2, "0")}`,
      to: media.endDate?.year ? `${media.endDate.year}-${String(media.endDate.month || 1).padStart(2, "0")}-${String(media.endDate.day || 1).padStart(2, "0")}` : "",
      string: media.startDate.year ? `${media.startDate.year}` : "",
    } : undefined,
    duration: media.duration ? `${media.duration} min` : undefined,
    source: media.source || undefined,
    genres: media.genres?.map((g, i) => ({ mal_id: i, name: g })) || [],
    studios: media.studios?.nodes?.map(s => ({ mal_id: s.id, name: s.name })) || [],
    year: media.seasonYear || media.startDate?.year || undefined,
    season: media.season?.toLowerCase() || undefined,
    nextAiringEpisode: media.nextAiringEpisode || undefined,
    streamingEpisodes: media.streamingEpisodes || undefined,
  };
}

// Convert AniList media to our Manga format
function toManga(media: AniListMedia, language: SupportedLanguage = "en"): Manga {
  // Use large/extraLarge for hero/detail, medium for card thumbnails
  const largeImageUrl = media.coverImage.extraLarge || media.coverImage.large || media.coverImage.medium || "";
  const cardImageUrl = media.coverImage.large || media.coverImage.extraLarge || media.coverImage.medium || largeImageUrl;
  
  // Separate genres from tags (tags with high rank act as themes/demographics)
  const coreGenres = media.genres?.map((g, i) => ({ mal_id: i, name: g })) || [];
  const tagThemes = media.tags?.filter(t => t.rank && t.rank >= 60).map((t, i) => ({ mal_id: 1000 + i, name: t.name })) || [];
  
  return {
    anilist_id: media.id,
    mal_id: media.id,
    idMal: media.idMal || undefined,
    title: getTitleForLanguage(media.title, language),
    title_romaji: media.title.romaji || undefined,
    title_english: media.title.english || undefined,
    title_japanese: media.title.native || undefined,
    images: {
      jpg: { large_image_url: largeImageUrl, image_url: cardImageUrl },
      webp: { large_image_url: largeImageUrl, image_url: cardImageUrl },
    },
    bannerImage: media.bannerImage || undefined,
    synopsis: media.description?.replace(/<[^>]*>/g, "") || undefined,
    score: media.averageScore ? media.averageScore / 10 : undefined,
    scored_by: media.stats?.scoreDistribution?.reduce((sum, s) => sum + s.amount, 0) || undefined,
    rank: media.rankings?.find(r => r.type === "RATED" && r.allTime)?.rank || undefined,
    popularity: media.popularity || undefined,
    members: media.popularity || undefined,
    favorites: media.favourites || undefined,
    chapters: media.chapters || undefined,
    volumes: media.volumes || undefined,
    status: media.status || undefined,
    published: media.startDate ? {
      from: `${media.startDate.year}-${String(media.startDate.month || 1).padStart(2, "0")}-${String(media.startDate.day || 1).padStart(2, "0")}`,
      to: media.endDate?.year ? `${media.endDate.year}-${String(media.endDate.month || 1).padStart(2, "0")}-${String(media.endDate.day || 1).padStart(2, "0")}` : "",
      string: media.startDate.year ? `${media.startDate.year}` : "",
    } : undefined,
    genres: [...coreGenres, ...tagThemes],
    themes: tagThemes,
    authors: media.staff?.nodes?.filter(s => s.primaryOccupations?.includes("Mangaka"))?.map(s => ({ mal_id: s.id, name: s.name.full })) || [],
    type: media.format || undefined,
    source: media.source || undefined,
    countryOfOrigin: media.countryOfOrigin || undefined,
  };
}

// AniList types
interface AniListMedia {
  id: number;
  idMal?: number;
  title: { romaji?: string; english?: string; native?: string };
  coverImage: { extraLarge?: string; large: string; medium?: string };
  bannerImage?: string;
  description?: string;
  averageScore?: number;
  popularity?: number;
  favourites?: number;
  episodes?: number;
  chapters?: number;
  volumes?: number;
  status?: string;
  season?: string;
  seasonYear?: number;
  format?: string;
  source?: string;
  duration?: number;
  genres?: string[];
  tags?: Array<{ name: string; rank?: number; category?: string }>;
  countryOfOrigin?: string;
  trailer?: { id: string; site: string };
  startDate?: { year?: number; month?: number; day?: number };
  endDate?: { year?: number; month?: number; day?: number };
  studios?: { nodes: Array<{ id: number; name: string }> };
  staff?: { nodes: Array<{ id: number; name: { full: string }; primaryOccupations?: string[] }> };
  rankings?: Array<{ type: string; rank: number; allTime: boolean }>;
  stats?: { scoreDistribution?: Array<{ score: number; amount: number }> };
  recommendations?: { nodes: Array<{ mediaRecommendation: AniListMedia }> };
  nextAiringEpisode?: { airingAt: number; episode: number };
  streamingEpisodes?: Array<{ title?: string; thumbnail?: string; url?: string; site?: string }>;
}

const MEDIA_FRAGMENT = `
  id
  idMal
  title { romaji english native }
  coverImage { extraLarge large medium }
  bannerImage
  description(asHtml: false)
  averageScore
  popularity
  favourites
  episodes
  chapters
  volumes
  status
  season
  seasonYear
  format
  source
  duration
  genres
  tags { name rank category }
  countryOfOrigin
  trailer { id site }
  startDate { year month day }
  endDate { year month day }
  studios(isMain: true) { nodes { id name } }
  staff(perPage: 3) { nodes { id name { full } primaryOccupations } }
  rankings { type rank allTime }
  nextAiringEpisode { airingAt episode }
  streamingEpisodes { title thumbnail url site }
`;

// Anime endpoints
export async function getTopAnime(page = 1, limit = 25, filter?: "airing" | "upcoming" | "bypopularity" | "favorite" | "new" | "completed", language: SupportedLanguage = "en"): Promise<Anime[]> {
  let sort = "POPULARITY_DESC";
  let status: string | undefined;
  let startDateGreater: number | undefined;
  
  if (filter === "airing") {
    status = "RELEASING";
    sort = "POPULARITY_DESC";
  } else if (filter === "upcoming") {
    status = "NOT_YET_RELEASED";
    sort = "POPULARITY_DESC";
  } else if (filter === "bypopularity") {
    sort = "POPULARITY_DESC";
  } else if (filter === "favorite") {
    sort = "FAVOURITES_DESC";
  } else if (filter === "new") {
    sort = "START_DATE_DESC";
    // Last 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    startDateGreater = weekAgo.getFullYear() * 10000 + (weekAgo.getMonth() + 1) * 100 + weekAgo.getDate();
  } else if (filter === "completed") {
    status = "FINISHED";
    sort = "POPULARITY_DESC";
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus, $startDateGreater: FuzzyDateInt) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, startDate_greater: $startDateGreater, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, sort: [sort], status, startDateGreater });
  return data.Page.media.map(m => toAnime(m, language));
}

// Get anime by year range (for classic/older content)
export async function getAnimeByYearRange(
  startYear: number,
  endYear: number,
  page = 1,
  limit = 25,
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "FAVOURITES_DESC" = "SCORE_DESC",
  language: SupportedLanguage = "en"
): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $startYear: FuzzyDateInt, $endYear: FuzzyDateInt) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, startDate_greater: $startYear, startDate_lesser: $endYear, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  // Convert years to FuzzyDateInt format (YYYYMMDD)
  const startDateInt = startYear * 10000 + 101; // Jan 1 of start year
  const endDateInt = endYear * 10000 + 1231; // Dec 31 of end year

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { 
    page, 
    perPage: limit, 
    sort: [sort], 
    startYear: startDateInt,
    endYear: endDateInt
  });
  return data.Page.media.map(m => toAnime(m, language));
}

// Get all-time highest rated anime
export async function getAllTimeTopAnime(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: [SCORE_DESC], status_in: [FINISHED, RELEASING], isAdult: false, averageScore_greater: 70) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit });
  return data.Page.media.map(m => toAnime(m, language));
}

// Get classic anime (pre-2010)
export async function getClassicAnime(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Anime[]> {
  return getAnimeByYearRange(1970, 2009, page, limit, "SCORE_DESC", language);
}

// Get anime by decade
export async function getAnimeByDecade(decade: "70s" | "80s" | "90s" | "2000s" | "2010s", page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Anime[]> {
  const decadeRanges: Record<string, [number, number]> = {
    "70s": [1970, 1979],
    "80s": [1980, 1989],
    "90s": [1990, 1999],
    "2000s": [2000, 2009],
    "2010s": [2010, 2019],
  };
  const [start, end] = decadeRanges[decade];
  return getAnimeByYearRange(start, end, page, limit, "SCORE_DESC", language);
}

// Get recently updated anime (currently airing, sorted by trending to show truly active content)
export async function getRecentlyUpdatedAnime(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Anime[]> {
  const currentYear = new Date().getFullYear();
  const startDateGreater = (currentYear - 2) * 10000; // FuzzyDateInt format: YYYYMMDD
  const query = `
    query ($page: Int, $perPage: Int, $startDate: FuzzyDateInt) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, status: RELEASING, sort: [TRENDING_DESC, POPULARITY_DESC], startDate_greater: $startDate, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, startDate: startDateGreater });
  return data.Page.media.map(m => toAnime(m, language));
}

// Get recently updated manga (currently releasing, sorted by trending to show truly active content)
export async function getRecentlyUpdatedManga(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, status: RELEASING, sort: [TRENDING_DESC, POPULARITY_DESC], isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit });
  return data.Page.media.map(m => toManga(m, language));
}

// Get anime by genre with expanded options
export async function getAnimeByGenre(
  genre: string,
  page = 1,
  limit = 25,
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC",
  language: SupportedLanguage = "en"
): Promise<Anime[]> {
  const query = `
    query ($page: Int, $perPage: Int, $genre: String, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, genre: $genre, sort: $sort, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, genre, sort: [sort] });
  return data.Page.media.map(m => toAnime(m, language));
}

export async function getSeasonalAnime(year?: number, season?: string, language: SupportedLanguage = "en"): Promise<Anime[]> {
  const currentDate = new Date();
  const y = year || currentDate.getFullYear();
  const s = (season || getCurrentSeason()).toUpperCase();

  const query = `
    query ($season: MediaSeason, $seasonYear: Int) {
      Page(page: 1, perPage: 50) {
        media(type: ANIME, season: $season, seasonYear: $seasonYear, sort: [POPULARITY_DESC], isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { season: s, seasonYear: y });
  return data.Page.media.map(m => toAnime(m, language));
}

export async function getAnimeById(id: number, language: SupportedLanguage = "en"): Promise<Anime> {
  // All IDs in this app are AniList IDs - no fallback to MAL ID to prevent mismatches
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
      }
    }
  `;

  const data = await anilistQuery<{ Media: AniListMedia }>(query, { id });
  return toAnime(data.Media, language);
}

export async function searchAnime(searchQuery: string, page = 1, limit = 25, language: SupportedLanguage = "en", sort: "SEARCH_MATCH" | "START_DATE_DESC" | "POPULARITY_DESC" = "START_DATE_DESC"): Promise<Anime[]> {
  const query = `
    query ($search: String, $page: Int, $perPage: Int, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: $sort, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { search: searchQuery, page, perPage: limit, sort: [sort] });
  return data.Page.media.map(m => toAnime(m, language));
}

export async function getAnimeRecommendations(id: number, language: SupportedLanguage = "en"): Promise<Array<{ entry: Anime }>> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        recommendations(page: 1, perPage: 15, sort: [RATING_DESC]) {
          nodes {
            mediaRecommendation {
              ${MEDIA_FRAGMENT}
              isAdult
            }
          }
        }
      }
    }
  `;

  const data = await anilistQuery<{ Media: { recommendations: { nodes: Array<{ mediaRecommendation: AniListMedia & { isAdult?: boolean } }> } } }>(query, { id });
  return data.Media.recommendations.nodes
    .filter(n => n.mediaRecommendation && !n.mediaRecommendation.isAdult)
    .filter(n => !n.mediaRecommendation.genres?.some(g => g.toLowerCase() === 'hentai'))
    .map(n => ({ entry: toAnime(n.mediaRecommendation, language) }));
}

export async function getMangaRecommendations(id: number, language: SupportedLanguage = "en"): Promise<Array<{ entry: Manga }>> {
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        recommendations(page: 1, perPage: 15, sort: [RATING_DESC]) {
          nodes {
            mediaRecommendation {
              ${MEDIA_FRAGMENT}
              isAdult
            }
          }
        }
      }
    }
  `;

  const data = await anilistQuery<{ Media: { recommendations: { nodes: Array<{ mediaRecommendation: AniListMedia & { isAdult?: boolean } }> } } }>(query, { id });
  return data.Media.recommendations.nodes
    .filter(n => n.mediaRecommendation && !n.mediaRecommendation.isAdult)
    .filter(n => !n.mediaRecommendation.genres?.some(g => g.toLowerCase() === 'hentai'))
    .map(n => ({ entry: toManga(n.mediaRecommendation, language) }));
}

// Sort options type
export type SortOption = "popularity" | "score" | "trending" | "newest";

// Manga endpoints
export async function getTopManga(
  page = 1, 
  limit = 25, 
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua",
  sort: SortOption = "popularity",
  language: SupportedLanguage = "en"
): Promise<Manga[]> {
  let format: string | undefined;
  let countryOfOrigin: string | undefined;

  if (filter === "manga") format = "MANGA";
  else if (filter === "novels" || filter === "lightnovels") format = "NOVEL";
  else if (filter === "oneshots") format = "ONE_SHOT";
  else if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  // Map sort option to AniList sort enum
  const sortMap: Record<SortOption, string> = {
    popularity: "POPULARITY_DESC",
    score: "SCORE_DESC",
    trending: "TRENDING_DESC",
    newest: "START_DATE_DESC",
  };
  const sortValue = sortMap[sort];

  const query = `
    query ($page: Int, $perPage: Int, $format: MediaFormat, $countryOfOrigin: CountryCode, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: $sort, format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, format, countryOfOrigin, sort: [sortValue] });
  return data.Page.media.map(m => toManga(m, language));
}

export async function getNewThisWeekManga(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const startDateGreater = weekAgo.getFullYear() * 10000 + (weekAgo.getMonth() + 1) * 100 + weekAgo.getDate();

  const query = `
    query ($page: Int, $perPage: Int, $startDateGreater: FuzzyDateInt) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [START_DATE_DESC], startDate_greater: $startDateGreater, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, startDateGreater });
  return data.Page.media.map(m => toManga(m, language));
}

export async function getCompletedManga(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [POPULARITY_DESC], status: FINISHED, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit });
  return data.Page.media.map(m => toManga(m, language));
}

// Get manga by year range (for classic/older content)
export async function getMangaByYearRange(
  startYear: number,
  endYear: number,
  page = 1,
  limit = 25,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" = "SCORE_DESC",
  language: SupportedLanguage = "en"
): Promise<Manga[]> {
  let countryOfOrigin: string | undefined;
  if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $startYear: FuzzyDateInt, $endYear: FuzzyDateInt, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: $sort, startDate_greater: $startYear, startDate_lesser: $endYear, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const startDateInt = startYear * 10000 + 101;
  const endDateInt = endYear * 10000 + 1231;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { 
    page, 
    perPage: limit, 
    sort: [sort], 
    startYear: startDateInt,
    endYear: endDateInt,
    countryOfOrigin
  });
  return data.Page.media.map(m => toManga(m, language));
}

// Get all-time highest rated manga
export async function getAllTimeTopManga(
  page = 1, 
  limit = 25, 
  filter?: "manga" | "manhwa" | "manhua",
  language: SupportedLanguage = "en"
): Promise<Manga[]> {
  let countryOfOrigin: string | undefined;
  if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($page: Int, $perPage: Int, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [SCORE_DESC], status_in: [FINISHED, RELEASING], countryOfOrigin: $countryOfOrigin, isAdult: false, averageScore_greater: 70) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, countryOfOrigin });
  return data.Page.media.map(m => toManga(m, language));
}

// Get classic manga (pre-2010)
export async function getClassicManga(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  return getMangaByYearRange(1950, 2009, page, limit, undefined, "SCORE_DESC", language);
}

// Get trending manhwa specifically
export async function getTrendingManhwa(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [TRENDING_DESC], countryOfOrigin: KR, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit });
  return data.Page.media.map(m => toManga(m, language));
}

// Get trending manhua specifically
export async function getTrendingManhua(page = 1, limit = 25, language: SupportedLanguage = "en"): Promise<Manga[]> {
  const query = `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [TRENDING_DESC], countryOfOrigin: CN, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit });
  return data.Page.media.map(m => toManga(m, language));
}

// Get manga by genre
export async function getMangaByGenre(
  genre: string,
  page = 1,
  limit = 25,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC",
  language: SupportedLanguage = "en"
): Promise<Manga[]> {
  let countryOfOrigin: string | undefined;
  if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($page: Int, $perPage: Int, $genre: String, $sort: [MediaSort], $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, genre: $genre, sort: $sort, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, genre, sort: [sort], countryOfOrigin });
  return data.Page.media.map(m => toManga(m, language));
}

// ── Niche genre tags (Xianxia, Wuxia, Cultivation, etc.) via AniList tag system ──
// These aren't standard AniList genres but exist as tags
export const NICHE_TAG_GENRES: Record<string, string[]> = {
  "Xianxia": ["Cultivation"],
  "Wuxia": ["Martial Arts"],
  "Cultivation": ["Cultivation"],
  "Martial Arts": ["Martial Arts"],
  "Reincarnation": ["Reincarnation"],
  "Villainess": ["Villainess"],
  "Time Travel": ["Time Skip", "Time Manipulation"],
  "System": ["Leveling"],
  "Regression": ["Time Skip"],
  "Dungeon": ["Dungeon"],
};

// Check if a genre name is a niche tag (not a standard AniList genre)
export function isNicheTagGenre(genreName: string): boolean {
  return genreName in NICHE_TAG_GENRES;
}

// Get manga by AniList tag (for niche genres like Xianxia, Cultivation, etc.)
export async function getMangaByTag(
  tagNames: string[],
  page = 1,
  limit = 25,
  filter?: "manga" | "manhwa" | "manhua",
  sort: "SCORE_DESC" | "POPULARITY_DESC" | "TRENDING_DESC" = "POPULARITY_DESC",
  language: SupportedLanguage = "en"
): Promise<Manga[]> {
  let countryOfOrigin: string | undefined;
  if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($page: Int, $perPage: Int, $tagNames: [String], $sort: [MediaSort], $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, tag_in: $tagNames, sort: $sort, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { 
    page, perPage: limit, tagNames, sort: [sort], countryOfOrigin 
  });
  return data.Page.media.map(m => toManga(m, language));
}

// ── Hybrid merge utilities ──

// Normalize title for comparison
function normalizeTitle(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Deduplicate manga from multiple sources, keeping best metadata
export function deduplicateManga(primary: Manga[], supplement: Manga[]): Manga[] {
  const seen = new Map<string, Manga>();
  const idSeen = new Set<number>();

  // Primary results go first
  for (const m of primary) {
    seen.set(normalizeTitle(m.title), m);
    idSeen.add(m.anilist_id);
  }

  // Supplement: only add truly new titles, or enrich existing ones
  for (const s of supplement) {
    const normTitle = normalizeTitle(s.title);
    const existing = seen.get(normTitle);
    if (existing) {
      // Merge: pick best metadata
      if (!existing.score && s.score) existing.score = s.score;
      if (!existing.synopsis && s.synopsis) existing.synopsis = s.synopsis;
      if (!existing.chapters && s.chapters) existing.chapters = s.chapters;
      if (!existing.volumes && s.volumes) existing.volumes = s.volumes;
      if (!existing.authors?.length && s.authors?.length) existing.authors = s.authors;
      // Merge genres (deduplicated)
      if (s.genres?.length) {
        const existingGenreNames = new Set(existing.genres?.map(g => g.name) || []);
        const newGenres = s.genres.filter(g => !existingGenreNames.has(g.name));
        existing.genres = [...(existing.genres || []), ...newGenres];
      }
    } else if (!idSeen.has(s.anilist_id)) {
      seen.set(normTitle, s);
      idSeen.add(s.anilist_id);
    }
  }

  return Array.from(seen.values());
}

export async function getMangaById(id: number, language: SupportedLanguage = "en"): Promise<Manga> {
  // All IDs in this app are AniList IDs - no fallback to MAL ID to prevent mismatches
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
      }
    }
  `;

  const data = await anilistQuery<{ Media: AniListMedia }>(query, { id });
  return toManga(data.Media, language);
}

export async function searchManga(
  searchQuery: string,
  page = 1,
  limit = 25,
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua",
  language: SupportedLanguage = "en",
  sort: "SEARCH_MATCH" | "START_DATE_DESC" | "POPULARITY_DESC" = "START_DATE_DESC"
): Promise<Manga[]> {
  let format: string | undefined;
  let countryOfOrigin: string | undefined;

  if (filter === "manga") format = "MANGA";
  else if (filter === "novels" || filter === "lightnovels") format = "NOVEL";
  else if (filter === "oneshots") format = "ONE_SHOT";
  else if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($search: String, $page: Int, $perPage: Int, $format: MediaFormat, $countryOfOrigin: CountryCode, $sort: [MediaSort]) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: MANGA, sort: $sort, format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, {
    search: searchQuery,
    page,
    perPage: limit,
    format,
    countryOfOrigin,
    sort: [sort],
  });
  return data.Page.media.map(m => toManga(m, language));
}

// News - AniList doesn't have news, return empty
export async function getAnimeNews(): Promise<NewsItem[]> {
  return [];
}

// Schedule item with airing time info
export interface ScheduleItem {
  /** @description Primary ID - This is the AniList ID used for all API calls */
  anilist_id: number;
  anime: Anime;
  airingTime: string;
  airingAt: number;
  episode?: number;
}

// Schedule - Get airing schedule using AniList's AiringSchedule query
export async function getSchedule(day?: string, language: SupportedLanguage = "en"): Promise<Anime[]> {
  // Legacy function - returns just anime array for backward compatibility
  const schedule = await getScheduleByDay(day || getCurrentDayName(), language);
  return schedule.map(s => s.anime);
}

// New schedule function with airing times
export async function getScheduleByDay(day: string, language: SupportedLanguage = "en"): Promise<ScheduleItem[]> {
  const dayMap: Record<string, number> = { 
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, 
    thursday: 4, friday: 5, saturday: 6 
  };
  
  const targetDayNum = dayMap[day.toLowerCase()];
  const now = new Date();
  const currentDayNum = now.getDay();
  
  // Calculate days until target day
  let daysUntil = targetDayNum - currentDayNum;
  if (daysUntil < 0) daysUntil += 7;
  
  // Get start and end timestamps for the target day
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + daysUntil);
  targetDate.setHours(0, 0, 0, 0);
  const startOfDay = Math.floor(targetDate.getTime() / 1000);
  
  const endDate = new Date(targetDate);
  endDate.setHours(23, 59, 59, 999);
  const endOfDay = Math.floor(endDate.getTime() / 1000);

  const query = `
    query ($airingAtGreater: Int, $airingAtLesser: Int) {
      Page(page: 1, perPage: 50) {
        airingSchedules(airingAt_greater: $airingAtGreater, airingAt_lesser: $airingAtLesser, sort: [TIME]) {
          airingAt
          episode
          media {
            ${MEDIA_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await anilistQuery<{ 
    Page: { 
      airingSchedules: Array<{ 
        airingAt: number; 
        episode: number; 
        media: AniListMedia 
      }> 
    } 
  }>(query, { 
    airingAtGreater: startOfDay, 
    airingAtLesser: endOfDay 
  });

  return data.Page.airingSchedules
    .filter(s => s.media) // Filter out null media
    .map(s => ({
      anilist_id: s.media.id, // Primary AniList ID
      anime: toAnime(s.media, language),
      airingTime: formatAiringTime(s.airingAt),
      airingAt: s.airingAt,
      episode: s.episode,
    }))
    .sort((a, b) => a.airingAt - b.airingAt);
}

function formatAiringTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  });
}

function getCurrentDayName(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

// Helpers
function getCurrentSeason(): string {
  const month = new Date().getMonth();
  if (month >= 0 && month <= 2) return "winter";
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  return "fall";
}

export function formatScore(score?: number): string {
  return score ? score.toFixed(1) : "N/A";
}

export function formatNumber(num?: number): string {
  if (!num) return "0";
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

// Batch fetch anime by IDs (for galaxy map)
export async function getAnimeBatchByIds(ids: number[], language: SupportedLanguage = "en"): Promise<Anime[]> {
  if (ids.length === 0) return [];
  // AniList allows up to 50 per page query, so we chunk
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }
  
  const results: Anime[] = [];
  for (const chunk of chunks) {
    const query = `
      query ($ids: [Int], $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(id_in: $ids, type: ANIME, isAdult: false) {
            ${MEDIA_FRAGMENT}
            relations {
              edges {
                relationType
                node {
                  id
                  type
                  format
                }
              }
            }
          }
        }
      }
    `;
    const data = await anilistQuery<{ Page: { media: (AniListMedia & { relations?: { edges: Array<{ relationType: string; node: { id: number; type: string; format?: string } }> } })[] } }>(query, { ids: chunk, perPage: chunk.length });
    results.push(...data.Page.media.map(m => {
      const anime = toAnime(m, language);
      // Attach relations data
      (anime as any)._relations = m.relations?.edges?.filter(e => e.node.type === 'ANIME').map(e => ({
        id: e.node.id,
        type: e.relationType,
      })) || [];
      return anime;
    }));
  }
  return results;
}

// Batch fetch manga by IDs (for galaxy map)
export async function getMangaBatchByIds(ids: number[], language: SupportedLanguage = "en"): Promise<Manga[]> {
  if (ids.length === 0) return [];
  const chunks: number[][] = [];
  for (let i = 0; i < ids.length; i += 50) {
    chunks.push(ids.slice(i, i + 50));
  }
  
  const results: Manga[] = [];
  for (const chunk of chunks) {
    const query = `
      query ($ids: [Int], $perPage: Int) {
        Page(page: 1, perPage: $perPage) {
          media(id_in: $ids, type: MANGA, isAdult: false) {
            ${MEDIA_FRAGMENT}
            relations {
              edges {
                relationType
                node {
                  id
                  type
                  format
                }
              }
            }
          }
        }
      }
    `;
    const data = await anilistQuery<{ Page: { media: (AniListMedia & { relations?: { edges: Array<{ relationType: string; node: { id: number; type: string; format?: string } }> } })[] } }>(query, { ids: chunk, perPage: chunk.length });
    results.push(...data.Page.media.map(m => {
      const manga = toManga(m, language);
      (manga as any)._relations = m.relations?.edges?.filter(e => e.node.type === 'MANGA').map(e => ({
        id: e.node.id,
        type: e.relationType,
      })) || [];
      return manga;
    }));
  }
  return results;
}
