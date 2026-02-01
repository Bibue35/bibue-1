-- Fix 1: Prevent direct manipulation of likes field on episode_comments
-- Users can only update their comment content, not the likes count
DROP POLICY IF EXISTS "Users can update their own comments" ON public.episode_comments;

CREATE POLICY "Users can update their own comment content"
ON public.episode_comments
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create a trigger to prevent likes field from being updated directly
CREATE OR REPLACE FUNCTION public.prevent_likes_manipulation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If the likes field is being changed, reset it to the old value
  -- Likes should only be updated by the trigger from comment_likes table
  IF OLD.likes IS DISTINCT FROM NEW.likes THEN
    NEW.likes := OLD.likes;
  END IF;
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS prevent_likes_update ON public.episode_comments;

-- Create the trigger
CREATE TRIGGER prevent_likes_update
BEFORE UPDATE ON public.episode_comments
FOR EACH ROW
EXECUTE FUNCTION public.prevent_likes_manipulation();

-- Fix 2: Enhance handle_new_user function with stricter URL validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  safe_username TEXT;
  safe_avatar TEXT;
  raw_avatar TEXT;
BEGIN
  -- Sanitize username: trim, limit to 50 chars, use fallback if empty
  -- Also remove any potentially dangerous characters
  safe_username := regexp_replace(
    LEFT(COALESCE(NULLIF(TRIM(NEW.raw_user_meta_data->>'username'), ''), 'User'), 50),
    '[<>"'';&]', '', 'g'
  );
  
  -- Get raw avatar URL
  raw_avatar := NEW.raw_user_meta_data->>'avatar_url';
  
  -- Sanitize avatar_url: 
  -- 1. Must be HTTPS
  -- 2. Must be valid URL format
  -- 3. Limit to 500 chars
  -- 4. Allow only trusted OAuth provider domains
  safe_avatar := CASE 
    WHEN raw_avatar IS NOT NULL 
         AND LENGTH(raw_avatar) <= 500
         AND raw_avatar ~ '^https://[a-zA-Z0-9][-a-zA-Z0-9.]*\.[a-zA-Z]{2,}/'
         AND (
           -- Allow Google avatar domains
           raw_avatar ~ '^https://lh[0-9]*\.googleusercontent\.com/' OR
           -- Allow Apple avatar domains  
           raw_avatar ~ '^https://appleid\.cdn-apple\.com/' OR
           -- Allow GitHub avatar domains
           raw_avatar ~ '^https://avatars\.githubusercontent\.com/' OR
           -- Allow Gravatar
           raw_avatar ~ '^https://www\.gravatar\.com/' OR
           raw_avatar ~ '^https://secure\.gravatar\.com/' OR
           -- Allow common CDNs (for future use)
           raw_avatar ~ '^https://cdn\.discordapp\.com/' OR
           raw_avatar ~ '^https://i\.imgur\.com/'
         )
    THEN raw_avatar
    ELSE NULL 
  END;
  
  INSERT INTO public.profiles (user_id, username, avatar_url)
  VALUES (NEW.id, safe_username, safe_avatar);
  RETURN NEW;
END;
$$;