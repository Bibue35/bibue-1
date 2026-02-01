// AniList GraphQL API integration (replaces Jikan for better rate limits)
const ANILIST_API = "https://graphql.anilist.co";

export interface Anime {
  mal_id: number; // We'll use AniList id but keep the field name for compatibility
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

// AniList GraphQL query helper
async function anilistQuery<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`AniList API Error: ${response.status}`);
  }

  const json = await response.json();
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "AniList query error");
  }
  return json.data;
}

// Convert AniList media to our Anime format
function toAnime(media: AniListMedia): Anime {
  return {
    mal_id: media.idMal || media.id,
    title: media.title.english || media.title.romaji || "Unknown",
    title_english: media.title.english || undefined,
    title_japanese: media.title.native || undefined,
    images: {
      jpg: { large_image_url: media.coverImage.extraLarge || media.coverImage.large, image_url: media.coverImage.medium || media.coverImage.large },
      webp: { large_image_url: media.coverImage.extraLarge || media.coverImage.large, image_url: media.coverImage.medium || media.coverImage.large },
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
  };
}

// Convert AniList media to our Manga format
function toManga(media: AniListMedia): Manga {
  return {
    mal_id: media.idMal || media.id,
    title: media.title.english || media.title.romaji || "Unknown",
    title_english: media.title.english || undefined,
    title_japanese: media.title.native || undefined,
    images: {
      jpg: { large_image_url: media.coverImage.extraLarge || media.coverImage.large, image_url: media.coverImage.medium || media.coverImage.large },
      webp: { large_image_url: media.coverImage.extraLarge || media.coverImage.large, image_url: media.coverImage.medium || media.coverImage.large },
    },
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
    genres: media.genres?.map((g, i) => ({ mal_id: i, name: g })) || [],
    authors: media.staff?.nodes?.filter(s => s.primaryOccupations?.includes("Mangaka"))?.map(s => ({ mal_id: s.id, name: s.name.full })) || [],
    type: media.format || undefined,
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
  trailer?: { id: string; site: string };
  startDate?: { year?: number; month?: number; day?: number };
  endDate?: { year?: number; month?: number; day?: number };
  studios?: { nodes: Array<{ id: number; name: string }> };
  staff?: { nodes: Array<{ id: number; name: { full: string }; primaryOccupations?: string[] }> };
  rankings?: Array<{ type: string; rank: number; allTime: boolean }>;
  stats?: { scoreDistribution?: Array<{ score: number; amount: number }> };
  recommendations?: { nodes: Array<{ mediaRecommendation: AniListMedia }> };
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
  trailer { id site }
  startDate { year month day }
  endDate { year month day }
  studios(isMain: true) { nodes { id name } }
  rankings { type rank allTime }
`;

// Anime endpoints
export async function getTopAnime(page = 1, limit = 25, filter?: "airing" | "upcoming" | "bypopularity" | "favorite"): Promise<Anime[]> {
  let sort = "POPULARITY_DESC";
  let status: string | undefined;
  
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
  }

  const query = `
    query ($page: Int, $perPage: Int, $sort: [MediaSort], $status: MediaStatus) {
      Page(page: $page, perPage: $perPage) {
        media(type: ANIME, sort: $sort, status: $status, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, sort: [sort], status });
  return data.Page.media.map(toAnime);
}

export async function getSeasonalAnime(year?: number, season?: string): Promise<Anime[]> {
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
  return data.Page.media.map(toAnime);
}

export async function getAnimeById(id: number): Promise<Anime> {
  // Try to fetch by AniList ID first
  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
      }
    }
  `;

  try {
    const data = await anilistQuery<{ Media: AniListMedia }>(query, { id });
    if (data.Media) {
      return toAnime(data.Media);
    }
  } catch (e) {
    // If not found by AniList ID, try by MAL ID
  }

  // Fallback: search by MAL ID
  const malQuery = `
    query ($idMal: Int) {
      Media(idMal: $idMal, type: ANIME) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
      }
    }
  `;

  const data = await anilistQuery<{ Media: AniListMedia }>(malQuery, { idMal: id });
  return toAnime(data.Media);
}

export async function searchAnime(searchQuery: string, page = 1, limit = 25): Promise<Anime[]> {
  const query = `
    query ($search: String, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: ANIME, sort: [SEARCH_MATCH], isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { search: searchQuery, page, perPage: limit });
  return data.Page.media.map(toAnime);
}

