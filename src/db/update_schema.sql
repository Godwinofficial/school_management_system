-- Add missing columns to schools table
ALTER TABLE public.schools 
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active',
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS subscription_plan_id text DEFAULT 'trial',
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS subscription_start_date date,
ADD COLUMN IF NOT EXISTS subscription_expiry_date date,
ADD COLUMN IF NOT EXISTS created_by text,
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Create Teachers table
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_number text,
  first_name text NOT NULL,
  surname text NOT NULL,
  other_names text,
  gender text,
  date_of_birth date,
  national_id text,
  contact_number text,
  email text,
  qualification text,
  position text,
  date_employed date,
  status text DEFAULT 'Active',
  created_at timestamptz DEFAULT now()
);

-- Create Classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id text PRIMARY KEY, -- using text id like "{schoolId}_g{level}{stream}"
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  level int,
  stream text,
  capacity int DEFAULT 40,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create Subjects table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  levels int[], -- array of levels this subject applies to
  description text
);

-- RLS Policies
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Simple policies for development handling
CREATE POLICY "Enable all access for now" ON public.schools FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.classes FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.subjects FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.students FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.profiles FOR ALL USING (true);
