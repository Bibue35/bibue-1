
-- User-created lists
CREATE TABLE public.user_lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  slug text NOT NULL,
  is_public boolean NOT NULL DEFAULT true,
  likes_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- List entries (anime/manga in a list)
CREATE TABLE public.list_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  mal_id integer NOT NULL,
  media_type text NOT NULL DEFAULT 'anime',
  title text NOT NULL,
  image_url text,
  entry_type text, -- TV, Movie, OVA, etc.
  note text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- List likes
CREATE TABLE public.list_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES public.user_lists(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, user_id)
);

-- Enable RLS
ALTER TABLE public.user_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.list_likes ENABLE ROW LEVEL SECURITY;

-- user_lists policies
CREATE POLICY "Public lists viewable by all" ON public.user_lists
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own lists" ON public.user_lists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lists" ON public.user_lists
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lists" ON public.user_lists
  FOR DELETE USING (auth.uid() = user_id);

-- list_entries policies
CREATE POLICY "Entries viewable if list is accessible" ON public.list_entries
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_lists
      WHERE id = list_entries.list_id
      AND (is_public = true OR user_id = auth.uid())
    )
  );

CREATE POLICY "List owners can manage entries" ON public.list_entries
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_entries.list_id AND user_id = auth.uid())
  );

CREATE POLICY "List owners can update entries" ON public.list_entries
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_entries.list_id AND user_id = auth.uid())
  );

CREATE POLICY "List owners can delete entries" ON public.list_entries
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.user_lists WHERE id = list_entries.list_id AND user_id = auth.uid())
  );

-- list_likes policies
CREATE POLICY "Anyone can view likes" ON public.list_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can like lists" ON public.list_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike" ON public.list_likes
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update likes_count
CREATE OR REPLACE FUNCTION public.update_list_likes_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_lists SET likes_count = likes_count + 1 WHERE id = NEW.list_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_lists SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.list_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER on_list_like_change
  AFTER INSERT OR DELETE ON public.list_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_list_likes_count();

-- Updated_at trigger for user_lists
CREATE TRIGGER update_user_lists_updated_at
  BEFORE UPDATE ON public.user_lists
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for slug lookup
CREATE INDEX idx_user_lists_slug ON public.user_lists(slug);
CREATE INDEX idx_user_lists_user_id ON public.user_lists(user_id);
CREATE INDEX idx_list_entries_list_id ON public.list_entries(list_id);
