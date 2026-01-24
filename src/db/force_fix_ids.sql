-- FORCE FIX for ID types (UUID -> TEXT)
-- This script aggressively fixes issues where classes and subjects have UUID IDs,
-- preventing string IDs (like "1" or "school_slug_g1a") from being saved.

BEGIN;

-- 1. Drop ALL potential foreign keys that might reference 'classes' or 'subjects'
-- We use IF EXISTS to avoid errors if they don't exist.

-- From timetables
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_class_id_fkey;
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_subject_id_fkey;
ALTER TABLE public.timetables DROP CONSTRAINT IF EXISTS timetables_class_id_fkey1; -- Just in case of auto-named constraints

-- From students (if it exists)
ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_class_id_fkey;

-- 2. Modify the 'classes' table
-- Convert ID to text. `USING id::text` handles existing UUIDs.
ALTER TABLE public.classes ALTER COLUMN id TYPE text USING id::text;

-- 3. Modify the 'subjects' table
ALTER TABLE public.subjects ALTER COLUMN id TYPE text USING id::text;

-- 4. Modify the 'timetables' table
-- Convert columns to text
ALTER TABLE public.timetables ALTER COLUMN class_id TYPE text USING class_id::text;
ALTER TABLE public.timetables ALTER COLUMN subject_id TYPE text USING subject_id::text;

-- 5. Modify the 'students' table (ensure class_id is text)
ALTER TABLE public.students ALTER COLUMN class_id TYPE text USING class_id::text;

-- 6. Re-create the Foreign Keys
-- Now that everything is TEXT, we can safely link them.

-- Timetables -> Classes
ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE CASCADE;

-- Timetables -> Subjects
ALTER TABLE public.timetables
    ADD CONSTRAINT timetables_subject_id_fkey 
    FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE SET NULL;

-- Students -> Classes (restore if you want strict integrity, otherwise optional)
-- We'll add it back to be safe, assuming data integrity is good.
-- If this fails (due to invalid data in students), comment the next 2 lines out.
ALTER TABLE public.students
    ADD CONSTRAINT students_class_id_fkey 
    FOREIGN KEY (class_id) REFERENCES public.classes(id) ON DELETE SET NULL;

COMMIT;

-- 7. Add Transfer Support (National Pool)
-- Allow students to be detached from school (school_id NULL) and add transfer tracking
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS transfer_reason TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS transfer_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.students ALTER COLUMN school_id DROP NOT NULL;
