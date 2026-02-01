-- Drop the existing overly-permissive SELECT policy
DROP POLICY IF EXISTS "Activity logs are viewable by authenticated users" ON public.activity_logs;

-- Create a new SELECT policy that respects user privacy settings
-- Users can always see their own activity logs
-- Other users' logs are only visible if they haven't enabled hide_activity or incognito_mode
CREATE POLICY "Users can view activity logs respecting privacy settings"
ON public.activity_logs
FOR SELECT
USING (
  auth.uid() = user_id 
  OR (
    auth.role() = 'authenticated'
    AND NOT EXISTS (
      SELECT 1 FROM public.user_preferences 
      WHERE user_preferences.user_id = activity_logs.user_id 
      AND (hide_activity = true OR incognito_mode = true)
    )
  )
);