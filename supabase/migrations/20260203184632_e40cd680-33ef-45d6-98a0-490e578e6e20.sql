-- Phase 1: Complete Community Database Schema

-- 1. Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- 2. Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view all roles" ON public.user_roles
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create user_follows table
CREATE TABLE public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL,
  following_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view follows" ON public.user_follows
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can follow others" ON public.user_follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow" ON public.user_follows
  FOR DELETE USING (auth.uid() = follower_id);

-- 4. Create user_reputation table
CREATE TABLE public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  karma INTEGER NOT NULL DEFAULT 0,
  posts_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reputation" ON public.user_reputation
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System updates reputation" ON public.user_reputation
  FOR ALL USING (auth.uid() = user_id);

-- 5. Create badges table
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'primary',
  category TEXT NOT NULL DEFAULT 'general',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view badges" ON public.badges
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON public.badges
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 6. Create user_badges table
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view user badges" ON public.user_badges
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can award badges" ON public.user_badges
  FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 7. Create direct_messages table
CREATE TABLE public.direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (sender_id != recipient_id)
);

ALTER TABLE public.direct_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their messages" ON public.direct_messages
  FOR SELECT USING (auth.uid() IN (sender_id, recipient_id));

CREATE POLICY "Users can send messages" ON public.direct_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete their sent messages" ON public.direct_messages
  FOR DELETE USING (auth.uid() = sender_id);

-- 8. Create community_polls table
CREATE TABLE public.community_polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  options JSONB NOT NULL DEFAULT '[]',
  ends_at TIMESTAMPTZ,
  is_multiple_choice BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.community_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view polls" ON public.community_polls
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can create polls" ON public.community_polls
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their polls" ON public.community_polls
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their polls" ON public.community_polls
  FOR DELETE USING (auth.uid() = user_id);

-- 9. Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID NOT NULL REFERENCES public.community_polls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  option_index INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (poll_id, user_id, option_index)
);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view poll votes" ON public.poll_votes
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can vote" ON public.poll_votes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can change vote" ON public.poll_votes
  FOR DELETE USING (auth.uid() = user_id);

-- 10. Create user_bans table
CREATE TABLE public.user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Mods can view bans" ON public.user_bans
  FOR SELECT USING (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator') OR
    auth.uid() = user_id
  );

CREATE POLICY "Mods can create bans" ON public.user_bans
  FOR INSERT WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'moderator')
  );

CREATE POLICY "Admins can remove bans" ON public.user_bans
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- 11. Add bio and display_name to profiles
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS display_name TEXT,
  ADD COLUMN IF NOT EXISTS banner_url TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- 12. Create indexes for performance
CREATE INDEX idx_user_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following ON public.user_follows(following_id);
CREATE INDEX idx_direct_messages_sender ON public.direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient ON public.direct_messages(recipient_id);
CREATE INDEX idx_user_reputation_karma ON public.user_reputation(karma DESC);
CREATE INDEX idx_user_bans_user ON public.user_bans(user_id);

-- 13. Insert default badges
INSERT INTO public.badges (name, description, icon, color, category, requirement_type, requirement_value) VALUES
  ('First Post', 'Created your first discussion', 'MessageSquare', 'blue', 'engagement', 'posts', 1),
  ('Conversationalist', 'Posted 10 discussions', 'MessageCircle', 'green', 'engagement', 'posts', 10),
  ('Community Pillar', 'Posted 100 discussions', 'Award', 'purple', 'engagement', 'posts', 100),
  ('Helpful', 'Received 10 helpful votes', 'ThumbsUp', 'yellow', 'reputation', 'helpful_votes', 10),
  ('Top Contributor', 'Reached 1000 karma', 'Star', 'orange', 'reputation', 'karma', 1000),
  ('Anime Expert', 'Watched 100+ anime', 'Tv', 'pink', 'activity', 'anime_watched', 100),
  ('Manga Collector', 'Read 50+ manga', 'BookOpen', 'cyan', 'activity', 'manga_read', 50),
  ('Early Adopter', 'Joined during beta', 'Zap', 'amber', 'special', 'early_adopter', 1),
  ('Verified', 'Verified community member', 'BadgeCheck', 'primary', 'special', 'verified', 1),
  ('Moderator', 'Community moderator', 'Shield', 'red', 'role', 'moderator', 1);

-- 14. Update updated_at triggers
CREATE TRIGGER update_user_reputation_updated_at
  BEFORE UPDATE ON public.user_reputation
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_polls_updated_at
  BEFORE UPDATE ON public.community_polls
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();