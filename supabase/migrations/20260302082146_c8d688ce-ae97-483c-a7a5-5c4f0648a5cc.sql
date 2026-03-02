
-- Fix: restrict chapter_translations INSERT to authenticated users only
DROP POLICY "Authenticated users can insert translations" ON public.chapter_translations;
CREATE POLICY "Authenticated users can insert translations"
ON public.chapter_translations
FOR INSERT
WITH CHECK (auth.role() = 'authenticated');
