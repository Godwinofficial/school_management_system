-- Add created_at column to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add email column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS email text;

-- Reload schema cache (notify Supabase)
NOTIFY pgrst, 'reload schema';
