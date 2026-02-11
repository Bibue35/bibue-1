import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANILIST_API = "https://graphql.anilist.co";

// Status mapping from AniList to our internal format
const ANILIST_STATUS_MAP: Record<string, string> = {
  CURRENT: "watching",
  COMPLETED: "completed",
  PAUSED: "on_hold",
  DROPPED: "dropped",
  PLANNING: "plan_to_watch",
  REPEATING: "watching",
};

// Status mapping from MAL to our internal format
const MAL_STATUS_MAP: Record<string, string> = {
  watching: "watching",
  completed: "completed",
  on_hold: "on_hold",
  dropped: "dropped",
  plan_to_watch: "plan_to_watch",
  reading: "watching",
  plan_to_read: "plan_to_watch",
};

// --- Token Decryption Helper (AES-256-GCM) ---
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyHex = Deno.env.get("TOKEN_ENCRYPTION_KEY");
  if (!keyHex || keyHex.length < 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY not configured or too short");
  }
  const keyBytes = new TextEncoder().encode(keyHex.slice(0, 32));
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function decryptToken(encrypted: string): Promise<string> {
  try {
    const key = await getEncryptionKey();
    const combined = Uint8Array.from(atob(encrypted), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const decrypted = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(decrypted);
  } catch {
    // If decryption fails, token might be stored in plaintext (legacy)
    // Return as-is for backward compatibility during migration
    return encrypted;
  }
}
// --- End Decryption Helper ---

interface SyncResult {
  added: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
}

async function fetchAniListList(
  accessToken: string,
  userId: string,
  mediaType: "ANIME" | "MANGA"
): Promise<Array<{
  mal_id: number;
  title: string;
  title_japanese: string | null;
  image_url: string | null;
  score: number | null;
  status: string;
  progress: number;
  media_type: "anime" | "manga";
}>> {
  const query = `
    query ($userId: Int, $type: MediaType) {
      MediaListCollection(userId: $userId, type: $type) {
        lists {
          entries {
            score(format: POINT_10)
            status
            progress
            media {
              id
              title { romaji english native }
              coverImage { extraLarge large }
            }
          }
        }
      }
    }
  `;

  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query, variables: { userId: parseInt(userId), type: mediaType } }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`AniList API error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const lists = json?.data?.MediaListCollection?.lists || [];
  const items: ReturnType<typeof fetchAniListList> extends Promise<infer T> ? T : never = [];

  for (const list of lists) {
    for (const entry of list.entries || []) {
      const media = entry.media;
      const imageUrl = media.coverImage?.extraLarge || media.coverImage?.large || null;
      const title = media.title?.english || media.title?.romaji || media.title?.native || "Unknown";

      items.push({
        mal_id: media.id,
        title,
        title_japanese: media.title?.native || null,
        image_url: imageUrl,
        score: entry.score > 0 ? entry.score : null,
        status: ANILIST_STATUS_MAP[entry.status] || "plan_to_watch",
        progress: entry.progress || 0,
        media_type: mediaType === "ANIME" ? "anime" : "manga",
      });
    }
  }

  return items;
}

async function fetchMALList(
  accessToken: string,
  mediaType: "anime" | "manga"
): Promise<Array<{
  mal_id: number;
  title: string;
  title_japanese: string | null;
  image_url: string | null;
  score: number | null;
  status: string;
  progress: number;
  media_type: "anime" | "manga";
}>> {
  const items: Array<{
    mal_id: number;
    title: string;
    title_japanese: string | null;
    image_url: string | null;
    score: number | null;
    status: string;
    progress: number;
    media_type: "anime" | "manga";
  }> = [];

  const fields = mediaType === "anime"
    ? "list_status{status,score,num_episodes_watched},node{id,title,main_picture}"
    : "list_status{status,score,num_chapters_read},node{id,title,main_picture}";

  let url: string | null = `https://api.myanimelist.net/v2/users/@me/${mediaType}list?fields=${fields}&limit=100&nsfw=false`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`MAL API error ${res.status}: ${text}`);
    }

    const json = await res.json();

    for (const item of json.data || []) {
      const node = item.node;
      const listStatus = item.list_status;

      items.push({
        mal_id: node.id,
        title: node.title || "Unknown",
        title_japanese: null,
        image_url: node.main_picture?.large || node.main_picture?.medium || null,
        score: listStatus.score > 0 ? listStatus.score : null,
        status: MAL_STATUS_MAP[listStatus.status] || "plan_to_watch",
        progress: mediaType === "anime"
          ? (listStatus.num_episodes_watched || 0)
          : (listStatus.num_chapters_read || 0),
        media_type: mediaType,
      });
    }

    url = json.paging?.next || null;
  }

  return items;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claims.claims.sub as string;
    const body = await req.json();
    const { provider, mode = "merge" } = body;

    if (!provider || !["anilist", "mal"].includes(provider)) {
      return new Response(JSON.stringify({ error: "Invalid provider. Must be 'anilist' or 'mal'." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!["merge", "skip", "overwrite"].includes(mode)) {
      return new Response(JSON.stringify({ error: "Invalid mode. Must be 'merge', 'skip', or 'overwrite'." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate and sanitize mediaTypes
    const rawMediaTypes = Array.isArray(body.mediaTypes) ? body.mediaTypes : ["anime", "manga"];
    const validMediaTypes = ["anime", "manga"];
    const mediaTypes = [...new Set(rawMediaTypes.filter((t: unknown) => typeof t === "string" && validMediaTypes.includes(t)))];
    if (mediaTypes.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid mediaTypes. Must include 'anime' and/or 'manga'." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch linked account
    const { data: account, error: accountError } = await supabase
      .from("linked_accounts")
      .select("*")
      .eq("user_id", userId)
      .eq("provider", provider)
      .single();

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: `No ${provider} account linked` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Decrypt the access token before using it
    const decryptedAccessToken = await decryptToken(account.access_token);

    // Fetch existing watchlist for this user
    const { data: existingWatchlist } = await supabase
      .from("watchlist")
      .select("mal_id, media_type")
      .eq("user_id", userId);

    const existingSet = new Set(
      (existingWatchlist || []).map((w: { mal_id: number; media_type: string }) => `${w.mal_id}-${w.media_type}`)
    );

    const result: SyncResult = { added: 0, updated: 0, skipped: 0, errors: 0, total: 0 };

    for (const mt of mediaTypes) {
      let items: Array<{
        mal_id: number;
        title: string;
        title_japanese: string | null;
        image_url: string | null;
        score: number | null;
        status: string;
        progress: number;
        media_type: "anime" | "manga";
      }> = [];

      try {
        if (provider === "anilist") {
          items = await fetchAniListList(
            decryptedAccessToken,
            account.provider_user_id,
            mt === "anime" ? "ANIME" : "MANGA"
          );
        } else {
          items = await fetchMALList(decryptedAccessToken, mt as "anime" | "manga");
        }
      } catch (fetchErr) {
        console.error(`Failed to fetch ${mt} list from ${provider}:`, fetchErr);
        result.errors += 1;
        continue;
      }

      result.total += items.length;

      // Process in batches
      const BATCH_SIZE = 50;
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batch = items.slice(i, i + BATCH_SIZE);
        const toUpsert = [];

        for (const item of batch) {
          const key = `${item.mal_id}-${item.media_type}`;
          const isExisting = existingSet.has(key);

          if (isExisting && mode === "skip") {
            result.skipped++;
            continue;
          }

          const progressField = item.media_type === "anime"
            ? { episodes_watched: item.progress, last_episode_watched: item.progress > 0 ? item.progress : null }
            : { chapters_read: item.progress, last_chapter_read: item.progress > 0 ? item.progress : null };

          toUpsert.push({
            user_id: userId,
            mal_id: item.mal_id,
            media_type: item.media_type,
            title: item.title,
            title_japanese: item.title_japanese,
            image_url: item.image_url,
            score: item.score,
            status: item.status,
            ...progressField,
          });

          if (isExisting) {
            result.updated++;
          } else {
            result.added++;
            existingSet.add(key);
          }
        }

        if (toUpsert.length > 0) {
          const { error: upsertError } = await supabase
            .from("watchlist")
            .upsert(toUpsert, { onConflict: "user_id,mal_id,media_type" });

          if (upsertError) {
            console.error("Upsert error:", upsertError);
            result.errors += toUpsert.length;
            result.added -= toUpsert.filter(
              (u) => !existingSet.has(`${u.mal_id}-${u.media_type}`)
            ).length;
          }
        }
      }
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[watchlist-sync] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
