-- =====================================================
-- FIX 1: Activity logs privacy policy - use OR instead of AND
-- Users' activity should be hidden if EITHER privacy setting is enabled
-- =====================================================
DROP POLICY IF EXISTS "Users can view activity logs respecting privacy settings" ON public.activity_logs;

CREATE POLICY "Users can view activity logs respecting privacy settings"
ON public.activity_logs
FOR SELECT
USING (
  -- Users can always see their own activity
  auth.uid() = user_id 
  OR (
    -- Other authenticated users can see activity ONLY if user hasn't enabled ANY privacy setting
    auth.role() = 'authenticated'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_preferences 
      WHERE user_preferences.user_id = activity_logs.user_id 
      AND (hide_activity = true OR incognito_mode = true)  -- Hide if EITHER is true
    )
  )
);

-- =====================================================
-- FIX 2: Create voting tables with unique constraints
-- One vote per user per content item
-- =====================================================

-- Table for anime episode votes (different from comments - this is for rating episodes)
CREATE TABLE IF NOT EXISTS public.episode_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  anime_id INTEGER NOT NULL,
  episode_number INTEGER NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- One vote per user per episode
  CONSTRAINT unique_user_episode_vote UNIQUE (user_id, anime_id, episode_number)
);

ALTER TABLE public.episode_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view episode votes"
ON public.episode_votes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own episode votes"
ON public.episode_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own episode votes"
ON public.episode_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own episode votes"
ON public.episode_votes FOR DELETE
USING (auth.uid() = user_id);

-- Table for manga chapter votes
CREATE TABLE IF NOT EXISTS public.chapter_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  manga_id INTEGER NOT NULL,
  chapter_number INTEGER NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- One vote per user per chapter
  CONSTRAINT unique_user_chapter_vote UNIQUE (user_id, manga_id, chapter_number)
);

ALTER TABLE public.chapter_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chapter votes"
ON public.chapter_votes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own chapter votes"
ON public.chapter_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chapter votes"
ON public.chapter_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chapter votes"
ON public.chapter_votes FOR DELETE
USING (auth.uid() = user_id);

-- Table for general media votes (anime/manga as a whole)
CREATE TABLE IF NOT EXISTS public.media_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('anime', 'manga')),
  vote_type TEXT NOT NULL CHECK (vote_type IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- One vote per user per media item
  CONSTRAINT unique_user_media_vote UNIQUE (user_id, media_id, media_type)
);

ALTER TABLE public.media_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view media votes"
ON public.media_votes FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create their own media votes"
ON public.media_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own media votes"
ON public.media_votes FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own media votes"
ON public.media_votes FOR DELETE
USING (auth.uid() = user_id);

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_episode_votes_updated_at
BEFORE UPDATE ON public.episode_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapter_votes_updated_at
BEFORE UPDATE ON public.chapter_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_media_votes_updated_at
BEFORE UPDATE ON public.media_votes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();