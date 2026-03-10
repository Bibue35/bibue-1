
-- Remove overly permissive policies since increment_view_count is SECURITY DEFINER
DROP POLICY "Authenticated can insert view counts" ON public.media_view_counts;
DROP POLICY "Authenticated can update view counts" ON public.media_view_counts;
