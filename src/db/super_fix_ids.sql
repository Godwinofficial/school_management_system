-- Comprehensive DB Fix for Timetables (TEXT IDs + Nullable modified_by)
-- This script changes IDs to TEXT and also modifies 'modified_by' to ensure it accepts mock user IDs (like "1").

BEGIN;

-- 1. Drop Dependencies
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_class_id_fkey;
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_subject_id_fkey;
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_modified_by_fkey; -- We need to fix this one too
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_class_id_fkey;

-- 2. Modify Column Types to TEXT
-- Use simple explicit casts to ensure conversion works.
ALTER TABLE public.classes ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.subjects ALTER COLUMN id TYPE text USING id::text;
ALTER TABLE public.students ALTER COLUMN class_id TYPE text USING class_id::text;

ALTER TABLE public.timetables ALTER COLUMN class_id TYPE text USING class_id::text;
ALTER TABLE public.timetables ALTER COLUMN subject_id TYPE text USING subject_id::text;

-- 3. Fix 'modified_by'
-- If the user is logged in as mock user "1", saving to a UUID column will fail.
-- We must change modified_by to TEXT as well.
ALTER TABLE public.timetables ALTER COLUMN modified_by TYPE text USING modified_by::text;

-- 4. Re-establish Foreign Keys
ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_subject_id_fkey 
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

ALTER TABLE public.students
    ADD CONSTRAINT students_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

-- Note: We do NOT add a foreign key for 'modified_by' back to 'profiles'.
-- This is because mock users (ID "1") do not exist in the 'profiles' table (IDs are UUIDs).
-- If we added the FK, it would fail when a mock user tries to save.
-- We leave it as a loose relationship (just storing the ID).

COMMIT;
