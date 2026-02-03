-- STRICT PRIVACY: Only public profiles visible to others
-- Remove the fallback that allowed all authenticated users to see all profiles

DROP POLICY IF EXISTS "Profiles are viewable respecting privacy" ON public.profiles;

CREATE POLICY "Profiles are viewable with strict privacy"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id  -- Users can always see their own profile
  OR is_public = true   -- Only public profiles are visible to others
);