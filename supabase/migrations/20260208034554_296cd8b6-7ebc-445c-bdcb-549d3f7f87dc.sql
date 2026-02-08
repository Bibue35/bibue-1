
-- Create linked_accounts table for storing OAuth tokens from AniList/MAL
CREATE TABLE public.linked_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  provider text NOT NULL, -- 'anilist' or 'mal'
  provider_user_id text NOT NULL,
  provider_username text,
  access_token text NOT NULL,
  refresh_token text,
  token_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id, provider)
);

-- Enable RLS
ALTER TABLE public.linked_accounts ENABLE ROW LEVEL SECURITY;

-- Users can only see their own linked accounts
CREATE POLICY "Users can view their own linked accounts"
  ON public.linked_accounts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can link their own accounts
CREATE POLICY "Users can link their own accounts"
  ON public.linked_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own linked accounts (token refresh)
CREATE POLICY "Users can update their own linked accounts"
  ON public.linked_accounts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can unlink their own accounts
CREATE POLICY "Users can unlink their own accounts"
  ON public.linked_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-update updated_at
CREATE TRIGGER update_linked_accounts_updated_at
  BEFORE UPDATE ON public.linked_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
