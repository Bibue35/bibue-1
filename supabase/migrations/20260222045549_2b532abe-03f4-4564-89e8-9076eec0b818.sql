-- Fix: Add explicit SELECT policy to dmca_requests so only admins can read PII
-- Currently only INSERT (anyone) and ALL (admin) policies exist.
-- The ALL policy covers admin SELECT, but we need to ensure non-admins cannot SELECT.
-- Adding a restrictive SELECT policy that only allows admins.

CREATE POLICY "Only admins can view DMCA requests"
ON public.dmca_requests FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));