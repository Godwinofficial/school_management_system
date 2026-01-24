-- Create Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id text REFERENCES public.classes(id) ON DELETE CASCADE,
  subject text NOT NULL, -- Storing name directly for simplicity as per UI
  date date NOT NULL,
  topic text,
  total_marks int,
  type text, -- 'quiz', 'test', 'exam'
  created_at timestamptz DEFAULT now()
);

-- Create Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id text REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  subject text NOT NULL,
  title text NOT NULL,
  due_date timestamptz,
  total_submissions int DEFAULT 0,
  pending_grading int DEFAULT 0,
  type text, -- 'assignment', 'project', 'presentation'
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Enable all access for now" ON public.exams;
DROP POLICY IF EXISTS "Enable all access for now" ON public.assessments;

CREATE POLICY "Enable all access for now" ON public.exams FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.assessments FOR ALL USING (true);

-- Insert some mock data for demonstration
INSERT INTO public.exams (school_id, class_id, subject, date, topic, total_marks, type)
SELECT 
  s.id,
  c.id,
  'Mathematics',
  CURRENT_DATE + INTERVAL '5 days',
  'Algebra Quiz',
  50,
  'quiz'
FROM public.schools s
JOIN public.classes c ON c.school_id = s.id
LIMIT 1;

INSERT INTO public.assessments (school_id, class_id, teacher_id, subject, title, due_date, total_submissions, pending_grading, type)
SELECT 
  s.id,
  c.id,
  t.id,
  'Science',
  'Physics Lab Report',
  CURRENT_DATE + INTERVAL '2 days',
  25,
  10,
  'assignment'
FROM public.schools s
JOIN public.classes c ON c.school_id = s.id
JOIN public.teachers t ON t.school_id = s.id
LIMIT 1;
