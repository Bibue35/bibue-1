
-- Add referral_code to creator_profiles
ALTER TABLE public.creator_profiles ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Generate referral codes for existing creators
UPDATE public.creator_profiles 
SET referral_code = 'BIBUE-' || UPPER(SUBSTR(MD5(RANDOM()::text || id::text), 1, 6))
WHERE referral_code IS NULL;

-- Create referrals tracking table
CREATE TABLE public.creator_referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id uuid NOT NULL,
  referred_user_id uuid NOT NULL,
  referral_code text NOT NULL,
  has_uploaded boolean NOT NULL DEFAULT false,
  bonus_activated_at timestamp with time zone,
  bonus_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(referred_user_id)
);

-- Enable RLS
ALTER TABLE public.creator_referrals ENABLE ROW LEVEL SECURITY;

-- Referrers can view their own referrals
CREATE POLICY "Referrers can view own referrals"
ON public.creator_referrals FOR SELECT
USING (referrer_id = auth.uid());

-- Referred users can view their own entry
CREATE POLICY "Referred users can view own entry"
ON public.creator_referrals FOR SELECT
USING (referred_user_id = auth.uid());

-- Authenticated users can insert (when signing up via referral)
CREATE POLICY "Authenticated users can create referral"
ON public.creator_referrals FOR INSERT
WITH CHECK (auth.uid() = referred_user_id);

-- System updates (bonus activation) by referrer or referred
CREATE POLICY "Users can update own referrals"
ON public.creator_referrals FOR UPDATE
USING (referrer_id = auth.uid() OR referred_user_id = auth.uid());

-- Admins can manage all
CREATE POLICY "Admins can manage referrals"
ON public.creator_referrals FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Auto-generate referral code on new creator profile
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'BIBUE-' || UPPER(SUBSTR(MD5(RANDOM()::text || NEW.id::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_referral_code
BEFORE INSERT ON public.creator_profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_referral_code();
