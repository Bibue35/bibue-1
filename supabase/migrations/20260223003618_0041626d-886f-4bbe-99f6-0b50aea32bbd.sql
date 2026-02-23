
-- Emoji reactions on anime/manga
CREATE TABLE public.media_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  media_id integer NOT NULL,
  media_type text NOT NULL,
  reaction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Unique: one reaction type per user per media
ALTER TABLE public.media_reactions ADD CONSTRAINT unique_user_media_reaction UNIQUE (user_id, media_id, media_type, reaction);
CREATE INDEX idx_media_reactions_media ON public.media_reactions (media_id, media_type);
CREATE INDEX idx_media_reactions_user ON public.media_reactions (user_id);

ALTER TABLE public.media_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reactions" ON public.media_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.media_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove reactions" ON public.media_reactions FOR DELETE USING (auth.uid() = user_id);

-- Watch party rooms
CREATE TABLE public.watch_parties (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  host_id uuid NOT NULL,
  title text NOT NULL,
  anime_id integer NOT NULL,
  anime_title text NOT NULL,
  anime_image text,
  current_episode integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'active',
  share_code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_watch_parties_share_code ON public.watch_parties (share_code);
CREATE INDEX idx_watch_parties_host ON public.watch_parties (host_id);

ALTER TABLE public.watch_parties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active parties" ON public.watch_parties FOR SELECT USING (status = 'active' OR host_id = auth.uid());
CREATE POLICY "Users can create parties" ON public.watch_parties FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts can update parties" ON public.watch_parties FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts can delete parties" ON public.watch_parties FOR DELETE USING (auth.uid() = host_id);

-- Watch party members
CREATE TABLE public.watch_party_members (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.watch_party_members ADD CONSTRAINT unique_party_member UNIQUE (party_id, user_id);

ALTER TABLE public.watch_party_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view members" ON public.watch_party_members FOR SELECT USING (true);
CREATE POLICY "Users can join" ON public.watch_party_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can leave" ON public.watch_party_members FOR DELETE USING (auth.uid() = user_id);

-- Watch party chat messages
CREATE TABLE public.watch_party_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  party_id uuid NOT NULL REFERENCES public.watch_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_party_messages_party ON public.watch_party_messages (party_id, created_at);

ALTER TABLE public.watch_party_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Party members can view messages" ON public.watch_party_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.watch_party_members WHERE party_id = watch_party_messages.party_id AND user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.watch_parties WHERE id = watch_party_messages.party_id AND host_id = auth.uid())
);
CREATE POLICY "Party members can send messages" ON public.watch_party_messages FOR INSERT WITH CHECK (
  auth.uid() = user_id AND (
    EXISTS (SELECT 1 FROM public.watch_party_members WHERE party_id = watch_party_messages.party_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.watch_parties WHERE id = watch_party_messages.party_id AND host_id = auth.uid())
  )
);

-- Enable realtime for watch party messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.watch_party_members;
