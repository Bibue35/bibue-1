-- Fix security issue: Restrict discussions to authenticated users only
DROP POLICY IF EXISTS "Discussions are viewable by everyone" ON public.discussions;
CREATE POLICY "Discussions are viewable by authenticated users"
ON public.discussions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix security issue: Restrict discussion replies to authenticated users only
DROP POLICY IF EXISTS "Replies are viewable by everyone" ON public.discussion_replies;
CREATE POLICY "Replies are viewable by authenticated users"
ON public.discussion_replies
FOR SELECT
USING (auth.role() = 'authenticated');

-- Fix security issue: Restrict episode comments to authenticated users only
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.episode_comments;
CREATE POLICY "Comments are viewable by authenticated users"
ON public.episode_comments
FOR SELECT
USING (auth.role() = 'authenticated');