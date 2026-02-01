-- Create table for content reports
CREATE TABLE public.content_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('manga', 'anime')),
  content_id INTEGER NOT NULL,
  content_title TEXT NOT NULL,
  report_type TEXT NOT NULL CHECK (report_type IN ('wrong_image', 'wrong_title', 'wrong_synopsis', 'wrong_rating', 'other')),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id, report_type)
);

-- Enable Row Level Security
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create reports"
ON public.content_reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports"
ON public.content_reports
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_content_reports_updated_at
BEFORE UPDATE ON public.content_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();