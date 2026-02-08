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

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/anilist-oauth-callback`;
    const state = crypto.randomUUID();

    // Check if this is a mobile/redirect flow - store user token in state
    const mode = url.searchParams.get("mode"); // "redirect" or "popup"
    const statePayload = mode === "redirect"
      ? `${state}:redirect:${token}`
      : state;

    const anilistAuthUrl =
      `https://anilist.co/api/v2/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${encodeURIComponent(statePayload)}`;

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
    const stateParam = url.searchParams.get("state") || "";

    const clientId = Deno.env.get("ANILIST_CLIENT_ID");
    const clientSecret = Deno.env.get("ANILIST_CLIENT_SECRET");
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/anilist-oauth-callback`;
    const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "";

    if (!clientId || !clientSecret) {
      return new Response("<h1>AniList integration not configured</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Determine if this is a redirect flow
    const stateParts = stateParam.split(":");
    const isRedirectFlow = stateParts.length >= 3 && stateParts[1] === "redirect";
    const userToken = isRedirectFlow ? stateParts.slice(2).join(":") : null;

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
        const errorMsg = "Failed to get token from AniList";
        if (isRedirectFlow && allowedOrigin) {
          return Response.redirect(
            `${allowedOrigin}/settings?oauth_error=${encodeURIComponent(errorMsg)}`,
            302
          );
        }
        return new Response(
          `<html><body><h1>${errorMsg}</h1><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
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
        const errorMsg = "Failed to fetch AniList profile";
        if (isRedirectFlow && allowedOrigin) {
          return Response.redirect(
            `${allowedOrigin}/settings?oauth_error=${encodeURIComponent(errorMsg)}`,
            302
          );
        }
        return new Response(
          `<html><body><h1>${errorMsg}</h1><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
          { headers: { "Content-Type": "text/html" } }
        );
      }

      // If redirect flow, save account server-side and redirect back
      if (isRedirectFlow && userToken) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const { data: claims, error: claimsError } = await supabase.auth.getClaims(userToken);
        if (claimsError || !claims?.claims?.sub) {
          return Response.redirect(
            `${allowedOrigin}/settings?oauth_error=${encodeURIComponent("Session expired, please try again")}`,
            302
          );
        }

        const userId = claims.claims.sub as string;
        await supabase
          .from("linked_accounts")
          .upsert(
            {
              user_id: userId,
              provider: "anilist",
              provider_user_id: String(anilistUser.id),
              provider_username: anilistUser.name,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || null,
              token_expires_at: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                : null,
            },
            { onConflict: "user_id,provider" }
          );

        return Response.redirect(
          `${allowedOrigin}/settings?oauth_success=anilist&username=${encodeURIComponent(anilistUser.name)}`,
          302
        );
      }

      // Popup flow: postMessage back to opener
      const safeUsername = anilistUser.name.replace(/[<>"'&]/g, '');
      const safeOrigin = allowedOrigin.replace(/[<>"'&]/g, '');

      const postMessageScript = allowedOrigin
        ? `window.opener.postMessage(payload, '${safeOrigin}');`
        : `window.opener.postMessage(payload, '*');`;

      return new Response(
        `<html><body>
          <h1>AniList Connected!</h1>
          <p>Linked as ${safeUsername}</p>
          <script>
            if (window.opener) {
              var payload = {
                type: 'anilist-oauth-callback',
                accessToken: '${tokenData.access_token}',
                refreshToken: '${tokenData.refresh_token || ""}',
                expiresIn: ${tokenData.expires_in || 0},
                userId: '${anilistUser.id}',
                username: '${safeUsername}'
              };
              ${postMessageScript}
            }
            setTimeout(function() { window.close(); }, 2000);
          </script>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    } catch (err) {
      if (isRedirectFlow && allowedOrigin) {
        return Response.redirect(
          `${allowedOrigin}/settings?oauth_error=${encodeURIComponent(err.message)}`,
          302
        );
      }
      return new Response(
        `<html><body><h1>Error linking AniList</h1><p>${err.message}</p><script>setTimeout(()=>window.close(),3000)</script></body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }
  }

  // Step 3: Save linked account (called from frontend after postMessage - popup flow only)
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