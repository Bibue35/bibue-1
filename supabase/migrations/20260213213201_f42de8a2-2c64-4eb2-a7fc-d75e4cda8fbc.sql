
-- Table to store user public keys for E2E encryption
CREATE TABLE public.user_encryption_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  public_key text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_encryption_keys ENABLE ROW LEVEL SECURITY;

-- Users can view any public key (needed to encrypt messages to others)
CREATE POLICY "Anyone authenticated can view public keys"
ON public.user_encryption_keys FOR SELECT
USING (auth.role() = 'authenticated');

-- Users can insert their own key
CREATE POLICY "Users can insert their own key"
ON public.user_encryption_keys FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own key
CREATE POLICY "Users can update their own key"
ON public.user_encryption_keys FOR UPDATE
USING (auth.uid() = user_id);

-- Add encryption columns to direct_messages
ALTER TABLE public.direct_messages
ADD COLUMN is_encrypted boolean NOT NULL DEFAULT false,
ADD COLUMN encryption_metadata jsonb DEFAULT NULL;

-- Trigger for updated_at
CREATE TRIGGER update_user_encryption_keys_updated_at
BEFORE UPDATE ON public.user_encryption_keys
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
