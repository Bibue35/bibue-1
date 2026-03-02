
-- Studio submissions table for creator applications
CREATE TABLE public.studio_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  series_title TEXT NOT NULL,
  genre TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_url TEXT,
  chapter_urls TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.studio_submissions ENABLE ROW LEVEL SECURITY;

-- Anyone can submit (even unauthenticated for broader reach)
CREATE POLICY "Anyone can submit to studio"
  ON public.studio_submissions FOR INSERT
  WITH CHECK (true);

-- Submitters can view own submissions if authenticated
CREATE POLICY "Users can view own submissions"
  ON public.studio_submissions FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can do everything
CREATE POLICY "Admins can manage submissions"
  ON public.studio_submissions FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create updated_at trigger
CREATE TRIGGER update_studio_submissions_updated_at
  BEFORE UPDATE ON public.studio_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for studio uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('studio-uploads', 'studio-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can upload to studio-uploads
CREATE POLICY "Anyone can upload studio files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'studio-uploads');

-- Public read access
CREATE POLICY "Studio uploads are public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'studio-uploads');
