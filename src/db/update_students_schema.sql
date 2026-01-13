-- Add JSONB columns for complex student data
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_guardian jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS emergency_contact jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS medical_info jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS previous_school text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS place_of_birth text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nationality text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS religion text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS documents jsonb;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS school_id text;

-- Ensure RLS is open for now
DROP POLICY IF EXISTS "Enable all access for now" ON public.students;
CREATE POLICY "Enable all access for now" ON public.students FOR ALL USING (true);
