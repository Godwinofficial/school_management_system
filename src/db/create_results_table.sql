-- Create Results table to store student grades
CREATE TABLE IF NOT EXISTS public.results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    exam_id TEXT NOT NULL,
    subject TEXT NOT NULL,
    score DECIMAL(5, 2) NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    recorded_by UUID, -- Intentionally loose FK to allow for mock/various auth scenarios
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(student_id, exam_id, subject)
);

-- Enable RLS
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Public access to results" ON public.results;
CREATE POLICY "Public access to results" ON public.results FOR ALL USING (true); -- Relaxed for dev
