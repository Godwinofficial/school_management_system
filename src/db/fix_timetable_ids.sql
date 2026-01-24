-- Comprehensive fix for ID types
-- The application uses string-based IDs (like 'school_slug_g1a' or '1') but the database
-- was set up with strict UUID types. This script migrates everything to TEXT.

BEGIN;

-- 1. Drop existing Foreign Key constraints that are blocking the change
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_class_id_fkey;
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_subject_id_fkey;

-- 2. Modify the referenced tables (classes and subjects) to use TEXT IDs
-- We use 'USING id::text' to convert any existing UUIDs to strings safely.
ALTER TABLE public.classes ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.subjects ALTER COLUMN id TYPE text USING id::text;

-- 3. Modify the timetables table to use TEXT for these columns
ALTER TABLE public.timetables ALTER COLUMN class_id TYPE text USING class_id::text;
ALTER TABLE public.timetables ALTER COLUMN subject_id TYPE text USING subject_id::text;

-- 4. Re-establish the Foreign Key constraints
-- Now that both sides are TEXT, this will work.
ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_subject_id_fkey 
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

COMMIT;
