-- Add email column to students table
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS email text;

-- Reload schema
NOTIFY pgrst, 'reload schema';
