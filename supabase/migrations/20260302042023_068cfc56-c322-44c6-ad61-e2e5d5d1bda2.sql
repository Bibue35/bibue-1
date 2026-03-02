
-- Add original_image_url to chapter_pages so we store both versions
ALTER TABLE public.chapter_pages ADD COLUMN IF NOT EXISTS original_image_url text;

-- Add format_type to chapters to track whether standardized or original format is used
ALTER TABLE public.chapters ADD COLUMN IF NOT EXISTS format_type text NOT NULL DEFAULT 'standardized';

-- Add is_standardized flag to chapter_pages
ALTER TABLE public.chapter_pages ADD COLUMN IF NOT EXISTS is_standardized boolean NOT NULL DEFAULT true;
