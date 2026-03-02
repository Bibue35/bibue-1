
-- Chapter comments for Originals
CREATE TABLE public.chapter_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  likes integer NOT NULL DEFAULT 0,
  is_hidden boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_chapter_comments_chapter ON public.chapter_comments(chapter_id, created_at);

ALTER TABLE public.chapter_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view non-hidden comments
CREATE POLICY "Anyone can view visible comments"
ON public.chapter_comments FOR SELECT
USING (is_hidden = false);

-- Admins can view all (including hidden)
CREATE POLICY "Admins can view all comments"
ON public.chapter_comments FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));

-- Authenticated users can post
CREATE POLICY "Authenticated users can comment"
ON public.chapter_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can edit own comments
CREATE POLICY "Users can update own comments"
ON public.chapter_comments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete own, admins can delete any
CREATE POLICY "Users can delete own comments"
ON public.chapter_comments FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage comments"
ON public.chapter_comments FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Chapter comment likes
CREATE TABLE public.chapter_comment_likes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id uuid NOT NULL REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.chapter_comment_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chapter comment likes"
ON public.chapter_comment_likes FOR SELECT
USING (true);

CREATE POLICY "Users can like"
ON public.chapter_comment_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike"
ON public.chapter_comment_likes FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update likes count
CREATE OR REPLACE FUNCTION public.update_chapter_comment_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.chapter_comments SET likes = likes + 1 WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.chapter_comments SET likes = GREATEST(likes - 1, 0) WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER update_chapter_comment_likes
AFTER INSERT OR DELETE ON public.chapter_comment_likes
FOR EACH ROW
EXECUTE FUNCTION public.update_chapter_comment_likes_count();
