
-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'anime',
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
ON public.notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.notifications FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
ON public.notifications FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
ON public.notifications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Index for fast user lookups
CREATE INDEX idx_notifications_user_id ON public.notifications (user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON public.notifications (user_id, is_read) WHERE is_read = false;

-- Create notification preferences table
CREATE TABLE public.notification_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'anime',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, media_id, media_type)
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
ON public.notification_preferences FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON public.notification_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON public.notification_preferences FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences"
ON public.notification_preferences FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_notification_prefs_user ON public.notification_preferences (user_id);

-- Add notification settings columns to user_preferences
ALTER TABLE public.user_preferences
ADD COLUMN IF NOT EXISTS notify_new_episodes BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_new_chapters BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS notify_season_announcements BOOLEAN DEFAULT true;
