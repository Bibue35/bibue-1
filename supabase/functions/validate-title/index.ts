import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check
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

    const body = await req.json();

    // Input validation
    const title = typeof body.title === "string" ? body.title.slice(0, 500) : "";
    const titleRomaji = typeof body.titleRomaji === "string" ? body.titleRomaji.slice(0, 500) : "";
    const titleEnglish = typeof body.titleEnglish === "string" ? body.titleEnglish.slice(0, 500) : "";
    const titleNative = typeof body.titleNative === "string" ? body.titleNative.slice(0, 500) : "";

    if (!title && !titleRomaji && !titleEnglish && !titleNative) {
      return new Response(JSON.stringify({ error: "At least one title field is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const prompt = `You are an anime/manga title verification expert. Verify the following title information and provide corrections if needed.

Title being displayed: "${title}"
Romaji title: "${titleRomaji || 'Not provided'}"
English title: "${titleEnglish || 'Not provided'}"
Native (Japanese) title: "${titleNative || 'Not provided'}"

Please verify:
1. Is the Romaji spelling correct?
2. Is the English title accurate?
3. Is the Japanese title correct?
4. Are there any common alternate titles or corrections needed?

Respond in JSON format with this structure:
{
  "isValid": true/false,
  "corrections": {
    "romaji": "corrected romaji if needed or null",
    "english": "corrected english if needed or null", 
    "native": "corrected native if needed or null"
  },
  "alternates": ["list of common alternate titles"],
  "notes": "any additional notes about the title"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are an expert on anime and manga titles. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI gateway error:", response.status);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    let validationResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        validationResult = JSON.parse(jsonMatch[0]);
      } else {
        validationResult = { isValid: true, notes: "Could not parse validation response" };
      }
    } catch {
      validationResult = { isValid: true, notes: "Validation completed but response parsing failed" };
    }

    return new Response(JSON.stringify(validationResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Title validation error:", error);
    return new Response(JSON.stringify({ 
      error: "An error occurred during validation",
      isValid: true
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
