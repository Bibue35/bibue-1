
-- Bridge Credits: track monthly credits per subscriber
CREATE TABLE public.bridge_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 15,
  credits_total INTEGER NOT NULL DEFAULT 15,
  period_start DATE NOT NULL DEFAULT date_trunc('month', now())::date,
  period_end DATE NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month' - interval '1 day')::date,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, period_start)
);

-- Bridge Titles: titles that can be voted on
CREATE TABLE public.bridge_titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  original_language TEXT NOT NULL DEFAULT 'japanese',
  author TEXT,
  cover_image_url TEXT,
  description TEXT,
  total_credits INTEGER NOT NULL DEFAULT 0,
  unique_voters INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  bridged_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Bridge Votes: individual votes
CREATE TABLE public.bridge_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title_id UUID NOT NULL REFERENCES public.bridge_titles(id) ON DELETE CASCADE,
  credits_spent INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Subscriptions: track active subs
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  price_cents INTEGER NOT NULL DEFAULT 899,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '1 month'),
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.bridge_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_titles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bridge_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- bridge_credits policies
CREATE POLICY "Users can view own credits" ON public.bridge_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage credits" ON public.bridge_credits FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- bridge_titles policies
CREATE POLICY "Anyone can view active titles" ON public.bridge_titles FOR SELECT USING (status IN ('active', 'bridged'));
CREATE POLICY "Admins can manage titles" ON public.bridge_titles FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- bridge_votes policies
CREATE POLICY "Users can view own votes" ON public.bridge_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can vote" ON public.bridge_votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can view all votes" ON public.bridge_votes FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));

-- subscriptions policies
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage subscriptions" ON public.subscriptions FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to spend a bridge credit and vote
CREATE OR REPLACE FUNCTION public.spend_bridge_credit(p_title_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_credits INTEGER;
  v_already_voted BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  -- Check subscription
  IF NOT EXISTS (SELECT 1 FROM public.subscriptions WHERE user_id = v_user_id AND status = 'active') THEN
    RETURN json_build_object('success', false, 'error', 'Active subscription required');
  END IF;

  -- Get credits for current month
  SELECT credits_remaining INTO v_credits
  FROM public.bridge_credits
  WHERE user_id = v_user_id AND period_start = date_trunc('month', now())::date;

  IF v_credits IS NULL OR v_credits < 1 THEN
    RETURN json_build_object('success', false, 'error', 'No credits remaining this month');
  END IF;

  -- Check if already voted on this title this month
  SELECT EXISTS(
    SELECT 1 FROM public.bridge_votes
    WHERE user_id = v_user_id AND title_id = p_title_id
    AND created_at >= date_trunc('month', now())
  ) INTO v_already_voted;

  -- Deduct credit
  UPDATE public.bridge_credits
  SET credits_remaining = credits_remaining - 1, updated_at = now()
  WHERE user_id = v_user_id AND period_start = date_trunc('month', now())::date;

  -- Insert vote
  INSERT INTO public.bridge_votes (user_id, title_id, credits_spent) VALUES (v_user_id, p_title_id, 1);

  -- Update title counters
  UPDATE public.bridge_titles
  SET total_credits = total_credits + 1,
      unique_voters = CASE WHEN NOT v_already_voted THEN unique_voters + 1 ELSE unique_voters END,
      updated_at = now()
  WHERE id = p_title_id;

  -- Check if title reached bridge threshold
  UPDATE public.bridge_titles
  SET status = 'bridged', bridged_at = now()
  WHERE id = p_title_id AND total_credits >= 50000 AND unique_voters >= 3000 AND status = 'active';

  RETURN json_build_object('success', true, 'credits_remaining', v_credits - 1);
END;
$$;
