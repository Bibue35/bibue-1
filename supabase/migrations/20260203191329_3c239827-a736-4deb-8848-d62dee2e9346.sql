-- ===========================================
-- PHASE 2: Reputation Triggers & Badge System
-- ===========================================

-- Function to initialize user reputation on first action
CREATE OR REPLACE FUNCTION public.ensure_user_reputation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Add unique constraint on user_reputation.user_id if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'user_reputation_user_id_key'
  ) THEN
    ALTER TABLE public.user_reputation ADD CONSTRAINT user_reputation_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Function to increment posts count when user creates a discussion
CREATE OR REPLACE FUNCTION public.increment_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id, posts_count, karma)
  VALUES (NEW.user_id, 1, 5)
  ON CONFLICT (user_id) DO UPDATE SET
    posts_count = user_reputation.posts_count + 1,
    karma = user_reputation.karma + 5,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to decrement posts count when user deletes a discussion
CREATE OR REPLACE FUNCTION public.decrement_posts_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_reputation SET
    posts_count = GREATEST(posts_count - 1, 0),
    karma = GREATEST(karma - 5, 0),
    updated_at = now()
  WHERE user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

-- Function to increment comments count
CREATE OR REPLACE FUNCTION public.increment_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_reputation (user_id, comments_count, karma)
  VALUES (NEW.user_id, 1, 2)
  ON CONFLICT (user_id) DO UPDATE SET
    comments_count = user_reputation.comments_count + 1,
    karma = user_reputation.karma + 2,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Function to decrement comments count
CREATE OR REPLACE FUNCTION public.decrement_comments_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.user_reputation SET
    comments_count = GREATEST(comments_count - 1, 0),
    karma = GREATEST(karma - 2, 0),
    updated_at = now()
  WHERE user_id = OLD.user_id;
  RETURN OLD;
END;
$$;

-- Function to award karma when receiving upvotes on comments
CREATE OR REPLACE FUNCTION public.update_helpful_votes_on_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  comment_owner_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Get the comment owner
    SELECT user_id INTO comment_owner_id 
    FROM public.episode_comments 
    WHERE id = NEW.comment_id;
    
    -- Update their reputation (only if not liking own comment)
    IF comment_owner_id IS NOT NULL AND comment_owner_id != NEW.user_id THEN
      INSERT INTO public.user_reputation (user_id, helpful_votes, karma)
      VALUES (comment_owner_id, 1, 3)
      ON CONFLICT (user_id) DO UPDATE SET
        helpful_votes = user_reputation.helpful_votes + 1,
        karma = user_reputation.karma + 3,
        updated_at = now();
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Get the comment owner
    SELECT user_id INTO comment_owner_id 
    FROM public.episode_comments 
    WHERE id = OLD.comment_id;
    
    IF comment_owner_id IS NOT NULL AND comment_owner_id != OLD.user_id THEN
      UPDATE public.user_reputation SET
        helpful_votes = GREATEST(helpful_votes - 1, 0),
        karma = GREATEST(karma - 3, 0),
        updated_at = now()
      WHERE user_id = comment_owner_id;
    END IF;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Function to check and award badges based on reputation milestones
CREATE OR REPLACE FUNCTION public.check_and_award_badges()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  badge_record RECORD;
BEGIN
  -- Loop through all badges and check if user qualifies
  FOR badge_record IN 
    SELECT * FROM public.badges 
    WHERE id NOT IN (
      SELECT badge_id FROM public.user_badges WHERE user_id = NEW.user_id
    )
  LOOP
    -- Check different requirement types
    IF badge_record.requirement_type = 'posts_count' AND NEW.posts_count >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
    ELSIF badge_record.requirement_type = 'comments_count' AND NEW.comments_count >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
    ELSIF badge_record.requirement_type = 'karma' AND NEW.karma >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
    ELSIF badge_record.requirement_type = 'helpful_votes' AND NEW.helpful_votes >= badge_record.requirement_value THEN
      INSERT INTO public.user_badges (user_id, badge_id) VALUES (NEW.user_id, badge_record.id);
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create triggers for discussions
DROP TRIGGER IF EXISTS on_discussion_created ON public.discussions;
CREATE TRIGGER on_discussion_created
  AFTER INSERT ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_posts_count();

