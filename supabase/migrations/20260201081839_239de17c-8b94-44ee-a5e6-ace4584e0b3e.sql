-- Create watchlist table for users to save anime/manga
CREATE TABLE public.watchlist (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mal_id INTEGER NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('anime', 'manga')),
  title TEXT NOT NULL,
  title_japanese TEXT,
  image_url TEXT,
  score DECIMAL(3,2),
  status TEXT DEFAULT 'plan_to_watch',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mal_id, media_type)
);

-- Enable Row Level Security
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own watchlist" 
ON public.watchlist 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can add to their own watchlist" 
ON public.watchlist 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own watchlist" 
ON public.watchlist 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can remove from their own watchlist" 
ON public.watchlist 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_watchlist_updated_at
BEFORE UPDATE ON public.watchlist
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();