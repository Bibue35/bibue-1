-- First, remove any existing duplicate likes (keep the earliest one)
DELETE FROM public.comment_likes a
USING public.comment_likes b
WHERE a.id > b.id 
  AND a.user_id = b.user_id 
  AND a.comment_id = b.comment_id;

-- Add UNIQUE constraint to prevent duplicate likes at database level
ALTER TABLE public.comment_likes 
ADD CONSTRAINT unique_user_comment_like 
UNIQUE (user_id, comment_id);