import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are Seek — an opinionated anime and manga recommendation engine. The user describes a vibe, mood, trope, or feeling. You return 5-8 recommendations that genuinely match.

RULES:
- Only recommend REAL titles. Never invent or hallucinate titles.
- No spoilers. Match reasons must be spoiler-free.
- Be opinionated. Don't just list popular shows — pick titles that genuinely fit the vibe.
- Include a mix of well-known and hidden gems when possible.
- Each recommendation needs a 1-2 sentence "match reason" explaining WHY it fits what the user asked for.
- If the user specifies a content type, STRICTLY respect it:
  - "anime" = only anime
  - "manga" = only Japanese manga (country: Japan)
  - "manhwa" = only Korean manhwa (country: South Korea)
  - "manhua" = only Chinese manhua (country: China)
- When no filter is set, you can mix all types.
- IMPORTANT: Manga, manhwa, and manhua are DIFFERENT. Manga = Japan, Manhwa = South Korea, Manhua = China. Never mislabel them.

OUTPUT FORMAT — respond with a JSON array only, no markdown, no explanation outside the array:
[
  {
    "title": "Title Name",
    "type": "anime" | "manga" | "manhwa" | "manhua",
    "year": 2020,
    "genres": ["Action", "Fantasy"],
    "episodes": 24,
    "chapters": null,
    "score": 8.5,
    "matchReason": "Why this fits what the user asked for"
  }
]

For manga/manhwa/manhua, use "chapters" instead of "episodes". Set the unused field to null.
The "score" should be approximate (out of 10).
If unsure about exact episode/chapter count or year, give your best estimate.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, watchlist, contentType, conversationHistory } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(JSON.stringify({ error: "Prompt is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build messages
    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    // Add conversation history for follow-ups
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        messages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build user message with context
    let userMessage = prompt;
    if (contentType && contentType !== "all") {
      userMessage += `\n\nContent type filter: Only recommend ${contentType}.`;
    }
    if (watchlist && Array.isArray(watchlist) && watchlist.length > 0) {
      const titles = watchlist.slice(0, 50).join(", ");
      userMessage += `\n\nEXCLUDE these titles (user already has them): ${titles}`;
    }

    messages.push({ role: "user", content: userMessage });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "Failed to get recommendations" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response — handle markdown code blocks
    let recommendations;
    try {
      const jsonStr = content.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
      recommendations = JSON.parse(jsonStr);
    } catch {
      // Try to extract JSON array from the response
      const match = content.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          recommendations = JSON.parse(match[0]);
        } catch {
          console.error("Failed to parse AI response:", content);
          return new Response(JSON.stringify({ error: "Failed to parse recommendations", raw: content }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } else {
        console.error("No JSON array in AI response:", content);
        return new Response(JSON.stringify({ error: "Invalid response format", raw: content }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    return new Response(JSON.stringify({ recommendations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seek error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
