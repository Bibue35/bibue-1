-- Fix RLS policies for user_reputation to be more restrictive
-- The triggers use SECURITY DEFINER so they bypass RLS anyway

DROP POLICY IF EXISTS "System can insert reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "System can update reputation" ON public.user_reputation;

-- Users can only insert/update their own reputation (triggers bypass this with SECURITY DEFINER)
CREATE POLICY "Users can insert own reputation"
  ON public.user_reputation FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reputation"
  ON public.user_reputation FOR UPDATE
  USING (auth.uid() = user_id);