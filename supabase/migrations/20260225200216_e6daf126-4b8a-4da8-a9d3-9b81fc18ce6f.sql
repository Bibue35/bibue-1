
-- Payouts table for tracking creator payments
CREATE TABLE public.payouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  method TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Series analytics for monthly tracking
CREATE TABLE public.series_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- format: YYYY-MM
  views INTEGER NOT NULL DEFAULT 0,
  likes INTEGER NOT NULL DEFAULT 0,
  earnings NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(series_id, month)
);

-- Add total_earned to creator_profiles if not exists
ALTER TABLE public.creator_profiles
  ADD COLUMN IF NOT EXISTS total_earned NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payout_status TEXT NOT NULL DEFAULT 'none';

-- Enable RLS
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_analytics ENABLE ROW LEVEL SECURITY;

-- Payouts: Only admins can manage
CREATE POLICY "Admins can manage payouts"
  ON public.payouts FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Creators can view their own payouts
CREATE POLICY "Creators can view own payouts"
  ON public.payouts FOR SELECT
  USING (creator_id = auth.uid());

-- Series analytics: admins full access
CREATE POLICY "Admins can manage analytics"
  ON public.series_analytics FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Creators can view analytics for their own series
CREATE POLICY "Creators can view own series analytics"
  ON public.series_analytics FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.series
    WHERE series.id = series_analytics.series_id
    AND series.creator_id = auth.uid()
  ));

-- Triggers for updated_at
CREATE TRIGGER update_payouts_updated_at
  BEFORE UPDATE ON public.payouts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_series_analytics_updated_at
  BEFORE UPDATE ON public.series_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
