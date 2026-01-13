-- Full Schema Creation Script
-- Run this if your database is completely empty or missing core tables.

-- Enable pgcrypto for UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Create Schools Table
CREATE TABLE IF NOT EXISTS public.schools (
  id text PRIMARY KEY,
  name text NOT NULL,
  province text NOT NULL,
  district text NOT NULL,
  ward text,
  type text,
  standard_capacity int DEFAULT 500,
  total_enrolment int DEFAULT 0,
  center_number text UNIQUE,
  status text DEFAULT 'active',
  email text,
  phone text,
  subscription_plan_id text DEFAULT 'trial',
  billing_cycle text DEFAULT 'monthly',
  subscription_start_date date,
  subscription_expiry_date date,
  created_by text,
  created_at timestamptz DEFAULT now()
);

-- 2. Create Profiles Table (Users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text,
  last_name text,
  role text,
  school_id text REFERENCES public.schools(id) ON DELETE SET NULL,
  province text,
  district text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- 3. Create Teachers Table
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

-- 4. Create Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id text PRIMARY KEY,
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  level int,
  stream text,
  capacity int DEFAULT 40,
  teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- 5. Create Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id text REFERENCES public.classes(id) ON DELETE SET NULL,
  registration_date date,
  enrolment_number text,
  first_name text,
  surname text,
  other_names text,
  national_id text,
  date_of_birth date,
  gender text,
  residential_address text,
  overall_performance text,
  is_orphan boolean DEFAULT false,
  has_disability boolean DEFAULT false,
  birth_certificate_url text,
  birth_certificate_meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- 6. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text,
  levels int[],
  description text
);

-- 7. Enable RLS and Create Open Policies (for development)
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts if re-running
DROP POLICY IF EXISTS "Enable all access for now" ON public.schools;
DROP POLICY IF EXISTS "Enable all access for now" ON public.profiles;
DROP POLICY IF EXISTS "Enable all access for now" ON public.teachers;
DROP POLICY IF EXISTS "Enable all access for now" ON public.classes;
DROP POLICY IF EXISTS "Enable all access for now" ON public.students;
DROP POLICY IF EXISTS "Enable all access for now" ON public.subjects;

CREATE POLICY "Enable all access for now" ON public.schools FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.teachers FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.classes FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.students FOR ALL USING (true);
CREATE POLICY "Enable all access for now" ON public.subjects FOR ALL USING (true);
