
CREATE TABLE public.user_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  media_id INTEGER NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'manga',
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, media_id, media_type)
);

ALTER TABLE public.user_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own scores"
  ON public.user_scores FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own scores"
  ON public.user_scores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scores"
  ON public.user_scores FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own scores"
  ON public.user_scores FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
