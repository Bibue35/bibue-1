import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DAILY_LIMIT = 5; // free translations per day

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { chapterId, pageIndex, imageUrl, userId } = await req.json();

    if (!chapterId || pageIndex === undefined || !imageUrl) {
      return json({ error: "Missing chapterId, pageIndex, or imageUrl" }, 400);
    }

    // 1. Check cache first
    const { data: cached } = await supabase
      .from("chapter_translations")
      .select("translated_text, source_language")
      .eq("chapter_id", chapterId)
      .eq("page_index", pageIndex)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (cached) {
      return json({ 
        translated: cached.translated_text, 
        sourceLanguage: cached.source_language,
        fromCache: true 
      });
    }

    // 2. Rate limit check (if userId provided)
    if (userId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count } = await supabase
        .from("translation_usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("used_at", oneDayAgo);

      if ((count || 0) >= DAILY_LIMIT) {
        return json({ 
          error: "Daily translation limit reached (5/day). Upgrade to Premium for unlimited.", 
          rateLimited: true 
        }, 429);
      }
    }

    // 3. Call Gemini Vision to extract and translate text
    const response = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are a professional manga/manhwa/manhua translator. Analyze the manga page image and:
1. Detect ALL text in speech bubbles, thought bubbles, narration boxes, and sound effects
2. Identify the source language
3. Translate everything to natural, high-quality English
4. Keep honorifics (san, kun, chan, senpai, etc.) and cultural terms
5. Preserve manga reading style and tone
6. For sound effects, provide both transliteration and English meaning

Return a JSON object with this exact structure:
{
  "sourceLanguage": "ja",
  "bubbles": [
    {
      "id": 1,
      "type": "speech|thought|narration|sfx",
      "original": "original text",
      "translated": "English translation",
      "position": {"x": 0.5, "y": 0.3},
      "size": "small|medium|large"
    }
  ]
}

Position x and y are normalized 0-1 coordinates representing where the text appears on the page (0,0 = top-left, 1,1 = bottom-right).
Return ONLY the JSON, no markdown formatting.`
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Translate all text in this manga page to English. Return the JSON structure as specified."
              },
              {
                type: "image_url",
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return json({ error: "AI rate limit exceeded, please try again later.", rateLimited: true }, 429);
      }
      if (response.status === 402) {
        return json({ error: "AI credits exhausted.", rateLimited: true }, 402);
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return json({ error: "Translation failed" }, 500);
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content || "";

    // Parse the JSON response
    let parsed;
    try {
      // Strip markdown code block if present
      const cleaned = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      return json({ error: "Translation parsing failed", rawResponse: content }, 500);
    }

    const translatedData = {
      sourceLanguage: parsed.sourceLanguage || "unknown",
      bubbles: parsed.bubbles || [],
    };

    // 4. Cache the result
    await supabase
      .from("chapter_translations")
      .upsert({
        chapter_id: chapterId,
        page_index: pageIndex,
        source_language: translatedData.sourceLanguage,
        translated_text: translatedData.bubbles,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, { onConflict: "chapter_id,page_index" });

    // 5. Log usage
    if (userId) {
      await supabase
        .from("translation_usage")
        .insert({ user_id: userId, chapter_id: chapterId, pages_count: 1 });
    }

    return json({ 
      translated: translatedData.bubbles, 
      sourceLanguage: translatedData.sourceLanguage,
      fromCache: false 
    });

  } catch (error) {
    console.error("translate-manga-page error:", error);
    return json({ error: error.message || "Internal error" }, 500);
  }
});
