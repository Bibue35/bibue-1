import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Step 1: Initiate OAuth - redirect user to AniList
  if (req.method === "GET" && url.searchParams.has("initiate")) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("ANILIST_CLIENT_ID");
    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "AniList not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/anilist-oauth-callback`;
    const state = crypto.randomUUID();

    // Store state + user token temporarily for validation
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the user
    const token = authHeader.replace("Bearer ", "");
    const { data: claims, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claims?.claims?.sub) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const anilistAuthUrl =
      `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${state}`;

    return new Response(
      JSON.stringify({ url: anilistAuthUrl, state }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Handle callback from AniList
  if (req.method === "GET" && url.searchParams.has("code")) {
    const code = url.searchParams.get("code");

    const clientId = Deno.env.get("ANILIST_CLIENT_ID");
    const clientSecret = Deno.env.get("ANILIST_CLIENT_SECRET");
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/anilist-oauth-callback`;

    if (!clientId || !clientSecret) {
      return new Response("<h1>AniList integration not configured</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    try {
      // Exchange code for token
      const tokenRes = await fetch("https://anilist.co/api/v2/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grant_type: "authorization_code",
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        return new Response(
          `<html><body><h1>Failed to link AniList</h1><p>${JSON.stringify(tokenData)}</p><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // Fetch AniList user info
      const userRes = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: JSON.stringify({
          query: `{ Viewer { id name } }`,
        }),
      });

      const userData = await userRes.json();
      const anilistUser = userData?.data?.Viewer;

      if (!anilistUser) {
        return new Response(
          `<html><body><h1>Failed to fetch AniList profile</h1><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // We need the Bibue user_id. Pass it via state or cookie.
      // For now, return success page that posts message to opener
      return new Response(
        `<html><body>
          <h1>AniList Connected!</h1>
          <p>Linked as ${anilistUser.name}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({
                type: 'anilist-oauth-callback',
                accessToken: '${tokenData.access_token}',
                refreshToken: '${tokenData.refresh_token || ""}',
                expiresIn: ${tokenData.expires_in || 0},
                userId: '${anilistUser.id}',
                username: '${anilistUser.name}'
              }, '*');
            }
            setTimeout(() => window.close(), 2000);
          </script>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch (err) {
      return new Response(
        `<html><body><h1>Error linking AniList</h1><p>${err.message}</p><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // Step 3: Save linked account (called from frontend after postMessage)
  if (req.method === "POST") {
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

    const { data, error } = await supabase
      .from("linked_accounts")
      .upsert(
        {
          user_id: userId,
          provider: "anilist",
          provider_user_id: String(body.userId),
          provider_username: body.username,
          access_token: body.accessToken,
          refresh_token: body.refreshToken || null,
          token_expires_at: body.expiresIn
            ? new Date(Date.now() + body.expiresIn * 1000).toISOString()
            : null,
        },
        { onConflict: "user_id,provider" }
      )
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
