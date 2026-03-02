
-- Series follows table
CREATE TABLE public.series_follows (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, series_id)
);

CREATE INDEX idx_series_follows_series ON public.series_follows(series_id);
CREATE INDEX idx_series_follows_user ON public.series_follows(user_id);

ALTER TABLE public.series_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view series follows"
ON public.series_follows FOR SELECT
USING (true);

CREATE POLICY "Users can follow series"
ON public.series_follows FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unfollow series"
ON public.series_follows FOR DELETE
USING (auth.uid() = user_id);

-- Trigger: notify followers when a chapter is published
CREATE OR REPLACE FUNCTION public.notify_followers_on_chapter_publish()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  series_title text;
  series_cover text;
  follower record;
BEGIN
  -- Only fire when status changes to 'published'
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    SELECT title, cover_image_url INTO series_title, series_cover
    FROM public.series WHERE id = NEW.series_id;

    -- Notify creator's user_follows followers
    FOR follower IN
      SELECT uf.follower_id FROM public.user_follows uf WHERE uf.following_id = NEW.creator_id
    LOOP
      INSERT INTO public.notifications (user_id, media_id, media_type, type, title, message, image_url)
      VALUES (
        follower.follower_id,
        0,
        'original',
        'new_chapter',
        'New Chapter',
        COALESCE(series_title, 'A series') || ' — Chapter ' || NEW.chapter_number || ' is now available!',
        series_cover
      );
    END LOOP;

    -- Notify series_follows followers
    FOR follower IN
      SELECT sf.user_id FROM public.series_follows sf WHERE sf.series_id = NEW.series_id AND sf.user_id != NEW.creator_id
    LOOP
      INSERT INTO public.notifications (user_id, media_id, media_type, type, title, message, image_url)
      VALUES (
        follower.user_id,
        0,
        'original',
        'new_chapter',
        'New Chapter',
        COALESCE(series_title, 'A series') || ' — Chapter ' || NEW.chapter_number || ' is now available!',
        series_cover
      )
      ON CONFLICT DO NOTHING;
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER notify_on_chapter_publish
AFTER INSERT OR UPDATE ON public.chapters
FOR EACH ROW
EXECUTE FUNCTION public.notify_followers_on_chapter_publish();
