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

// --- Token Encryption Helpers (AES-256-GCM) ---
async function getEncryptionKey(): Promise<CryptoKey> {
  const keyHex = Deno.env.get("TOKEN_ENCRYPTION_KEY");
  if (!keyHex || keyHex.length < 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY not configured or too short");
  }
  const keyBytes = new TextEncoder().encode(keyHex.slice(0, 32));
  return crypto.subtle.importKey("raw", keyBytes, "AES-GCM", false, ["encrypt", "decrypt"]);
}

async function encryptToken(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, encoded);
  const combined = new Uint8Array(iv.length + new Uint8Array(ciphertext).length);
  combined.set(iv);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return btoa(String.fromCharCode(...combined));
}
// --- End Encryption Helpers ---

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
    // MAL works best with "plain" PKCE: challenge = verifier
    const codeChallenge = codeVerifier;

    // Always use redirect flow - encode verifier + token in state
    const mode = url.searchParams.get("mode");
    const stateId = crypto.randomUUID();

    let state: string;
    if (mode === "redirect") {
      state = `${stateId}:redirect:${codeVerifier}:${token}`;
    } else {
      state = stateId;
    }

    const malAuthUrl =
      `https://myanimelist.net/v1/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&code_challenge=${codeChallenge}&code_challenge_method=plain`;

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
        const tokenBody = new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "authorization_code",
          code: code!,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        });
        
        const tokenRes = await fetch("https://myanimelist.net/v1/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: tokenBody,
        });

        const tokenText = await tokenRes.text();
        let tokenData;
        try { tokenData = JSON.parse(tokenText); } catch { tokenData = {}; }

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

        // Encrypt tokens before storage
        const encryptedAccessToken = await encryptToken(tokenData.access_token);
        const encryptedRefreshToken = tokenData.refresh_token
          ? await encryptToken(tokenData.refresh_token)
          : null;

        const userId = claims.claims.sub as string;
        await supabase
          .from("linked_accounts")
          .upsert(
            {
              user_id: userId,
              provider: "mal",
              provider_user_id: String(malUser.id),
              provider_username: malUser.name,
              access_token: encryptedAccessToken,
              refresh_token: encryptedRefreshToken,
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

    // Non-redirect flow: redirect with error (popup flow removed)
    if (allowedOrigin) {
      return Response.redirect(
        `${allowedOrigin}/settings?oauth_error=${encodeURIComponent("Please use redirect mode to connect")}`,
        302
      );
    }
    return new Response("<h1>Please use redirect mode</h1>", {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  return new Response(JSON.stringify({ error: "Method not allowed" }), {
    status: 405,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
