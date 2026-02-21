
-- Creator profiles table (extends user profiles with creator-specific data)
CREATE TABLE public.creator_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  bio text,
  avatar_url text,
  social_links jsonb DEFAULT '{}'::jsonb,
  guidelines_accepted_at timestamptz,
  is_verified boolean NOT NULL DEFAULT false,
  strike_count integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators can view own profile" ON public.creator_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view active creators" ON public.creator_profiles FOR SELECT USING (status = 'active');
CREATE POLICY "Creators can insert own profile" ON public.creator_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Creators can update own profile" ON public.creator_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage creators" ON public.creator_profiles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Series table
CREATE TABLE public.series (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES public.creator_profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  genre_tags text[] DEFAULT '{}',
  cover_image_url text,
  content_rating text NOT NULL DEFAULT 'everyone' CHECK (content_rating IN ('everyone', 'teen', 'mature')),
  language text NOT NULL DEFAULT 'japanese' CHECK (language IN ('japanese', 'korean', 'chinese', 'english')),
  reading_direction text NOT NULL DEFAULT 'rtl' CHECK (reading_direction IN ('rtl', 'ltr')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'suspended')),
  approved_chapters_count integer NOT NULL DEFAULT 0,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved series" ON public.series FOR SELECT USING (status = 'published' OR status = 'approved');
CREATE POLICY "Creators can view own series" ON public.series FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Creators can insert own series" ON public.series FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own series" ON public.series FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete own draft series" ON public.series FOR DELETE USING (creator_id = auth.uid() AND status = 'pending');
CREATE POLICY "Admins can manage all series" ON public.series FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Chapters table
CREATE TABLE public.chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id uuid NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  chapter_number integer NOT NULL,
  title text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'published')),
  rejection_reason text,
  scheduled_publish_at timestamptz,
  published_at timestamptz,
  page_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(series_id, chapter_number)
);

ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published chapters" ON public.chapters FOR SELECT USING (status = 'published');
CREATE POLICY "Creators can view own chapters" ON public.chapters FOR SELECT USING (creator_id = auth.uid());
CREATE POLICY "Creators can insert own chapters" ON public.chapters FOR INSERT WITH CHECK (creator_id = auth.uid());
CREATE POLICY "Creators can update own chapters" ON public.chapters FOR UPDATE USING (creator_id = auth.uid());
CREATE POLICY "Creators can delete own draft chapters" ON public.chapters FOR DELETE USING (creator_id = auth.uid() AND status = 'draft');
CREATE POLICY "Admins can manage all chapters" ON public.chapters FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- Chapter pages table
CREATE TABLE public.chapter_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  page_number integer NOT NULL,
  image_url text NOT NULL,
  original_filename text,
  file_size integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, page_number)
);

ALTER TABLE public.chapter_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pages visible if chapter visible" ON public.chapter_pages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chapters WHERE chapters.id = chapter_pages.chapter_id AND (chapters.status = 'published' OR chapters.creator_id = auth.uid()))
);
CREATE POLICY "Creators can insert pages" ON public.chapter_pages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chapters WHERE chapters.id = chapter_pages.chapter_id AND chapters.creator_id = auth.uid())
);
CREATE POLICY "Creators can update pages" ON public.chapter_pages FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.chapters WHERE chapters.id = chapter_pages.chapter_id AND chapters.creator_id = auth.uid())
);
CREATE POLICY "Creators can delete pages" ON public.chapter_pages FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.chapters WHERE chapters.id = chapter_pages.chapter_id AND chapters.creator_id = auth.uid())
);
CREATE POLICY "Admins can manage pages" ON public.chapter_pages FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Content moderation queue
CREATE TABLE public.content_moderation_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL CHECK (content_type IN ('series', 'chapter')),
  series_id uuid REFERENCES public.series(id) ON DELETE CASCADE,
  chapter_id uuid REFERENCES public.chapters(id) ON DELETE CASCADE,
  creator_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  flagged_reason text,
  reviewer_id uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_moderation_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view queue" ON public.content_moderation_queue FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "Admins can update queue" ON public.content_moderation_queue FOR UPDATE USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));
