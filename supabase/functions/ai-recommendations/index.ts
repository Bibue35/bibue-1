import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { watchlist } = await req.json();

    if (!watchlist || watchlist.length < 5) {
      return new Response(JSON.stringify({ error: "Need at least 5 rated anime" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build a concise summary of user's ratings
    const ratedItems = watchlist
      .filter((item: any) => item.score && item.score > 0)
      .sort((a: any, b: any) => (b.score || 0) - (a.score || 0))
      .slice(0, 20)
      .map((item: any) => `${item.title} (${item.score}/10, ${item.status || "watching"})`)
      .join("\n");

    const allTitles = watchlist.map((item: any) => item.title.toLowerCase());

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `You are an anime recommendation expert. Based on the user's rated anime list, suggest 6 anime they haven't watched yet. For each recommendation, provide:
1. The exact title (use the most common English/Romaji title)
2. A personalized explanation (2-3 sentences) connecting it to anime they loved, mentioning specific titles they rated highly
3. A match percentage (70-98%)

CRITICAL RULES:
- Do NOT recommend anything already in their list
- Be specific about WHY they'd like it based on their ratings
- Mix well-known and hidden gems
- Consider genres, themes, and storytelling styles they prefer

Respond ONLY with valid JSON in this format:
{
  "recommendations": [
    {
      "title": "Anime Title",
      "explanation": "Because you rated X a 10/10...",
      "match_percentage": 92
    }
  ]
}`
          },
          {
            role: "user",
            content: `Here are my anime ratings:\n${ratedItems}\n\nI have ${watchlist.length} total anime in my library. Please recommend 6 anime I should watch next.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);
    } catch {
      console.error("Failed to parse AI response:", content);
      return new Response(JSON.stringify({ error: "Failed to parse recommendations" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Filter out any that are already in watchlist
    const filtered = (parsed.recommendations || []).filter(
      (rec: any) => !allTitles.includes(rec.title.toLowerCase())
    );

    return new Response(JSON.stringify({ recommendations: filtered }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-recommendations error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
