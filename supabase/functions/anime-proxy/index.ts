import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache with TTL
const cache = new Map<string, { data: unknown; expires: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

function getCached(key: string): unknown | null {
  const entry = cache.get(key);
  if (entry && entry.expires > Date.now()) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: unknown): void {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

// Get API URL from environment or use default
// You should deploy your own instance: https://github.com/ghoshRitesh12/aniwatch-api
const ANIWATCH_API_URL = Deno.env.get("ANIWATCH_API_URL") || "";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Check if API is configured
  if (!ANIWATCH_API_URL) {
    return new Response(
      JSON.stringify({ 
        error: "API not configured",
        setup: {
          message: "Please configure your own AniWatch API instance",
          steps: [
            "1. Deploy aniwatch-api from https://github.com/ghoshRitesh12/aniwatch-api",
            "2. Add ANIWATCH_API_URL secret with your instance URL (e.g., https://your-instance.onrender.com/api/v2/hianime)"
          ]
        }
      }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const url = new URL(req.url);
    
    // Support both GET query params and POST body
    let action: string | null = null;
    let query: string | null = null;
    let id: string | null = null;
    let episodeId: string | null = null;
    let page: string = "1";
    let category: string = "top-airing";
    let server: string = "hd-1";
    let audioType: string = "sub";
    
    if (req.method === "GET") {
      action = url.searchParams.get("action");
      query = url.searchParams.get("query");
      id = url.searchParams.get("id");
      episodeId = url.searchParams.get("episodeId");
      page = url.searchParams.get("page") || "1";
      category = url.searchParams.get("category") || "top-airing";
      server = url.searchParams.get("server") || "hd-1";
      audioType = url.searchParams.get("audio") || "sub";
    } else if (req.method === "POST") {
      try {
        const body = await req.json();
        action = body.action || null;
        query = body.query || null;
        id = body.id || null;
        episodeId = body.episodeId || null;
        page = body.page || "1";
        category = body.category || "top-airing";
        server = body.server || "hd-1";
        audioType = body.audio || "sub";
      } catch {
        return new Response(
          JSON.stringify({ error: "Invalid JSON body" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    let endpoint = "";
    let cacheKey = "";

    switch (action) {
      case "search":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Query parameter required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/search?q=${encodeURIComponent(query)}&page=${page}`;
        cacheKey = `search:${query}:${page}`;
        break;

      case "info":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID parameter required (anime slug)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/anime/${encodeURIComponent(id)}`;
        cacheKey = `info:${id}`;
        break;

      case "episodes":
        if (!id) {
          return new Response(
            JSON.stringify({ error: "ID parameter required (anime slug)" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/anime/${encodeURIComponent(id)}/episodes`;
        cacheKey = `episodes:${id}`;
        break;

      case "watch":
        if (!episodeId) {
          return new Response(
            JSON.stringify({ error: "Episode ID parameter required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        // Supports server options: hd-1, hd-2, megacloud, streamsb
        // Supports audio: sub, dub, raw
        endpoint = `${ANIWATCH_API_URL}/episode/sources?animeEpisodeId=${encodeURIComponent(episodeId)}&server=${server}&category=${audioType}`;
        cacheKey = `watch:${episodeId}:${server}:${audioType}`;
        break;

      case "servers":
        if (!episodeId) {
          return new Response(
            JSON.stringify({ error: "Episode ID parameter required" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/episode/servers?animeEpisodeId=${encodeURIComponent(episodeId)}`;
        cacheKey = `servers:${episodeId}`;
        break;

      case "category":
        // Categories: top-airing, most-popular, most-favorite, completed, recently-updated, 
        // recently-added, top-upcoming, subbed-anime, dubbed-anime, movie, special, ova, ona, tv
        endpoint = `${ANIWATCH_API_URL}/category/${category}?page=${page}`;
        cacheKey = `category:${category}:${page}`;
        break;

      case "home":
        endpoint = `${ANIWATCH_API_URL}/home`;
        cacheKey = `home`;
        break;

      case "schedule":
        // Date format: YYYY-MM-DD
        const scheduleDate = query || new Date().toISOString().split('T')[0];
        endpoint = `${ANIWATCH_API_URL}/schedule?date=${scheduleDate}`;
        cacheKey = `schedule:${scheduleDate}`;
        break;

      case "genre":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Genre name required in query parameter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/genre/${encodeURIComponent(query)}?page=${page}`;
        cacheKey = `genre:${query}:${page}`;
        break;

      case "producer":
        if (!query) {
          return new Response(
            JSON.stringify({ error: "Producer name required in query parameter" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        endpoint = `${ANIWATCH_API_URL}/producer/${encodeURIComponent(query)}?page=${page}`;
        cacheKey = `producer:${query}:${page}`;
        break;

      default:
        return new Response(
          JSON.stringify({ 
            error: "Invalid action",
            validActions: ["search", "info", "episodes", "watch", "servers", "category", "home", "schedule", "genre", "producer"],
            categoryOptions: ["top-airing", "most-popular", "most-favorite", "completed", "recently-updated", "recently-added", "top-upcoming", "subbed-anime", "dubbed-anime", "movie", "special", "ova", "ona", "tv"],
            serverOptions: ["hd-1", "hd-2", "megacloud", "streamsb"],
            audioOptions: ["sub", "dub", "raw"],
            examples: {
              search: { action: "search", query: "one piece" },
              info: { action: "info", id: "one-piece-100" },
              episodes: { action: "episodes", id: "one-piece-100" },
              watch: { action: "watch", episodeId: "one-piece-100?ep=1", server: "hd-1", audio: "sub" },
              category: { action: "category", category: "top-airing", page: "1" },
              home: { action: "home" },
              schedule: { action: "schedule", query: "2026-02-04" },
              genre: { action: "genre", query: "action", page: "1" }
            }
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // Check cache first
    const cached = getCached(cacheKey);
    if (cached) {
      console.log(`Cache hit for: ${cacheKey}`);
      return new Response(
        JSON.stringify({ data: cached, cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from API
    console.log(`Fetching: ${endpoint}`);
    const response = await fetch(endpoint, {
      headers: {
        "Accept": "application/json",
        "User-Agent": "Bibue/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: "Failed to fetch from streaming API", status: response.status, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();

    // Cache the response
    setCache(cacheKey, data);
    console.log(`Cached: ${cacheKey}`);

    return new Response(
      JSON.stringify({ data, cached: false }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Anime proxy error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
