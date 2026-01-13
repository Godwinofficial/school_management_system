-- Timetable Table
CREATE TABLE IF NOT EXISTS public.timetables (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
    class_id uuid REFERENCES public.classes(id) ON DELETE CASCADE,
    teacher_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
    day_of_week int NOT NULL, -- 1=Monday, ..., 5=Friday
    start_time time NOT NULL,
    end_time time NOT NULL,
    room text,
    color text DEFAULT '#3b82f6',
    modified_by uuid REFERENCES public.profiles(id),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
    title text NOT NULL,
    content text NOT NULL,
    audience text NOT NULL, -- 'all', 'teachers', 'students', 'parents'
    pinned boolean DEFAULT false,
    author_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    recipient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    content text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Activity Logs Table
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id text REFERENCES public.schools(id) ON DELETE CASCADE,
    user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    action text NOT NULL,
    details text,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Basic Policies (Update for current custom auth flow)
CREATE POLICY "Enable read for everyone" ON public.timetables FOR SELECT USING (true);
CREATE POLICY "Enable insert for everyone" ON public.timetables FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for everyone" ON public.timetables FOR UPDATE USING (true);
CREATE POLICY "Enable delete for everyone" ON public.timetables FOR DELETE USING (true);

CREATE POLICY "Enable read for everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Enable insert for everyone" ON public.announcements FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable all for everyone" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all for everyone" ON public.activity_logs FOR ALL USING (true) WITH CHECK (true);

-- Enable Realtime for Messaging and Announcements
-- This allows Supabase to broadcast changes via WebSockets
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END $$;

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;


