
-- Fix security definer view - recreate as security invoker
DROP VIEW IF EXISTS public.referral_leaderboard;

CREATE VIEW public.referral_leaderboard
WITH (security_invoker = true)
AS
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
