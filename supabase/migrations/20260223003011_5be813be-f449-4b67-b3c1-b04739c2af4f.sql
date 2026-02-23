-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON public.watchlist (user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_mal_id ON public.watchlist (mal_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_media ON public.watchlist (user_id, mal_id, media_type);
CREATE INDEX IF NOT EXISTS idx_watchlist_status ON public.watchlist (user_id, status);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs (user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_viewing_history_user_id ON public.viewing_history (user_id);
CREATE INDEX IF NOT EXISTS idx_viewing_history_viewed_at ON public.viewing_history (user_id, viewed_at DESC);

CREATE INDEX IF NOT EXISTS idx_episode_comments_anime ON public.episode_comments (anime_id, episode_number);
CREATE INDEX IF NOT EXISTS idx_discussions_category ON public.discussions (category);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON public.user_follows (follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON public.user_follows (following_id);

CREATE INDEX IF NOT EXISTS idx_direct_messages_recipient ON public.direct_messages (recipient_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_direct_messages_sender ON public.direct_messages (sender_id, created_at DESC);