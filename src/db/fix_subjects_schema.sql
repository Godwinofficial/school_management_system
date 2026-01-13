-- Add missing columns to subjects table
ALTER TABLE public.subjects 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'Core',
ADD COLUMN IF NOT EXISTS school_id text REFERENCES public.schools(id) ON DELETE CASCADE;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
