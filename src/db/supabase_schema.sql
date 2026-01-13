-- Supabase starter schema for the school management app

-- Enable required extensions for uuid generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- (Alternatively you can enable "uuid-ossp" if you prefer)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Schools
CREATE TABLE IF NOT EXISTS public.schools (
  id text PRIMARY KEY,
  name text NOT NULL,
  province text NOT NULL,
  district text NOT NULL,
  ward text,
  type text,
  standard_capacity int,
  total_enrolment int,
  center_number text UNIQUE
);

-- Profiles (app-level user profiles separate from auth.users)
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

-- Students
CREATE TABLE IF NOT EXISTS public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id text,
  registration_date date,
  enrolment_number text,
  first_name text,
  surname text,
  other_names text,
  national_id text,
  date_of_birth date,
  gender text,
  residential_address text,
  email text,
  current_grade int DEFAULT 1,
  overall_performance text,
  status text DEFAULT 'Active',
  is_orphan boolean DEFAULT false,
  has_disability boolean DEFAULT false,
  is_married boolean DEFAULT false,
  parent_guardian jsonb,
  emergency_contact jsonb,
  medical_info jsonb,
  previous_school text,
  place_of_birth text,
  nationality text,
  religion text,
  documents jsonb,
  birth_certificate_url text,
  birth_certificate_meta jsonb,
  created_at timestamptz DEFAULT now()
);

-- Teachers
CREATE TABLE IF NOT EXISTS public.teachers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  employee_number text,
  first_name text,
  surname text,
  other_names text,
  gender text,
  date_of_birth date,
  national_id text,
  contact_number text,
  email text,
  qualification text,
  subjects jsonb,
  assigned_class_ids text[],
  position text,
  date_employed date,
  status text,
  created_at timestamptz DEFAULT now()
);

-- Classes
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  name text,
  level int,
  stream text,
  capacity int,
  teacher_id uuid,
  subjects jsonb,
  created_at timestamptz DEFAULT now()
);

-- Subjects
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
  name text NOT NULL,
  code text,
  category text DEFAULT 'Core',
  levels int[],
  description text,
  created_at timestamptz DEFAULT now()
);

-- Basic RLS policy examples (apply after enabling RLS)
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "profiles_is_owner_or_admin" ON public.profiles
--   USING ( auth.role() = 'authenticated' );

-- Note: You should design RLS policies carefully, linking auth.users <-> profiles via user id in metadata or a profiles.user_id column.
