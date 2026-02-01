-- Fix: SECURITY DEFINER function with input validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  safe_username TEXT;
  safe_avatar TEXT;
BEGIN
  -- Sanitize username: limit to 50 chars, use fallback if empty
  safe_username := LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), 'User'), 50);
  
  -- Sanitize avatar_url: limit to 500 chars, set NULL if too long or invalid
  safe_avatar := CASE 
    WHEN NEW.raw_user_meta_data->>'avatar_url' IS NOT NULL 
         AND LENGTH(NEW.raw_user_meta_data->>'avatar_url') <= 500 
    THEN NEW.raw_user_meta_data->>'avatar_url'
    ELSE NULL 
  END;
  
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (NEW.id, safe_username, safe_avatar);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users" 
ON public.profiles 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Fix: Restrict comment_likes to authenticated users only
DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON public.comment_likes;
CREATE POLICY "Comment likes are viewable by authenticated users" 
ON public.comment_likes 
FOR SELECT 
USING (auth.role() = 'authenticated');