import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MANGADEX_API = 'https://api.mangadex.org';

// Only allow safe + suggestive content (no erotica/pornographic)
const SAFE_RATINGS = ['safe', 'suggestive'];

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function transformMangaList(data: any) {
  return data.data?.map((manga: any) => {
    const coverArt = manga.relationships?.find((r: any) => r.type === 'cover_art');
    const coverFile = coverArt?.attributes?.fileName;
    const coverUrl = coverFile
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFile}.256.jpg`
      : null;

    const attrs = manga.attributes;
    return {
      id: manga.id,
      title: attrs.title?.en || attrs.title?.ja || attrs.title?.['ja-ro'] || Object.values(attrs.title || {})[0] || 'Unknown',
      altTitles: attrs.altTitles,
      description: attrs.description?.en || '',
      status: attrs.status,
      year: attrs.year,
      contentRating: attrs.contentRating,
      tags: attrs.tags?.map((t: any) => t.attributes?.name?.en).filter(Boolean),
      originalLanguage: attrs.originalLanguage,
      coverUrl,
      lastChapter: attrs.lastChapter,
      lastVolume: attrs.lastVolume,
    };
  }) || [];
}

async function searchManga(title: string, limit = 10, offset = 0) {
  const params = new URLSearchParams({
    title,
    limit: String(limit),
    offset: String(offset),
    'order[relevance]': 'desc',
    'includes[]': 'cover_art',
    hasAvailableChapters: 'true',
  });
  SAFE_RATINGS.forEach(r => params.append('contentRating[]', r));

  const res = await fetch(`${MANGADEX_API}/manga?${params}`);
  if (!res.ok) throw new Error(`MangaDex search failed: ${res.status}`);
  return res.json();
}

async function browseManga(
  order: Record<string, string>,
  limit = 20,
  offset = 0,
  extras?: { status?: string; tags?: string[]; demographic?: string; lang?: string }
) {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'includes[]': 'cover_art',
    hasAvailableChapters: 'true',
  });
  SAFE_RATINGS.forEach(r => params.append('contentRating[]', r));
  for (const [key, val] of Object.entries(order)) {
    params.set(`order[${key}]`, val);
  }
  if (extras?.status) params.set('status[]', extras.status);
  if (extras?.demographic) params.append('publicationDemographic[]', extras.demographic);
  if (extras?.tags) {
    extras.tags.forEach(t => params.append('includedTags[]', t));
  }
  if (extras?.lang === 'ko') params.set('originalLanguage[]', 'ko');
  if (extras?.lang === 'zh') params.set('originalLanguage[]', 'zh');

  const res = await fetch(`${MANGADEX_API}/manga?${params}`);
  if (!res.ok) throw new Error(`MangaDex browse failed: ${res.status}`);
  return res.json();
}

async function getChapters(mangadexId: string, limit = 100, offset = 0, lang = 'en') {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
    'translatedLanguage[]': lang,
    'order[chapter]': 'desc',
    'includes[]': 'scanlation_group',
  });
  SAFE_RATINGS.forEach(r => params.append('contentRating[]', r));

  const res = await fetch(`${MANGADEX_API}/manga/${mangadexId}/feed?${params}`);
  if (!res.ok) throw new Error(`MangaDex chapters failed: ${res.status}`);
  return res.json();
}

async function getChapterPages(chapterId: string) {
  const res = await fetch(`${MANGADEX_API}/at-home/server/${chapterId}`);
  if (!res.ok) throw new Error(`MangaDex at-home failed: ${res.status}`);
  return res.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action');

    if (!action) {
      return json({ error: 'Missing action parameter' }, 400);
    }

    switch (action) {
      case 'search': {
        const title = url.searchParams.get('title');
        if (!title) return json({ error: 'Missing title' }, 400);
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const data = await searchManga(title, limit, offset);
        const results = transformMangaList(data);
        return json({ results, total: data.total, limit: data.limit, offset: data.offset });
      }

      case 'browse': {
        const sort = url.searchParams.get('sort') || 'popular';
        const limit = parseInt(url.searchParams.get('limit') || '20');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const status = url.searchParams.get('status') || undefined;
        const demographic = url.searchParams.get('demographic') || undefined;
        const lang = url.searchParams.get('lang') || undefined;
        const tagsParam = url.searchParams.get('tags');
        const tags = tagsParam ? tagsParam.split(',') : undefined;

        const orderMap: Record<string, Record<string, string>> = {
          popular: { followedCount: 'desc' },
          rating: { rating: 'desc' },
          latest: { latestUploadedChapter: 'desc' },
          newest: { createdAt: 'desc' },
          relevance: { relevance: 'desc' },
        };
        const order = orderMap[sort] || orderMap.popular;

        const data = await browseManga(order, limit, offset, { status, tags, demographic, lang });
        const results = transformMangaList(data);
        return json({ results, total: data.total, limit: data.limit, offset: data.offset });
      }

      case 'chapters': {
        const mangadexId = url.searchParams.get('mangadexId');
        if (!mangadexId) return json({ error: 'Missing mangadexId' }, 400);
        const limit = parseInt(url.searchParams.get('limit') || '100');
        const offset = parseInt(url.searchParams.get('offset') || '0');
        const lang = url.searchParams.get('lang') || 'en';
        const data = await getChapters(mangadexId, limit, offset, lang);

        const chapters = data.data?.map((ch: any) => {
          const group = ch.relationships?.find((r: any) => r.type === 'scanlation_group');
          return {
            id: ch.id,
            chapter: ch.attributes.chapter,
            title: ch.attributes.title,
            volume: ch.attributes.volume,
            pages: ch.attributes.pages,
            publishAt: ch.attributes.publishAt,
            readableAt: ch.attributes.readableAt,
            translatedLanguage: ch.attributes.translatedLanguage,
            externalUrl: ch.attributes.externalUrl,
            scanlationGroup: group?.attributes?.name || null,
          };
        }) || [];

        return json({ chapters, total: data.total, limit: data.limit, offset: data.offset });
      }

      case 'pages': {
        const chapterId = url.searchParams.get('chapterId');
        if (!chapterId) return json({ error: 'Missing chapterId' }, 400);
        const data = await getChapterPages(chapterId);

        const baseUrl = data.baseUrl;
        const hash = data.chapter?.hash;
        const pages = data.chapter?.data?.map((filename: string) => 
          `${baseUrl}/data/${hash}/${filename}`
        ) || [];
        const dataSaver = data.chapter?.dataSaver?.map((filename: string) => 
          `${baseUrl}/data-saver/${hash}/${filename}`
        ) || [];

        return json({ pages, dataSaver, hash });
      }

      default:
        return json({ error: `Unknown action: ${action}` }, 400);
    }
  } catch (error) {
    console.error('MangaDex proxy error:', error);
    return json({ error: error.message || 'Internal error' }, 500);
  }
});
