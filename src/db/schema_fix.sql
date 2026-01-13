-- Force add missing columns and reload cache
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS created_by text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS subscription_plan_id text DEFAULT 'trial';

-- Reload Supabase API schema cache
NOTIFY pgrst, 'reload schema';
