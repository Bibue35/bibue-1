-- Add last_chapter_read column to watchlist to track reading progress
ALTER TABLE public.watchlist 
ADD COLUMN IF NOT EXISTS last_chapter_read integer DEFAULT NULL;

-- Add last_episode_watched column for anime as well
ALTER TABLE public.watchlist 
ADD COLUMN IF NOT EXISTS last_episode_watched integer DEFAULT NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_watchlist_reading_progress 
ON public.watchlist(user_id, mal_id, media_type);