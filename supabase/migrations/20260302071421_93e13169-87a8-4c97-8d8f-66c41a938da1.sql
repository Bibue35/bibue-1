
-- Add launch_phase and founder tracking to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_founder boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS founder_tier text DEFAULT 'starter';

-- Add launch_phase flag to user_referrals for higher reward tracking
ALTER TABLE public.user_referrals ADD COLUMN IF NOT EXISTS is_launch_phase boolean NOT NULL DEFAULT true;
ALTER TABLE public.user_referrals ADD COLUMN IF NOT EXISTS reward_tier text DEFAULT 'standard';

-- Update the referral code generator to use FOUNDER format
CREATE OR REPLACE FUNCTION public.generate_user_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'BIBUE-FOUNDER-' || UPPER(SUBSTR(MD5(RANDOM()::text || NEW.user_id::text), 1, 6));
    NEW.is_founder := true;
  END IF;
  RETURN NEW;
END;
$$;

-- Add UPDATE policy on user_coins so we can distribute coins
CREATE POLICY "Users can update their own coins"
ON public.user_coins
FOR UPDATE
USING (auth.uid() = user_id);

-- Create a function to distribute referral coins (called by edge function with service role)
CREATE OR REPLACE FUNCTION public.distribute_referral_coins(
  p_user_id uuid,
  p_amount integer,
  p_description text DEFAULT 'Referral reward'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_coins (user_id, balance, lifetime_earned)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) DO UPDATE SET
    balance = user_coins.balance + p_amount,
    lifetime_earned = user_coins.lifetime_earned + p_amount,
    updated_at = now();
    
  -- Log as referral reward
  INSERT INTO public.referral_rewards (user_id, amount, reward_type, description)
  VALUES (p_user_id, p_amount, 'referral_coins', p_description);
END;
$$;

-- Update the referral code generator for creator_profiles too
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := 'BIBUE-FOUNDER-' || UPPER(SUBSTR(MD5(RANDOM()::text || NEW.id::text), 1, 6));
  END IF;
  RETURN NEW;
END;
$$;
