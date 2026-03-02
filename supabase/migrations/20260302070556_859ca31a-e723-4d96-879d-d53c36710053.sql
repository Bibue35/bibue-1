
-- Add referral fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by TEXT;

-- Auto-generate referral codes for existing users
UPDATE public.profiles 
SET referral_code = 'BIBUE-' || UPPER(SUBSTR(MD5(RANDOM()::text || user_id::text), 1, 6))
WHERE referral_code IS NULL;

-- Create function to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'BIBUE-' || UPPER(SUBSTR(MD5(RANDOM()::text || NEW.user_id::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger to auto-generate referral code
DROP TRIGGER IF EXISTS generate_profile_referral_code ON public.profiles;
CREATE TRIGGER generate_profile_referral_code
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.generate_user_referral_code();

-- User referrals tracking table
CREATE TABLE IF NOT EXISTS public.user_referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'signed_up',
  coins_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referred_id)
);

ALTER TABLE public.user_referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
ON public.user_referrals FOR SELECT
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "System can insert referrals"
ON public.user_referrals FOR INSERT
WITH CHECK (auth.uid() = referred_id);

CREATE POLICY "System can update referrals"
ON public.user_referrals FOR UPDATE
USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- Referral rewards ledger
CREATE TABLE IF NOT EXISTS public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID REFERENCES public.user_referrals(id),
  reward_type TEXT NOT NULL DEFAULT 'coins',
  amount INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own rewards"
ON public.referral_rewards FOR SELECT
USING (auth.uid() = user_id);

-- User coins balance table
CREATE TABLE IF NOT EXISTS public.user_coins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  balance INTEGER NOT NULL DEFAULT 0,
  lifetime_earned INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.user_coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coins"
ON public.user_coins FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coins"
ON public.user_coins FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Referral leaderboard view (public, monthly + all-time)
CREATE OR REPLACE VIEW public.referral_leaderboard AS
SELECT 
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  COUNT(ur.id) AS total_referrals,
  COALESCE(SUM(ur.coins_earned), 0) AS total_coins_earned,
  COUNT(CASE WHEN ur.created_at >= date_trunc('month', now()) THEN 1 END) AS monthly_referrals,
  COALESCE(SUM(CASE WHEN ur.created_at >= date_trunc('month', now()) THEN ur.coins_earned ELSE 0 END), 0) AS monthly_coins
FROM public.profiles p
LEFT JOIN public.user_referrals ur ON ur.referrer_id = p.user_id
GROUP BY p.user_id, p.username, p.display_name, p.avatar_url
HAVING COUNT(ur.id) > 0
ORDER BY total_coins_earned DESC;

-- Updated_at trigger for user_referrals
CREATE TRIGGER update_user_referrals_updated_at
BEFORE UPDATE ON public.user_referrals
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