CREATE POLICY "System can insert queue" ON public.content_moderation_queue FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Creators can view own queue items" ON public.content_moderation_queue FOR SELECT USING (creator_id = auth.uid());

-- Creator chapter reports (reader flagging)
CREATE TABLE public.chapter_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id uuid NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  report_type text NOT NULL CHECK (report_type IN ('explicit_content', 'copyright', 'hate_speech', 'violence', 'spam', 'other')),
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(chapter_id, reporter_id)
);

ALTER TABLE public.chapter_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can report" ON public.chapter_reports FOR INSERT WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Users can view own reports" ON public.chapter_reports FOR SELECT USING (reporter_id = auth.uid());
CREATE POLICY "Admins can manage reports" ON public.chapter_reports FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

-- DMCA takedown requests
CREATE TABLE public.dmca_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  claimant_name text NOT NULL,
  claimant_email text NOT NULL,
  claimant_company text,
  content_url text NOT NULL,
  original_work_url text,
  description text NOT NULL,
  sworn_statement boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'taken_down', 'rejected', 'counter_notice')),
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.dmca_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit DMCA" ON public.dmca_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage DMCA" ON public.dmca_requests FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Storage bucket for creator uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('creator-uploads', 'creator-uploads', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view creator uploads" ON storage.objects FOR SELECT USING (bucket_id = 'creator-uploads');
CREATE POLICY "Creators can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'creator-uploads' AND auth.role() = 'authenticated');
CREATE POLICY "Creators can update own uploads" ON storage.objects FOR UPDATE USING (bucket_id = 'creator-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Creators can delete own uploads" ON storage.objects FOR DELETE USING (bucket_id = 'creator-uploads' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Triggers for updated_at
CREATE TRIGGER update_creator_profiles_updated_at BEFORE UPDATE ON public.creator_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON public.series FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chapters_updated_at BEFORE UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to auto-queue content for moderation
CREATE OR REPLACE FUNCTION public.auto_queue_series_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'pending' AND (TG_OP = 'INSERT' OR OLD.status != 'pending') THEN
    INSERT INTO public.content_moderation_queue (content_type, series_id, creator_id, flagged_reason)
    VALUES ('series', NEW.id, NEW.creator_id, 
      CASE WHEN NEW.content_rating = 'mature' THEN 'Mature content rating - requires extra review' ELSE NULL END
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_queue_series AFTER INSERT ON public.series FOR EACH ROW EXECUTE FUNCTION public.auto_queue_series_moderation();

-- Function to auto-queue chapters for moderation (first 3 need approval)
CREATE OR REPLACE FUNCTION public.auto_queue_chapter_moderation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  series_approved_count integer;
  series_rating text;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT approved_chapters_count, content_rating INTO series_approved_count, series_rating
    FROM public.series WHERE id = NEW.series_id;
    
    IF series_approved_count < 3 THEN
      INSERT INTO public.content_moderation_queue (content_type, series_id, chapter_id, creator_id, flagged_reason)
      VALUES ('chapter', NEW.series_id, NEW.id, NEW.creator_id,
        CASE WHEN series_rating = 'mature' THEN 'Mature series - requires extra review' ELSE NULL END
      );
    ELSE
      -- Auto-approve after 3 approved chapters
      UPDATE public.chapters SET status = 'published', published_at = now() WHERE id = NEW.id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER auto_queue_chapter AFTER INSERT OR UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.auto_queue_chapter_moderation();

-- Function to increment approved_chapters_count on series
CREATE OR REPLACE FUNCTION public.increment_approved_chapters()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS NULL OR OLD.status != 'approved') THEN
    UPDATE public.series SET approved_chapters_count = approved_chapters_count + 1 WHERE id = NEW.series_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER increment_approved_chapters_trigger AFTER UPDATE ON public.chapters FOR EACH ROW EXECUTE FUNCTION public.increment_approved_chapters();
