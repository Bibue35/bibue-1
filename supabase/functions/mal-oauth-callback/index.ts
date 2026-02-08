import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate PKCE code verifier and challenge
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);

  // Step 1: Initiate OAuth - redirect user to MAL
  if (req.method === "GET" && url.searchParams.has("initiate")) {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const clientId = Deno.env.get("MAL_CLIENT_ID");
    if (!clientId) {
      return new Response(JSON.stringify({ error: "MAL not configured" }), {
        status: 500,
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

    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mal-oauth-callback`;
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);

    // Check if this is a mobile/redirect flow - encode verifier + token in state
    const mode = url.searchParams.get("mode"); // "redirect" or "popup"
    const stateId = crypto.randomUUID();

    let state: string;
    if (mode === "redirect") {
      // For redirect flow, encode verifier and token in state so we can complete server-side
      state = `${stateId}:redirect:${codeVerifier}:${token}`;
    } else {
      state = stateId;
    }

    const malAuthUrl =
      `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&code_challenge=${codeChallenge}&code_challenge_method=S256`;

    return new Response(
      JSON.stringify({
        url: malAuthUrl,
        state: stateId,
        codeVerifier: mode !== "redirect" ? codeVerifier : undefined,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Step 2: Handle callback from MAL
  if (req.method === "GET" && url.searchParams.has("code")) {
    const code = url.searchParams.get("code");
    const stateParam = url.searchParams.get("state") || "";

    const clientId = Deno.env.get("MAL_CLIENT_ID");
    const clientSecret = Deno.env.get("MAL_CLIENT_SECRET");
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mal-oauth-callback`;
    const allowedOrigin = Deno.env.get("ALLOWED_ORIGIN") || "";

    if (!clientId || !clientSecret) {
      return new Response("<h1>MAL integration not configured</h1>", {
        status: 500,
        headers: { "Content-Type": "text/html" },
      });
    }

    // Check if redirect flow
    const stateParts = stateParam.split(":");
    const isRedirectFlow = stateParts.length >= 4 && stateParts[1] === "redirect";

    if (isRedirectFlow) {
      // Server-side token exchange for redirect flow
      const codeVerifier = stateParts[2];
      const userToken = stateParts.slice(3).join(":");

      try {
        const tokenRes = await fetch("https://myanimelist.net/v1/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code: code!,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier,
          }),
        });

        const tokenData = await tokenRes.json();

        if (!tokenData.access_token) {
          return Response.redirect(
            `${allowedOrigin}/settings?oauth_error=${encodeURIComponent("Failed to get MAL token")}`,
            302
          );
        }

        // Fetch MAL user info
        const userRes = await fetch("https://api.myanimelist.net/v2/users/@me", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const malUser = await userRes.json();

        // Save linked account
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
              provider: "mal",
              provider_user_id: String(malUser.id),
              provider_username: malUser.name,
              access_token: tokenData.access_token,
              refresh_token: tokenData.refresh_token || null,
              token_expires_at: tokenData.expires_in
                ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
                : null,
            },
            { onConflict: "user_id,provider" }
          );

        return Response.redirect(
          `${allowedOrigin}/settings?oauth_success=mal&username=${encodeURIComponent(malUser.name)}`,
          302
        );
      } catch (err) {
        return Response.redirect(
          `${allowedOrigin}/settings?oauth_error=${encodeURIComponent(err.message)}`,
          302
        );
      }
    }

    // Popup flow: postMessage back to opener
    const safeOrigin = allowedOrigin.replace(/[<>"'&]/g, '');
    const safeCode = String(code).replace(/[<>"'&]/g, '');

    const postMessageScript = allowedOrigin
      ? `window.opener.postMessage(payload, '${safeOrigin}');`
      : `window.opener.postMessage(payload, '*');`;

    return new Response(
      `<html><body>
        <h1>Connecting to MyAnimeList...</h1>
        <p>Processing authorization code...</p>
        <script>
          if (window.opener) {
            var payload = {
              type: 'mal-oauth-code',
              code: '${safeCode}'
            };
            ${postMessageScript}
          }
          setTimeout(function() { window.close(); }, 2000);
        </script>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  }

  // Step 3: Exchange code for token (called from frontend with code_verifier - popup flow)
  if (req.method === "POST" && url.searchParams.get("action") === "exchange") {
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

    const clientId = Deno.env.get("MAL_CLIENT_ID")!;
    const clientSecret = Deno.env.get("MAL_CLIENT_SECRET")!;
    const redirectUri = `${Deno.env.get("SUPABASE_URL")}/functions/v1/mal-oauth-callback`;

    try {
      const tokenRes = await fetch("https://myanimelist.net/v1/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: body.code,
          redirect_uri: redirectUri,
          code_verifier: body.codeVerifier,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenData.access_token) {
        return new Response(
          JSON.stringify({ error: "Failed to get token", details: tokenData }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const userRes = await fetch("https://api.myanimelist.net/v2/users/@me", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const malUser = await userRes.json();

      const { data, error } = await supabase
        .from("linked_accounts")
        .upsert(
          {
            user_id: userId,
            provider: "mal",
            provider_user_id: String(malUser.id),
            provider_username: malUser.name,
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token || null,
            token_expires_at: tokenData.expires_in
              ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
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

      return new Response(
        JSON.stringify({
          success: true,
          username: malUser.name,
          data,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ error: err.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});