export async function getAnimeRecommendations(id: number): Promise<Array<{ entry: Anime }>> {
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
    .map(n => ({ entry: toAnime(n.mediaRecommendation) }));
}

export async function getMangaRecommendations(id: number): Promise<Array<{ entry: Manga }>> {
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
    .map(n => ({ entry: toManga(n.mediaRecommendation) }));
}

// Manga endpoints
export async function getTopManga(page = 1, limit = 25, filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua"): Promise<Manga[]> {
  let format: string | undefined;
  let countryOfOrigin: string | undefined;

  if (filter === "manga") format = "MANGA";
  else if (filter === "novels" || filter === "lightnovels") format = "NOVEL";
  else if (filter === "oneshots") format = "ONE_SHOT";
  else if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($page: Int, $perPage: Int, $format: MediaFormat, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(type: MANGA, sort: [POPULARITY_DESC], format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
          ${MEDIA_FRAGMENT}
        }
      }
    }
  `;

  const data = await anilistQuery<{ Page: { media: AniListMedia[] } }>(query, { page, perPage: limit, format, countryOfOrigin });
  return data.Page.media.map(toManga);
}

export async function getMangaById(id: number): Promise<Manga> {
  // Try to fetch by AniList ID first
  const query = `
    query ($id: Int) {
      Media(id: $id, type: MANGA) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
        staff { nodes { id name { full } primaryOccupations } }
      }
    }
  `;

  try {
    const data = await anilistQuery<{ Media: AniListMedia }>(query, { id });
    if (data.Media) {
      return toManga(data.Media);
    }
  } catch (e) {
    // If not found by AniList ID, try by MAL ID
  }

  // Fallback: search by MAL ID
  const malQuery = `
    query ($idMal: Int) {
      Media(idMal: $idMal, type: MANGA) {
        ${MEDIA_FRAGMENT}
        stats { scoreDistribution { score amount } }
        staff { nodes { id name { full } primaryOccupations } }
      }
    }
  `;

  const data = await anilistQuery<{ Media: AniListMedia }>(malQuery, { idMal: id });
  return toManga(data.Media);
}

export async function searchManga(
  searchQuery: string,
  page = 1,
  limit = 25,
  filter?: "manga" | "novels" | "lightnovels" | "oneshots" | "doujin" | "manhwa" | "manhua",
): Promise<Manga[]> {
  let format: string | undefined;
  let countryOfOrigin: string | undefined;

  if (filter === "manga") format = "MANGA";
  else if (filter === "novels" || filter === "lightnovels") format = "NOVEL";
  else if (filter === "oneshots") format = "ONE_SHOT";
  else if (filter === "manhwa") countryOfOrigin = "KR";
  else if (filter === "manhua") countryOfOrigin = "CN";

  const query = `
    query ($search: String, $page: Int, $perPage: Int, $format: MediaFormat, $countryOfOrigin: CountryCode) {
      Page(page: $page, perPage: $perPage) {
        media(search: $search, type: MANGA, sort: [SEARCH_MATCH], format: $format, countryOfOrigin: $countryOfOrigin, isAdult: false) {
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
  });
  return data.Page.media.map(toManga);
}

// News - AniList doesn't have news, return empty
export async function getAnimeNews(): Promise<NewsItem[]> {
  return [];
}

// Schedule item with airing time info
export interface ScheduleItem {
  anime: Anime;
  airingTime: string;
  airingAt: number;
  episode?: number;
}

// Schedule - Get airing schedule using AniList's AiringSchedule query
export async function getSchedule(day?: string): Promise<Anime[]> {
  // Legacy function - returns just anime array for backward compatibility
  const schedule = await getScheduleByDay(day || getCurrentDayName());
  return schedule.map(s => s.anime);
}

// New schedule function with airing times
export async function getScheduleByDay(day: string): Promise<ScheduleItem[]> {
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
      anime: toAnime(s.media),
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
