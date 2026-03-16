CREATE TABLE public.subscription_wishlist (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  preferred_plan text NOT NULL DEFAULT 'monthly',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

ALTER TABLE public.subscription_wishlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can add themselves to wishlist"
  ON public.subscription_wishlist FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own wishlist entry"
  ON public.subscription_wishlist FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist entry"
  ON public.subscription_wishlist FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all wishlist entries"
  ON public.subscription_wishlist FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
