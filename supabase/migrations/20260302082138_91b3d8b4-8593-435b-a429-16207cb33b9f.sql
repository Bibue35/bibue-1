
-- Table to cache AI translations of manga chapter pages
CREATE TABLE public.chapter_translations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id text NOT NULL,
  page_index integer NOT NULL,
  source_language text NOT NULL DEFAULT 'unknown',
  translated_text jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '30 days'),
  UNIQUE(chapter_id, page_index)
);

-- Enable RLS
ALTER TABLE public.chapter_translations ENABLE ROW LEVEL SECURITY;

-- Anyone can read cached translations (public feature)
CREATE POLICY "Anyone can view cached translations"
ON public.chapter_translations
FOR SELECT
USING (true);

-- Only service role / edge functions insert translations
-- We allow authenticated users to insert (the edge function handles rate limiting)
CREATE POLICY "Authenticated users can insert translations"
ON public.chapter_translations
FOR INSERT
WITH CHECK (true);

-- Index for fast lookups
CREATE INDEX idx_chapter_translations_lookup ON public.chapter_translations (chapter_id, page_index);

-- Table for tracking user translation usage (rate limiting)
CREATE TABLE public.translation_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  used_at timestamp with time zone NOT NULL DEFAULT now(),
  chapter_id text NOT NULL,
  pages_count integer NOT NULL DEFAULT 0
);

ALTER TABLE public.translation_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own usage"
ON public.translation_usage
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
ON public.translation_usage
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_translation_usage_user ON public.translation_usage (user_id, used_at);