DROP TRIGGER IF EXISTS on_discussion_deleted ON public.discussions;
CREATE TRIGGER on_discussion_deleted
  AFTER DELETE ON public.discussions
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_posts_count();

-- Create triggers for episode comments
DROP TRIGGER IF EXISTS on_comment_created ON public.episode_comments;
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.episode_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comments_count();

DROP TRIGGER IF EXISTS on_comment_deleted ON public.episode_comments;
CREATE TRIGGER on_comment_deleted
  AFTER DELETE ON public.episode_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comments_count();

-- Create triggers for discussion replies (also count as comments)
DROP TRIGGER IF EXISTS on_reply_created ON public.discussion_replies;
CREATE TRIGGER on_reply_created
  AFTER INSERT ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_comments_count();

DROP TRIGGER IF EXISTS on_reply_deleted ON public.discussion_replies;
CREATE TRIGGER on_reply_deleted
  AFTER DELETE ON public.discussion_replies
  FOR EACH ROW
  EXECUTE FUNCTION public.decrement_comments_count();

-- Create trigger for comment likes affecting reputation
DROP TRIGGER IF EXISTS on_comment_liked ON public.comment_likes;
CREATE TRIGGER on_comment_liked
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_helpful_votes_on_like();

-- Create trigger for automatic badge awarding
DROP TRIGGER IF EXISTS on_reputation_updated ON public.user_reputation;
CREATE TRIGGER on_reputation_updated
  AFTER INSERT OR UPDATE ON public.user_reputation
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_award_badges();

-- Insert default badges
INSERT INTO public.badges (name, description, icon, category, color, requirement_type, requirement_value) VALUES
  ('First Post', 'Created your first discussion post', 'MessageSquare', 'engagement', 'blue', 'posts_count', 1),
  ('Conversation Starter', 'Created 5 discussion posts', 'MessageCircle', 'engagement', 'green', 'posts_count', 5),
  ('Community Voice', 'Created 25 discussion posts', 'Megaphone', 'engagement', 'purple', 'posts_count', 25),
  ('First Comment', 'Left your first comment', 'MessageSquare', 'engagement', 'blue', 'comments_count', 1),
  ('Active Commenter', 'Left 10 comments', 'MessageCircle', 'engagement', 'green', 'comments_count', 10),
  ('Comment Champion', 'Left 50 comments', 'Award', 'engagement', 'gold', 'comments_count', 50),
  ('Helpful Member', 'Received 5 helpful votes', 'ThumbsUp', 'reputation', 'green', 'helpful_votes', 5),
  ('Community Helper', 'Received 25 helpful votes', 'Heart', 'reputation', 'red', 'helpful_votes', 25),
  ('Rising Star', 'Reached 50 karma points', 'Star', 'reputation', 'yellow', 'karma', 50),
  ('Community Legend', 'Reached 200 karma points', 'Crown', 'reputation', 'gold', 'karma', 200),
  ('Elite Member', 'Reached 500 karma points', 'Sparkles', 'reputation', 'purple', 'karma', 500)
ON CONFLICT DO NOTHING;

-- Allow system to insert reputation for any user (needed for triggers)
DROP POLICY IF EXISTS "System updates reputation" ON public.user_reputation;
CREATE POLICY "System can insert reputation"
  ON public.user_reputation FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update reputation"
  ON public.user_reputation FOR UPDATE
  USING (true);

-- Allow recipients to mark messages as read
DROP POLICY IF EXISTS "Recipients can mark as read" ON public.direct_messages;
CREATE POLICY "Recipients can mark as read"
  ON public.direct_messages FOR UPDATE
  USING (auth.uid() = recipient_id)
  WITH CHECK (auth.uid() = recipient_id);