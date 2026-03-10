
-- Aggregated view counts table (public readable)
CREATE TABLE public.media_view_counts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'manga',
  view_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (media_id, media_type)
);

ALTER TABLE public.media_view_counts ENABLE ROW LEVEL SECURITY;

-- Anyone can read view counts (public data)
CREATE POLICY "Anyone can view counts"
  ON public.media_view_counts FOR SELECT
  TO public
  USING (true);

-- Authenticated users can insert (for first view)
CREATE POLICY "Authenticated can insert view counts"
  ON public.media_view_counts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated users can update (increment)
CREATE POLICY "Authenticated can update view counts"
  ON public.media_view_counts FOR UPDATE
  TO authenticated
  USING (true);

-- Atomic increment function
CREATE OR REPLACE FUNCTION public.increment_view_count(p_media_id INTEGER, p_media_type TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.media_view_counts (media_id, media_type, view_count, updated_at)
  VALUES (p_media_id, p_media_type, 1, now())
  ON CONFLICT (media_id, media_type)
  DO UPDATE SET view_count = media_view_counts.view_count + 1, updated_at = now();
END;
$$;
