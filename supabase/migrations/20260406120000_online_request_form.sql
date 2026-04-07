-- Add hod_email and source columns to requisitions for online form support
ALTER TABLE public.requisitions ADD COLUMN IF NOT EXISTS hod_email TEXT DEFAULT '';
ALTER TABLE public.requisitions ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'internal';

-- Allow anonymous (unauthenticated) users to INSERT requisitions
-- This enables the public online vacancy request form
CREATE POLICY "Anon users insert requisitions" ON public.requisitions
  FOR INSERT TO anon
  WITH CHECK (source = 'online');

-- Allow anonymous users to read nothing (insert-only access)
-- Authenticated users already have read/update access from prior migration
