import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ANILIST_API = "https://graphql.anilist.co";

// In-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  // Evict old entries if cache grows too large
  if (cache.size > 500) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expires < now) cache.delete(k);
    }
  }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, variables } = await req.json();

    if (!query || typeof query !== "string") {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'query' field" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create cache key from query + variables
    const cacheKey = JSON.stringify({ query: query.trim(), variables });
    const cached = getCached(cacheKey);
    if (cached) {
      return new Response(JSON.stringify(cached), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Retry logic with exponential backoff
    const MAX_RETRIES = 2;
    const BASE_DELAY = 1000;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(ANILIST_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ query, variables }),
        });

        // Rate limit — wait and retry
        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get("Retry-After") || "60", 10);
          console.warn(`[anilist-proxy] Rate limited. Retry-After: ${retryAfter}s`);
          if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, Math.min(retryAfter * 1000, 30000)));
            continue;
          }
          return new Response(
            JSON.stringify({ error: "Rate limited by AniList. Please try again later." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        if (!response.ok) {
          const errText = await response.text();
          console.error(`[anilist-proxy] AniList error ${response.status}: ${errText}`);
          if (attempt < MAX_RETRIES && response.status >= 500) {
            await new Promise((r) => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
            continue;
          }
          return new Response(
            JSON.stringify({ error: "AniList API error", status: response.status }),
            { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const json = await response.json();

        // Cache successful responses
        setCache(cacheKey, json);

        return new Response(JSON.stringify(json), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } catch (fetchErr) {
        lastError = fetchErr instanceof Error ? fetchErr : new Error(String(fetchErr));
        console.warn(`[anilist-proxy] Fetch error (attempt ${attempt + 1}): ${lastError.message}`);
        if (attempt < MAX_RETRIES) {
          await new Promise((r) => setTimeout(r, BASE_DELAY * Math.pow(2, attempt)));
          continue;
        }
      }
    }

    return new Response(
      JSON.stringify({ error: lastError?.message || "Failed to reach AniList API" }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[anilist-proxy] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
