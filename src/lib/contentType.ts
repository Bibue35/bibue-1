export type ContentType = 'anime' | 'manga' | 'manhwa' | 'manhua';

/**
 * Determine the specific content type based on media type and country of origin.
 * - Manga = Japan (JP)
 * - Manhwa = South Korea (KR)
 * - Manhua = China (CN)
 */
export function getContentType(media: { type?: string; countryOfOrigin?: string; media_type?: string }): ContentType {
  const mediaType = media.type || media.media_type || '';
  
  // Anime is always anime regardless of country
  if (mediaType.toUpperCase() === 'ANIME' || mediaType === 'anime') return 'anime';
  
  // For manga-type content, differentiate by country
  switch (media.countryOfOrigin) {
    case 'KR': return 'manhwa';
    case 'CN': return 'manhua';
    case 'JP':
    default: return 'manga'; // Default to manga if country unknown
  }
}

export function getContentLabel(type: ContentType): string {
  switch (type) {
    case 'anime': return 'Anime';
    case 'manga': return 'Manga';
    case 'manhwa': return 'Manhwa';
    case 'manhua': return 'Manhua';
  }
}

export function getContentUnit(type: ContentType): string {
  return type === 'anime' ? 'episodes' : 'chapters';
}

/**
 * CSS class for content type badge coloring.
 * Uses semantic tokens for theme compatibility.
 */
export function getContentTypeBadgeClass(type: ContentType): string {
  switch (type) {
    case 'anime': return 'bg-primary/15 text-primary';
    case 'manga': return 'bg-destructive/15 text-destructive';
    case 'manhwa': return 'bg-blue-500/15 text-blue-400';
    case 'manhua': return 'bg-yellow-500/15 text-yellow-400';
  }
}
