-- Add current_grade column to students table
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS current_grade int DEFAULT 1;

-- Add status column if it's missing (though it should be there from update_students_schema.sql)
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

-- Add boolean flags for student status
ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS is_orphan boolean DEFAULT false;

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS has_disability boolean DEFAULT false;

ALTER TABLE public.students 
ADD COLUMN IF NOT EXISTS is_married boolean DEFAULT false;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
