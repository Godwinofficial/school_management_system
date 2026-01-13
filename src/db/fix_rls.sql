-- Fix RLS Policies
-- First, drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable all access for now" ON public.schools;
DROP POLICY IF EXISTS "Enable all access for now" ON public.teachers;
DROP POLICY IF EXISTS "Enable all access for now" ON public.classes;
DROP POLICY IF EXISTS "Enable all access for now" ON public.subjects;
DROP POLICY IF EXISTS "Enable all access for now" ON public.students;
DROP POLICY IF EXISTS "Enable all access for now" ON public.profiles;

-- Ensure RLS is enabled
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Re-create permissive policies
CREATE POLICY "Enable all access for now" ON public.schools FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.classes FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.subjects FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.students FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.profiles FOR ALL USING (true);
