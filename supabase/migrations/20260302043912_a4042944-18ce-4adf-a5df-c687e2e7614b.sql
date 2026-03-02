
-- Add parent_id for nested replies and status for moderation
ALTER TABLE public.chapter_comments
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.chapter_comments(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'approved';

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_chapter_comments_parent_id ON public.chapter_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_status ON public.chapter_comments(status);
CREATE INDEX IF NOT EXISTS idx_chapter_comments_chapter_status ON public.chapter_comments(chapter_id, status);

-- Allow admins to delete comments (use IF NOT EXISTS pattern)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete comments' AND tablename = 'chapter_comments') THEN
    CREATE POLICY "Admins can delete comments"
      ON public.chapter_comments FOR DELETE
      USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update any comment' AND tablename = 'chapter_comments') THEN
    CREATE POLICY "Admins can update any comment"
      ON public.chapter_comments FOR UPDATE
      USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'moderator'::app_role));
  END IF;
END $$;
