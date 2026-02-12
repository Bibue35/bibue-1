-- Create viewing history table to track what users have seen
CREATE TABLE public.viewing_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'anime',
  title TEXT NOT NULL,
  title_japanese TEXT,
  image_url TEXT,
  last_episode INTEGER,
  last_chapter INTEGER,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

-- Enable RLS
ALTER TABLE public.viewing_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own history
CREATE POLICY "Users can view their own history"
  ON public.viewing_history FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own history
CREATE POLICY "Users can create their own history"
  ON public.viewing_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own history (e.g. update viewed_at on revisit)
CREATE POLICY "Users can update their own history"
  ON public.viewing_history FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own history
CREATE POLICY "Users can delete their own history"
  ON public.viewing_history FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fast lookups by user
CREATE INDEX idx_viewing_history_user_viewed ON public.viewing_history (user_id, viewed_at DESC);